
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import MyAlert from '@/components/Myalert';
import { addTransaction, getTransactions, Transaction } from '@/storage/transactions';
import { colors, globalStyles } from '@/styles/global';
import { getBalance } from '@/utils/finance';

const STORAGE_KEY = '@fingest_goals';

type Priority = 'Baixa' | 'Média' | 'Alta';

type Goal = {
  id: string;
  name: string;
  area: string;
  priority: Priority;
  targetAmount: number;
};

type AlertConfig = {
  title: string;
  message?: string;
  type: 'success' | 'error';
  cancelText?: string;
  confirmText?: string;
  showCancel?: boolean;
  onConfirm: () => void | Promise<void>;
};

const areas = [
  'Viagem',
  'Tecnologia',
  'Casa',
  'Educação',
  'Veículo',
  'Outro',
];

const priorities: Priority[] = ['Baixa', 'Média', 'Alta'];

const formatMoney = (value: number) =>
  value.toLocaleString('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  });

const parseMoney = (value: string) => {
  const parsed = Number(value.replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const getAreaIcon = (area: string): keyof typeof Ionicons.glyphMap => {
  switch (area) {
    case 'Viagem':
      return 'airplane-outline';
    case 'Tecnologia':
      return 'laptop-outline';
    case 'Casa':
      return 'home-outline';
    case 'Educação':
      return 'school-outline';
    case 'Veículo':
      return 'car-outline';
    default:
      return 'flag-outline';
  }
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [savedAmounts, setSavedAmounts] = useState<Record<string, number>>({});
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [moneyModalVisible, setMoneyModalVisible] = useState(false);

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [goalName, setGoalName] = useState('');
  const [goalArea, setGoalArea] = useState('Outro');
  const [goalPriority, setGoalPriority] = useState<Priority>('Média');
  const [targetAmount, setTargetAmount] = useState('');

  const [moneyAmount, setMoneyAmount] = useState('');

  // Estado que controla o MyAlert.
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  // Função reutilizável para apresentar avisos.
  const showAlert = useCallback((config: AlertConfig) => {
    setAlertConfig(config);
  }, []);

  // Fecha o MyAlert.
  const closeAlert = () => {
    setAlertConfig(null);
  };

  // Calcula quanto já foi poupado em cada meta.
  const calculateSavedAmounts = async (allGoals: Goal[]) => {
    const transactions = await getTransactions();

    const amounts: Record<string, number> = {};

    allGoals.forEach((goal) => {
      amounts[goal.id] = transactions
        .filter(
          (transaction: Transaction) =>
            transaction.type === 'despesa' &&
            transaction.goalId === goal.id
        )
        .reduce((total, transaction) => total + transaction.value, 0);
    });

    return amounts;
  };

  // Carrega metas, transações e saldo.
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const storedGoals = await AsyncStorage.getItem(STORAGE_KEY);
      const loadedGoals: Goal[] = storedGoals
        ? JSON.parse(storedGoals)
        : [];

      const amounts = await calculateSavedAmounts(loadedGoals);
      const currentBalance = await getBalance();

      setGoals(loadedGoals);
      setSavedAmounts(amounts);
      setBalance(currentBalance);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);

      showAlert({
        title: 'Erro',
        message: 'Não foi possível carregar as metas.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {},
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Guarda apenas os dados da meta, sem savedAmount.
  const saveGoals = async (updatedGoals: Goal[]) => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedGoals)
    );

    setGoals(updatedGoals);

    const amounts = await calculateSavedAmounts(updatedGoals);
    setSavedAmounts(amounts);

    const currentBalance = await getBalance();
    setBalance(currentBalance);
  };

  // Cria uma meta.
  const createGoal = async () => {
    const amount = parseMoney(targetAmount);

    if (!goalName.trim()) {
      showAlert({
        title: 'Atenção',
        message: 'Introduz o nome da meta.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {},
      });
      return;
    }

    if (amount <= 0) {
      showAlert({
        title: 'Atenção',
        message: 'Introduz um valor válido para a meta.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {},
      });
      return;
    }

    const newGoal: Goal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: goalName.trim(),
      area: goalArea,
      priority: goalPriority,
      targetAmount: amount,
    };

    try {
      setSubmitting(true);
      await saveGoals([...goals, newGoal]);

      setGoalName('');
      setGoalArea('Outro');
      setGoalPriority('Média');
      setTargetAmount('');
      setCreateModalVisible(false);

      showAlert({
        title: 'Meta criada',
        message: 'A tua nova meta foi criada com sucesso.',
        type: 'success',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {},
      });
    } catch (error) {
      console.error('Erro ao criar meta:', error);

      showAlert({
        title: 'Erro',
        message: 'Não foi possível guardar a meta.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {},
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Abre a janela para reforçar uma meta.
  const openMoneyModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setMoneyAmount('');
    setMoneyModalVisible(true);
  };

  // Adiciona dinheiro à meta através de uma transação.
  const addMoney = async () => {
    const amount = parseMoney(moneyAmount);

    if (!selectedGoal) return;

    if (amount <= 0) {
      showAlert({
        title: 'Atenção',
        message: 'Introduz um valor válido.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {},
      });
      return;
    }

    try {
      setSubmitting(true);

      const currentBalance = await getBalance();

      if (amount > currentBalance) {
        showAlert({
          title: 'Saldo insuficiente',
          message: `O teu saldo atual é ${formatMoney(currentBalance)}.`,
          type: 'error',
          showCancel: false,
          confirmText: 'OK',
          onConfirm: () => {},
        });
        return;
      }

      await addTransaction({
        type: 'despesa',
        value: amount,
        category: 'savings',
        description: `Reforço da meta: ${selectedGoal.name}`,
        date: new Date().toISOString(),
        goalId: selectedGoal.id,
      });

      // O valor poupado será recalculado a partir das transações.
      await loadData();

      setMoneyModalVisible(false);
      setMoneyAmount('');
      setSelectedGoal(null);

      showAlert({
        title: 'Sucesso',
        message: `${formatMoney(amount)} adicionados à meta "${selectedGoal.name}".`,
        type: 'success',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {},
      });
    } catch (error) {
      console.error('Erro ao adicionar dinheiro à meta:', error);

      showAlert({
        title: 'Erro',
        message: 'Não foi possível adicionar dinheiro à meta.',
        type: 'error',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: () => {},
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Confirma a eliminação de uma meta através do MyAlert.
  const deleteGoal = (goal: Goal) => {
    showAlert({
      title: 'Eliminar meta',
      message: `Tens a certeza de que queres eliminar "${goal.name}"? As transações associadas não serão eliminadas.`,
      type: 'error',
      cancelText: 'Cancelar',
      confirmText: 'Eliminar',
      onConfirm: async () => {
        try {
          const updatedGoals = goals.filter(
            (item) => item.id !== goal.id
          );

          await saveGoals(updatedGoals);
        } catch (error) {
          console.error('Erro ao eliminar meta:', error);

          showAlert({
            title: 'Erro',
            message: 'Não foi possível eliminar a meta.',
            type: 'error',
            showCancel: false,
            confirmText: 'OK',
            onConfirm: () => {},
          });
        }
      },
    });
  };

  const totalSaved = Object.values(savedAmounts).reduce(
    (total, value) => total + value,
    0
  );

  const totalTarget = goals.reduce(
    (total, goal) => total + goal.targetAmount,
    0
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={globalStyles.title}>As minhas metas</Text>
            <Text style={globalStyles.subtitle}>
              Poupa para aquilo que é importante.
            </Text>
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() => setCreateModalVisible(true)}
          >
            <Ionicons name="add" size={26} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <Ionicons
            name="wallet-outline"
            size={21}
            color={colors.income}
          />
          <View style={styles.balanceTextContainer}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>
              {formatMoney(balance)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[globalStyles.sectionTitle, { marginTop: -5 }]}>
            As tuas metas
          </Text>
          <Text style={[styles.goalCount, { marginTop: -15 }]}>
            {goals.length} {goals.length === 1 ? 'meta' : 'metas'}
          </Text>
        </View>

        {goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="flag-outline"
              size={42}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>Ainda não tens metas</Text>
            <Text style={styles.emptyDescription}>
              Cria a tua primeira meta e começa a poupar.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() => setCreateModalVisible(true)}
            >
              <Text style={styles.emptyButtonText}>Criar meta</Text>
            </Pressable>
          </View>
        ) : (
          goals.map((goal) => {
            const saved = savedAmounts[goal.id] ?? 0;
            const progress =
              goal.targetAmount > 0
                ? Math.min(saved / goal.targetAmount, 1)
                : 0;

            return (
              <Pressable
                key={goal.id}
                style={styles.goalCard}
                onPress={() => openMoneyModal(goal)}
              >
                <View style={styles.goalTop}>
                  <View style={styles.goalIcon}>
                    <Ionicons
                      name={getAreaIcon(goal.area)}
                      size={23}
                      color={colors.primaryLight}
                    />
                  </View>

                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalArea}>{goal.area}</Text>
                  </View>

                  <Pressable
                    hitSlop={10}
                    onPress={() => deleteGoal(goal)}
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </Pressable>
                </View>

                <View style={styles.goalDetails}>
                  <Text style={styles.goalSaved}>
                    {formatMoney(saved)}
                  </Text>
                  <Text style={styles.goalTarget}>
                    de {formatMoney(goal.targetAmount)}
                  </Text>
                </View>

                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </View>

                <View style={styles.goalFooter}>
                  <Text style={styles.progressText}>
                    {Math.round(progress * 100)}% concluído
                  </Text>

                  <View
                    style={[
                      styles.priorityBadge,
                      goal.priority === 'Alta' && styles.highPriority,
                      goal.priority === 'Baixa' && styles.lowPriority,
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      Prioridade {goal.priority.toLowerCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.goalAction}>
                  <Ionicons
                    name="add-circle-outline"
                    size={17}
                    color={colors.primaryLight}
                  />
                  <Text style={styles.goalActionText}>
                    Toca para adicionar dinheiro
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* Modal para criar uma meta */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar nova meta</Text>
              <Pressable onPress={() => setCreateModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={25}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Nome da meta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Comprar um portátil"
              placeholderTextColor={colors.textMuted}
              value={goalName}
              onChangeText={setGoalName}
            />

            <Text style={styles.inputLabel}>Área</Text>
            <View style={styles.optionsContainer}>
              {areas.map((area) => (
                <Pressable
                  key={area}
                  style={[
                    styles.option,
                    goalArea === area && styles.selectedOption,
                  ]}
                  onPress={() => setGoalArea(area)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      goalArea === area && styles.selectedOptionText,
                    ]}
                  >
                    {area}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Prioridade</Text>
            <View style={styles.optionsContainer}>
              {priorities.map((priority) => (
                <Pressable
                  key={priority}
                  style={[
                    styles.option,
                    goalPriority === priority && styles.selectedOption,
                  ]}
                  onPress={() => setGoalPriority(priority)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      goalPriority === priority && styles.selectedOptionText,
                    ]}
                  >
                    {priority}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Valor pretendido (€)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: 1500"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />

            <Pressable
              style={[
                styles.primaryButton,
                submitting && styles.disabledButton,
              ]}
              onPress={createGoal}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Criar meta
                </Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para adicionar dinheiro */}
      <Modal
        visible={moneyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMoneyModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar dinheiro</Text>
              <Pressable onPress={() => setMoneyModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={25}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            {selectedGoal && (
              <>
                <Text style={styles.modalDescription}>
                  Meta: {selectedGoal.name}
                </Text>

                <Text style={styles.modalBalance}>
                  Saldo disponível: {formatMoney(balance)}
                </Text>

                <Text style={styles.inputLabel}>Valor a adicionar (€)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: 50"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={moneyAmount}
                  onChangeText={setMoneyAmount}
                />

                <Pressable
                  style={[
                    styles.primaryButton,
                    submitting && styles.disabledButton,
                  ]}
                  onPress={addMoney}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Confirmar reforço
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Avisos e confirmações personalizados */}
      <MyAlert
        visible={!!alertConfig}
        title={alertConfig?.title}
        message={alertConfig?.message}
        type={alertConfig?.type}
        cancelText={alertConfig?.cancelText}
        confirmText={alertConfig?.confirmText}
        showCancel={alertConfig?.showCancel}
        onCancel={closeAlert}
        onConfirm={() => {
          const action = alertConfig?.onConfirm;

          closeAlert();

          if (action) {
            void action();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 14,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  summaryAmount: {
    color: colors.text,
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 7,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 17,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summarySmallLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  summarySmallValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginBottom: 26,
  },
  balanceTextContainer: {
    marginLeft: 12,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  balanceValue: {
    color: colors.income,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -10,
  },
  goalCount: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 13,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 7,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
    marginTop: 18,
  },
  emptyButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 17,
    marginBottom: 14,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  goalName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  goalArea: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  goalDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
    marginBottom: 10,
  },
  goalSaved: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  goalTarget: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 6,
  },
  progressBackground: {
    height: 9,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  priorityBadge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  highPriority: {
    backgroundColor: colors.expenseBackground,
  },
  lowPriority: {
    backgroundColor: colors.incomeBackground,
  },
  priorityText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  goalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  goalActionText: {
    color: colors.primaryLight,
    fontSize: 12,
    marginLeft: 7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 35 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
  },
  modalBalance: {
    color: colors.income,
    fontSize: 13,
    marginBottom: 20,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 9,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  selectedOption: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  selectedOptionText: {
    color: colors.white,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    minHeight: 50,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
