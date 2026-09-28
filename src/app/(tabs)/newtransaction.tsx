import MyAlert from '@/components/Myalert';
import { addTransaction } from '@/storage/transactions';
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
  //-----------Variáveis de estado para armazenar os valores dos inputs

  const [category, setCategory] = useState(''); // Guarda a categoria da transação
  const [description, setDescription] = useState(''); // Guarda Descrição da transação
  const [date, setDate] = useState(new Date()); // Guarda a data da transação
  const [transacao, setTransacao] = useState('despesa'); // Guarda o tipo de transação
  const [valor, setValor] = useState('');//Guarda o valor da transação

  //----------Variaveis de controle de alertas e datepicker
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertError, setAlertError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  //Funções
  function handleSubmit() {

    // Troca vírgula por ponto para conseguirmos converter para número
    const valorNumerico = Number(valor.replace(',', '.'));

    // Verifica o valor
    if (!valor || valorNumerico <= 0 || isNaN(valorNumerico)) {
        setAlertTitle('Valor inválido');
        setAlertMessage('Introduz um valor superior a 0 €.');
        setAlertError(true);
        setShowAlert(true);
        return;
    }
    
    // Verifica a categoria
    if (!category) {
        setAlertTitle('Categoria em falta');
        setAlertMessage('Seleciona uma categoria para a transação.');
        setAlertError(true);
        setShowAlert(true);
        return;
    }

    // Se chegou aqui, está tudo correto
    setAlertTitle(
        transacao === 'despesa'
        ? 'Adicionar despesa?'
        : 'Adicionar receita?'
    );

    setAlertMessage(
        `Valor: ${valorNumerico.toFixed(2)} €\n` +
        `Categoria: ${category}\n` +
        `Data: ${date.toLocaleDateString('pt-PT')}\n` +
        `Descrição: ${description || 'Sem descrição'}`
    );

    setAlertError(false);
    setShowAlert(true);
}

async function confirmTransaction() {
  await addTransaction({
    type: transacao as 'despesa' | 'receita',
    value: Number(valor.replace(',', '.')),
    category: category,
    description: description,
    date: date.toISOString(),
  });

  setShowAlert(false);

  console.log('TRANSAÇÃO GUARDADA');
}

//----------------------------------Codico da Pagina
  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* ------------------------------ Titulo */}
      <Text
        style={[
          globalStyles.sectionTitle,
          { textAlign: 'center', marginTop: 40 },
        ]}
      >
        New Transaction
      </Text>

      {/* ------------------------------ Botões */}
        <View
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            marginBottom: 20,
            width: '100%',
            gap: 10,
        }}
        >
        {/* Despesas */}
        <Pressable
            style={[
            styles.transactionButton,
            transacao === 'despesa' && styles.transactionButtonSelected,
            { flex: 1 },
            ]}
            onPress={() => setTransacao('despesa')}
        >
            <Text
            style={[
                styles.transactionButtonText,
                transacao === 'despesa' && styles.transactionButtonTextSelected,
            ]}
            >
            Despesas
            </Text>
        </Pressable>

        {/* Receitas */}
        <Pressable
            style={[
            styles.transactionButton,
            transacao === 'receita' && styles.transactionButtonSelected,
            { flex: 1 },
            ]}
            onPress={() => setTransacao('receita')}
        >
            <Text
            style={[
                styles.transactionButtonText,
                transacao === 'receita' && styles.transactionButtonTextSelected,
            ]}
            >
            Receitas
            </Text>
        </Pressable>
        </View>

      {/* ------------------------------ Valor */}
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

      {/* ------------------------------ Categorias / checkboxes (guarda na variavel category) */}
      <View style={styles.categories}>
        <Pressable
          style={[
            styles.category,
            category === 'food' && styles.categorySelected,
          ]}
          onPress={() => setCategory('food')}
        >
          <Ionicons
            name="restaurant-outline"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Alimentação
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'transport' && styles.categorySelected,
          ]}
          onPress={() => setCategory('transport')}
        >
          <Ionicons
            name="car-outline"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Transporte
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.category,
            category === 'house' && styles.categorySelected,
          ]}
          onPress={() => setCategory('house')}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Moradia
          </Text>
        </Pressable>

        {/* Lazer */}
        <Pressable
          style={[
            styles.category,
            category === 'leisure' && styles.categorySelected,
          ]}
          onPress={() => setCategory('leisure')}
        >
          <Ionicons
            name="game-controller-outline"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Lazer
          </Text>
        </Pressable>

        {/* Saúde */}
        <Pressable
          style={[
            styles.category,
            category === 'health' && styles.categorySelected,
          ]}
          onPress={() => setCategory('health')}
        >
          <Ionicons
            name="heart-outline"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Saúde
          </Text>
        </Pressable>

        {/* Educação */}
        <Pressable
          style={[
            styles.category,
            category === 'education' && styles.categorySelected,
          ]}
          onPress={() => setCategory('education')}
        >
          <Ionicons
            name="book-outline"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Educação
          </Text>
        </Pressable>

        {/* Compras */}
        <Pressable
          style={[
            styles.category,
            category === 'shopping' && styles.categorySelected,
          ]}
          onPress={() => setCategory('shopping')}
        >
          <Ionicons
            name="bag-outline"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Compras
          </Text>
        </Pressable>

        {/* Contas */}
        <Pressable
          style={[
            styles.category,
            category === 'bills' && styles.categorySelected,
          ]}
          onPress={() => setCategory('bills')}
        >
          <Ionicons
            name="document-text-outline"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Contas
          </Text>
        </Pressable>

        {/* Outros */}
        <Pressable
          style={[
            styles.category,
            category === 'other' && styles.categorySelected,
          ]}
          onPress={() => setCategory('other')}
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color="white"
          />

          <Text style={styles.categoryText}>
            Outros
          </Text>
        </Pressable>
      </View>

      {/* --------------------------------- Inputs */}
      <TextInput
        style={[globalStyles.input, { marginTop: 20 }]}
        placeholder="Descrição"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
      />

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

      <Pressable
        style={[globalStyles.primaryButton, { marginTop: 20 }]}
        onPress={handleSubmit}
      >
        <Text style={globalStyles.primaryButtonText}>
          adicionar {transacao}
        </Text>
      </Pressable>

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
  // -------------------- Valor

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

  // -------------------- Categorias

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

  // -------------------- Data

  dateInput: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // -------------------- Tipo de transação

transactionButton: {
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
});