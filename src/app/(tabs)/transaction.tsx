import TransactionItem from '@/components/TransactionItems';
import {
    getTransactions,
    Transaction
} from '@/storage/transactions';
import { colors, globalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';


export default function TransactionsScreen() {

  // Filtro selecionado
  const [filtro, setFiltro] = useState('all');

  // Todas as transações
  const [transactions, setTransactions] = useState<Transaction[]>([]);


  // -------------------- Carregar transações

  async function loadTransactions() {

    const data = await getTransactions();

    // Ordenar da data mais recente para a mais antiga
    const sortedTransactions = data.sort((a, b) => {
      return (
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
      );
    });

    setTransactions(sortedTransactions);
  }


  // Atualiza as transações sempre que entramos nesta página
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );


  // -------------------- Filtrar transações

  const filteredTransactions = transactions.filter((transaction) => {

    // "Tudo" mostra todas
    if (filtro === 'all') {
      return true;
    }

    // Caso contrário mostra apenas despesas ou receitas
    return transaction.type === filtro;
  });


  // -------------------- Agrupar por mês

  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {

      // Exemplo: "setembro de 2026"
      const month = new Date(transaction.date).toLocaleDateString(
        'pt-PT',
        {
          month: 'long',
          year: 'numeric',
        }
      );


      // Se o mês ainda não existir, cria um array para ele
      if (!groups[month]) {
        groups[month] = [];
      }


      // Adiciona a transação ao respetivo mês
      groups[month].push(transaction);

      return groups;
    },

    {} as Record<string, Transaction[]>
  );


  return (

    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >

      {/* -------------------- Título */}

      <Text
        style={[
          globalStyles.sectionTitle,
          { marginTop: 40 }
        ]}
      >
        Transações
      </Text>


      {/* -------------------- Filtros */}

      <View style={styles.filterContainer}>

        {/* Tudo */}

        <Pressable
          style={[
            styles.transactionButton,
            filtro === 'all' &&
              styles.transactionButtonSelected,
          ]}
          onPress={() => setFiltro('all')}
        >
          <Text
            style={[
              styles.transactionButtonText,
              filtro === 'all' &&
                styles.transactionButtonTextSelected,
            ]}
          >
            Tudo
          </Text>
        </Pressable>


        {/* Despesas */}

        <Pressable
          style={[
            styles.transactionButton,
            filtro === 'despesa' &&
              styles.transactionButtonSelected,
          ]}
          onPress={() => setFiltro('despesa')}
        >

          <View style={styles.buttonContent}>

            <View style={styles.expenseDot} />

            <Text
              style={[
                styles.transactionButtonText,
                filtro === 'despesa' &&
                  styles.transactionButtonTextSelected,
              ]}
            >
              Despesas
            </Text>

          </View>

        </Pressable>


        {/* Receitas */}

        <Pressable
          style={[
            styles.transactionButton,
            filtro === 'receita' &&
              styles.transactionButtonSelected,
          ]}
          onPress={() => setFiltro('receita')}
        >

          <View style={styles.buttonContent}>

            <View style={styles.incomeDot} />

            <Text
              style={[
                styles.transactionButtonText,
                filtro === 'receita' &&
                  styles.transactionButtonTextSelected,
              ]}
            >
              Receitas
            </Text>

          </View>

        </Pressable>

      </View>


      {/* -------------------- Lista */}

      <View>

        {filteredTransactions.length === 0 ? (

          <Text style={globalStyles.empty}>
            Ainda não existem transações.
          </Text>

        ) : (

          // Cada entrada representa um mês
          Object.entries(groupedTransactions).map(
            ([month, monthTransactions]) => (

              <View
                key={month}
                style={styles.monthSection}
              >

                {/* Nome do mês */}

                <Text style={styles.monthTitle}>
                  {month}
                </Text>


                {/* Card que contém todas as transações do mês */}

                <View style={styles.monthCard}>

                  {monthTransactions.map((transaction) => (

                    <TransactionItem
                      key={transaction.id}

                      id={transaction.id}
                      type={transaction.type}
                      value={transaction.value}
                      category={transaction.category}
                      description={transaction.description}
                      date={transaction.date}
                      createdAt={transaction.createdAt}

                      onDelete={loadTransactions}
                    />

                  ))}

                </View>

              </View>

            )
          )

        )}

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  // -------------------- Filtros

  filterContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 8,
    marginBottom: 15,
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
    fontSize: 14,
    fontWeight: '600',
  },

  transactionButtonTextSelected: {
    color: colors.white,
  },


  // Conteúdo dos botões Despesas / Receitas

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  expenseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.expense,
  },

  incomeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.income,
  },


  // -------------------- Meses

  monthSection: {
    marginTop: 20,
  },

  monthTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',

    marginBottom: 10,

    // "setembro" → "Setembro"
    textTransform: 'capitalize',
  },


  // Card que contém TODAS as transações do mês

  monthCard: {
    backgroundColor: colors.surface,

    borderRadius: 20,
    marginHorizontal: -10,
    // Faz o conteúdo respeitar os cantos arredondados
    overflow: 'hidden',
  },

});