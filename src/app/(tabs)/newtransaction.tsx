
import MyAlert from '@/components/Myalert';
import {
  addTransaction,
  type RecurrenceUnit,
} from '@/storage/transactions';
import { colors, globalStyles } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function HomeScreen() {
  // Variáveis da transação
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [transacao, setTransacao] = useState<'despesa' | 'receita'>('despesa');
  const [valor, setValor] = useState('');

  // Repetição
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');
  const [recurrenceUnit, setRecurrenceUnit] =
    useState<RecurrenceUnit>('months');

  // Alertas e datepicker
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertError, setAlertError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  function getRecurrenceDescription() {
    const interval = Number(recurrenceInterval);

    const unitLabels = {
      days: interval === 1 ? 'dia' : 'dias',
      weeks: interval === 1 ? 'semana' : 'semanas',
      months: interval === 1 ? 'mês' : 'meses',
    };

    return `A cada ${interval} ${unitLabels[recurrenceUnit]}`;
  }

  function handleSubmit() {
    const valorNumerico = Number(valor.replace(',', '.'));

    if (!valor || valorNumerico <= 0 || isNaN(valorNumerico)) {
      setAlertTitle('Valor inválido');
      setAlertMessage('Introduz um valor superior a 0 €.');
      setAlertError(true);
      setShowAlert(true);
      return;
    }

    if (!category) {
      setAlertTitle('Categoria em falta');
      setAlertMessage('Seleciona uma categoria para a transação.');
      setAlertError(true);
      setShowAlert(true);
      return;
    }

    if (recurrenceEnabled) {
      const interval = Number(recurrenceInterval);

      if (
        !recurrenceInterval.trim() ||
        !Number.isInteger(interval) ||
        interval <= 0
      ) {
        setAlertTitle('Intervalo inválido');
        setAlertMessage(
          'Introduz um número inteiro superior a zero para a repetição.'
        );
        setAlertError(true);
        setShowAlert(true);
        return;
      }
    }

    setAlertTitle(
      transacao === 'despesa'
        ? 'Adicionar despesa?'
        : 'Adicionar receita?'
    );

    setAlertMessage(
      `Valor: ${valorNumerico.toFixed(2)} €\n` +
      `Categoria: ${category}\n` +
      `Data: ${date.toLocaleDateString('pt-PT')}\n` +
      `Descrição: ${description || 'Sem descrição'}\n` +
      (
        recurrenceEnabled
          ? `Repetição: ${getRecurrenceDescription()}`
          : 'Repetição: Não'
      )
    );

    setAlertError(false);
    setShowAlert(true);
  }

  async function confirmTransaction() {
    try {
      await addTransaction({
        type: transacao,
        value: Number(valor.replace(',', '.')),
        category,
        description,
        date: date.toISOString(),

        recurrence: recurrenceEnabled
          ? {
              interval: Number(recurrenceInterval),
              unit: recurrenceUnit,
            }
          : undefined,
      });

      setShowAlert(false);

      console.log('TRANSAÇÃO GUARDADA');
    } catch (error) {
      console.error('Erro ao guardar transação:', error);

      setShowAlert(false);
      setAlertTitle('Erro');
      setAlertMessage('Não foi possível guardar a transação.');
      setAlertError(true);
      setShowAlert(true);
    }
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Título */}
      <Text
        style={[
          globalStyles.sectionTitle,
          { textAlign: 'center', marginTop: 40 },
        ]}
      >
        New Transaction
      </Text>

      {/* Botões de despesas e receitas */}
      <View style={styles.transactionTypeContainer}>
        <Pressable
          style={[
            styles.transactionButton,
            transacao === 'despesa' && styles.transactionButtonSelected,
          ]}
          onPress={() => setTransacao('despesa')}
        >
          <Text
            style={[
              styles.transactionButtonText,
              transacao === 'despesa' &&
                styles.transactionButtonTextSelected,
            ]}
          >
            Despesas
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.transactionButton,
            transacao === 'receita' && styles.transactionButtonSelected,
          ]}
          onPress={() => setTransacao('receita')}
        >
          <Text
            style={[
              styles.transactionButtonText,
              transacao === 'receita' &&
                styles.transactionButtonTextSelected,
            ]}
          >
            Receitas
          </Text>
        </Pressable>
      </View>

      {/* Valor */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>
          Valor da transação
        </Text>

        <View style={styles.amountRow}>
          <Text style={styles.currency}>€</Text>

          <TextInput
            style={styles.amountInput}
            placeholder="0,00"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={valor}
            onChangeText={setValor}
          />
        </View>

        <View style={styles.amountLine} />
      </View>

      {/* Categorias */}
      <View style={styles.categories}>
        <Pressable
          style={[
            styles.category,
            category === 'food' && styles.categorySelected,
          ]}
          onPress={() => setCategory('food')}
        >
          <Ionicons name="restaurant-outline" size={24} color="white" />
          <Text style={styles.categoryText}>Alimentação</Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'transport' && styles.categorySelected,
          ]}
          onPress={() => setCategory('transport')}
        >
          <Ionicons name="car-outline" size={24} color="white" />
          <Text style={styles.categoryText}>Transporte</Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'transaction' && styles.categorySelected,
          ]}
          onPress={() => setCategory('transaction')}
        >
          <Ionicons name="swap-horizontal-outline" size={24} color="white" />
          <Text style={styles.categoryText}>Transação</Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'leisure' && styles.categorySelected,
          ]}
          onPress={() => setCategory('leisure')}
        >
          <Ionicons name="game-controller-outline" size={24} color="white" />
          <Text style={styles.categoryText}>Lazer</Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'health' && styles.categorySelected,
          ]}
          onPress={() => setCategory('health')}
        >
          <Ionicons name="heart-outline" size={24} color="white" />
          <Text style={styles.categoryText}>Saúde</Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'education' && styles.categorySelected,
          ]}
          onPress={() => setCategory('education')}
        >
          <Ionicons name="book-outline" size={24} color="white" />
          <Text style={styles.categoryText}>Educação</Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'shopping' && styles.categorySelected,
          ]}
          onPress={() => setCategory('shopping')}
        >
          <Ionicons name="bag-outline" size={24} color="white" />
          <Text style={styles.categoryText}>Compras</Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'bills' && styles.categorySelected,
          ]}
          onPress={() => setCategory('bills')}
        >
          <Ionicons name="document-text-outline" size={24} color="white" />
          <Text style={styles.categoryText}>Contas</Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'other' && styles.categorySelected,
          ]}
          onPress={() => setCategory('other')}
        >
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          <Text style={styles.categoryText}>Outros</Text>
        </Pressable>
      </View>

      {/* Descrição */}
      <TextInput
        style={[globalStyles.input, { marginTop: 20 }]}
        placeholder="Descrição"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
      />

      {/* Data */}
      <Pressable
        style={[globalStyles.input, styles.dateInput]}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons
          name="calendar-outline"
          size={22}
          color={colors.textSecondary}
        />

        <Text style={{ color: colors.text }}>
          {date.toLocaleDateString('pt-PT')}
        </Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);

            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      {/* Repetição */}
      <View style={styles.recurrenceContainer}>
        <Pressable
          style={styles.recurrenceHeader}
          onPress={() => setRecurrenceEnabled(!recurrenceEnabled)}
        >
          <View style={styles.recurrenceTitleContainer}>
            <Ionicons
              name="repeat-outline"
              size={22}
              color={colors.primaryLight}
            />

            <View>
              <Text style={styles.recurrenceTitle}>
                Repetir transação
              </Text>

              <Text style={styles.recurrenceDescription}>
                {recurrenceEnabled
                  ? getRecurrenceDescription()
                  : 'Não repetir'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.toggle,
              recurrenceEnabled && styles.toggleActive,
            ]}
          >
            <View
              style={[
                styles.toggleCircle,
                recurrenceEnabled && styles.toggleCircleActive,
              ]}
            />
          </View>
        </Pressable>

        {recurrenceEnabled && (
          <View style={styles.recurrenceOptions}>
            <Text style={styles.recurrenceLabel}>
              Repetir de quanto em quanto?
            </Text>

            <View style={styles.recurrenceInputRow}>
              <TextInput
                style={styles.recurrenceInput}
                value={recurrenceInterval}
                onChangeText={setRecurrenceInterval}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.recurrenceEvery}>
                unidades
              </Text>
            </View>

            <View style={styles.recurrenceUnits}>
              {([
                { value: 'days', label: 'Dias' },
                { value: 'weeks', label: 'Semanas' },
                { value: 'months', label: 'Meses' },
              ] as const).map((unit) => (
                <Pressable
                  key={unit.value}
                  style={[
                    styles.recurrenceUnit,
                    recurrenceUnit === unit.value &&
                      styles.recurrenceUnitSelected,
                  ]}
                  onPress={() => setRecurrenceUnit(unit.value)}
                >
                  <Text
                    style={[
                      styles.recurrenceUnitText,
                      recurrenceUnit === unit.value &&
                        styles.recurrenceUnitTextSelected,
                    ]}
                  >
                    {unit.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.recurrenceHint}>
              A transação será criada automaticamente quando chegar a data
              prevista, desde que abras a aplicação.
            </Text>
          </View>
        )}
      </View>

      {/* Adicionar */}
      <Pressable
        style={[globalStyles.primaryButton, { marginTop: 20 }]}
        onPress={handleSubmit}
      >
        <Text style={globalStyles.primaryButtonText}>
          adicionar {transacao}
        </Text>
      </Pressable>

      {/* Alerta */}
      <MyAlert
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        showCancel={!alertError}
        cancelText="Cancelar"
        confirmText={alertError ? 'OK' : 'Adicionar'}
        onCancel={() => setShowAlert(false)}
        type={alertError ? 'error' : 'success'}
        onConfirm={() => {
          if (alertError) {
            setShowAlert(false);
          } else {
            confirmTransaction();
          }
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Valor
  amountContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },

  amountLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 5,
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  currency: {
    color: colors.textSecondary,
    fontSize: 28,
    fontWeight: '600',
    marginRight: 6,
  },

  amountInput: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '700',
    minWidth: 100,
    textAlign: 'center',
    paddingVertical: 5,
  },

  amountLine: {
    width: 150,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 2,
  },

  // Categorias
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 20,
  },

  category: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#191D28',
  },

  categorySelected: {
    backgroundColor: '#6758FF',
  },

  categoryText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 12,
  },

  // Data
  dateInput: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Tipo de transação
  transactionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
    width: '100%',
    gap: 10,
  },

  transactionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },

  transactionButtonSelected: {
    backgroundColor: colors.primary,
  },

  transactionButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },

  transactionButtonTextSelected: {
    color: colors.white,
  },

  // Repetição
  recurrenceContainer: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  recurrenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  recurrenceTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  recurrenceTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },

  recurrenceDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  toggle: {
    width: 46,
    height: 26,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    padding: 3,
  },

  toggleActive: {
    backgroundColor: colors.primary,
  },

  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },

  toggleCircleActive: {
    alignSelf: 'flex-end',
  },

  recurrenceOptions: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },

  recurrenceLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },

  recurrenceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  recurrenceInput: {
    backgroundColor: colors.surfaceLight,
    color: colors.text,
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
    fontWeight: '600',
    width: 80,
    textAlign: 'center',
  },

  recurrenceEvery: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  recurrenceUnits: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  recurrenceUnit: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },

  recurrenceUnitSelected: {
    backgroundColor: colors.primary,
  },

  recurrenceUnitText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  recurrenceUnitTextSelected: {
    color: colors.white,
  },

  recurrenceHint: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },
});
