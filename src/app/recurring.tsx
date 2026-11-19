
import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import MyAlert from '@/components/Myalert';

import {
    cancelRecurringTransaction,
    getRecurringTransactions,
    type Transaction,
} from '@/storage/transactions';

import { colors } from '@/styles/global';

// --------------------------------------------------
// ECRÃ DE COBRANÇAS RECORRENTES
// --------------------------------------------------

export default function RecurringScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [recurringToCancel, setRecurringToCancel] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // CARREGAR RECORRÊNCIAS
  // --------------------------------------------------

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getRecurringTransactions();

      const sortedTransactions = [...data].sort(
        (a, b) =>
          new Date(a.recurrence!.nextDate).getTime() -
          new Date(b.recurrence!.nextDate).getTime()
      );

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error('Erro ao carregar recorrências:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // --------------------------------------------------
  // FORMATAÇÃO DA FREQUÊNCIA
  // --------------------------------------------------

  function getRecurrenceLabel(transaction: Transaction) {
    const recurrence = transaction.recurrence;

    if (!recurrence) return '';

    const { interval, unit } = recurrence;

    if (unit === 'days') {
      return interval === 1
        ? 'Todos os dias'
        : `A cada ${interval} dias`;
    }

    if (unit === 'weeks') {
      return interval === 1
        ? 'Todas as semanas'
        : `A cada ${interval} semanas`;
    }

    return interval === 1
      ? 'Todos os meses'
      : `A cada ${interval} meses`;
  }

  // --------------------------------------------------
  // FORMATAR DATA
  // --------------------------------------------------

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  // --------------------------------------------------
  // ABRIR / FECHAR DETALHES
  // --------------------------------------------------

  function toggleDetails(id: string) {
    setSelectedId((currentId) =>
      currentId === id ? null : id
    );
  }

  // --------------------------------------------------
  // PREPARAR CANCELAMENTO
  // --------------------------------------------------

  function confirmCancelRecurring(id: string) {
    setRecurringToCancel(id);
    setShowCancelAlert(true);
  }

  // --------------------------------------------------
  // FECHAR ALERTA
  // --------------------------------------------------

  function closeCancelAlert() {
    setShowCancelAlert(false);
    setRecurringToCancel(null);
  }

  // --------------------------------------------------
  // CANCELAR RECORRÊNCIA
  // --------------------------------------------------

  async function handleCancelRecurring() {
    if (!recurringToCancel) return;

    try {
      await cancelRecurringTransaction(recurringToCancel);

      setShowCancelAlert(false);
      setRecurringToCancel(null);
      setSelectedId(null);

      await loadData();
    } catch (error) {
      console.error('Erro ao cancelar recorrência:', error);
    }
  }

  // --------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------

  return (
    <View style={styles.container}>

      {/* CABEÇALHO */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            Cobranças recorrentes
          </Text>

          <Text style={styles.subtitle}>
            Gere as tuas cobranças automáticas
          </Text>
        </View>
      </View>

      {/* CONTEÚDO */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* INFORMAÇÃO */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="repeat-outline"
              size={24}
              color={colors.primaryLight}
            />
          </View>

          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>
              As tuas recorrências
            </Text>

            <Text style={styles.infoDescription}>
              Aqui podes consultar as cobranças programadas
              e cancelar as que já não pretendes manter.
            </Text>
          </View>
        </View>

        {/* TÍTULO DA LISTA */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recorrências ativas
          </Text>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {transactions.length}
            </Text>
          </View>
        </View>

        {/* A CARREGAR */}

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              A carregar recorrências...
            </Text>
          </View>
        ) : transactions.length === 0 ? (

          /* SEM RECORRÊNCIAS */

          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="repeat-outline"
                size={30}
                color={colors.textMuted}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Sem cobranças recorrentes
            </Text>

            <Text style={styles.emptyText}>
              Quando criares uma transação recorrente,
              ela vai aparecer aqui.
            </Text>
          </View>

        ) : (

          /* LISTA DE RECORRÊNCIAS */

          <View style={styles.list}>

            {transactions.map((transaction) => {
              const isSelected = selectedId === transaction.id;

              return (
                <View
                  key={transaction.id}
                  style={styles.transactionCard}
                >

                  {/* RESUMO DA TRANSAÇÃO */}

                  <Pressable
                    style={styles.transactionMain}
                    onPress={() => toggleDetails(transaction.id)}
                  >
                    <View style={styles.transactionIcon}>
                      <Ionicons
                        name={
                          transaction.type === 'despesa'
                            ? 'arrow-up'
                            : 'arrow-down'
                        }
                        size={21}
                        color={
                          transaction.type === 'despesa'
                            ? colors.expense
                            : colors.income
                        }
                      />
                    </View>

                    <View style={styles.transactionInfo}>
                      <Text
                        style={styles.transactionDescription}
                        numberOfLines={1}
                      >
                        {transaction.description || 'Sem descrição'}
                      </Text>

                      <Text style={styles.transactionFrequency}>
                        {getRecurrenceLabel(transaction)}
                      </Text>
                    </View>

                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionValue,
                          {
                            color:
                              transaction.type === 'despesa'
                                ? colors.expense
                                : colors.income,
                          },
                        ]}
                      >
                        {transaction.type === 'despesa' ? '-' : '+'}
                        {transaction.value.toFixed(2)} €
                      </Text>

                      <Ionicons
                        name={
                          isSelected
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={18}
                        color={colors.textSecondary}
                      />
                    </View>
                  </Pressable>

                  {/* DETALHES EXPANDIDOS */}

                  {isSelected && (
                    <View style={styles.detailsContainer}>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          Categoria
                        </Text>

                        <Text style={styles.detailValue}>
                          {transaction.category}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          Frequência
                        </Text>

                        <Text style={styles.detailValue}>
                          {getRecurrenceLabel(transaction)}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          Próxima cobrança
                        </Text>

                        <Text style={styles.detailValue}>
                          {formatDate(transaction.recurrence!.nextDate)}
                        </Text>
                      </View>

                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>
                          Criada em
                        </Text>

                        <Text style={styles.detailValue}>
                          {formatDate(transaction.createdAt)}
                        </Text>
                      </View>

                      {/* BOTÃO CANCELAR */}

                      <Pressable
                        style={({ pressed }) => [
                          styles.cancelRecurringButton,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() =>
                          confirmCancelRecurring(transaction.id)
                        }
                      >
                        <Ionicons
                          name="close-circle-outline"
                          size={19}
                          color={colors.expense}
                        />

                        <Text style={styles.cancelRecurringText}>
                          Cancelar
                        </Text>
                      </Pressable>

                    </View>
                  )}

                </View>
              );
            })}

          </View>
        )}

      </ScrollView>

      {/* ALERTA DE CANCELAMENTO */}

      <MyAlert
        visible={showCancelAlert}
        type="error"
        title="Cancelar recorrência?"
        message="Tens a certeza de que queres cancelar esta recorrência? As próximas cobranças deixarão de ser geradas. As transações anteriores serão mantidas."
        cancelText="Manter"
        confirmText="Cancelar"
        onCancel={closeCancelAlert}
        onConfirm={handleCancelRecurring}
      />

    </View>
  );
}

// ==================================================
// ESTILOS
// ==================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // CABEÇALHO

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    gap: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
  },

  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  // CARTÃO DE INFORMAÇÃO

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
  },

  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },

  infoDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  // TÍTULO DA LISTA

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 14,
    gap: 9,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },

  countBadge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  countText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },

  // LISTA

  list: {
    gap: 12,
  },

  transactionCard: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  transactionMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },

  transactionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },

  transactionDescription: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  transactionFrequency: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },

  transactionRight: {
    alignItems: 'flex-end',
    gap: 7,
  },

  transactionValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // DETALHES

  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 15,
    backgroundColor: colors.surfaceLight,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
    gap: 10,
  },

  detailLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  detailValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },

  // BOTÃO CANCELAR

  cancelRecurringButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.expenseBackground,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 5,
  },

  cancelRecurringText: {
    color: colors.expense,
    fontSize: 13,
    fontWeight: '700',
  },

  // ESTADO VAZIO

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 25,
    paddingVertical: 35,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  emptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },

});
