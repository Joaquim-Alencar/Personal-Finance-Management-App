import TransactionItem from '@/components/TransactionItems';
import { getTransactions } from '@/storage/transactions';
import { globalStyles } from '@/styles/global';

import {
  getBalance,
  getMonthlyBalance,
  getMonthlyBalanceType,
  getPercentage,
} from '@/utils/finance';

import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useCallback, useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


// --------------------------------------------------
// Tipo da transação
// --------------------------------------------------

type Transaction = {
  id: string;
  type: 'despesa' | 'receita';
  value: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
};


export default function HomeScreen() {

  // --------------------------------------------------
  // Valores financeiros
  // --------------------------------------------------

  const [saldo, setSaldo] = useState(0);

  const [monthlyBalance, setMonthlyBalance] = useState(0);

  const [monthlyIncome, setMonthlyIncome] = useState(0);

  const [monthlyExpense, setMonthlyExpense] = useState(0);


  // --------------------------------------------------
  // Transações recentes
  // --------------------------------------------------

  const [recentTransactions, setRecentTransactions] =
    useState<Transaction[]>([]);


  // --------------------------------------------------
  // Carregar dados
  // --------------------------------------------------

  async function loadFinanceData() {

    const total = await getBalance();

    const monthly = await getMonthlyBalance();

    const income =
      await getMonthlyBalanceType('receita');

    const expense =
      await getMonthlyBalanceType('despesa');

    const transactions =
      await getTransactions();


    // -------------------- Dados financeiros

    setSaldo(total);

    setMonthlyBalance(monthly);

    setMonthlyIncome(income);

    setMonthlyExpense(Math.abs(expense));


    // -------------------- Transações recentes

    // Criamos uma cópia antes do sort para não alterar
    // diretamente o array original.

    const sortedTransactions = [...transactions].sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );


    // Apenas as 4 transações mais recentes

    setRecentTransactions(
      sortedTransactions.slice(0, 3)
    );
  }


  // --------------------------------------------------
  // Atualizar quando entramos na Home
  // --------------------------------------------------

  useFocusEffect(
    useCallback(() => {

      loadFinanceData();

    }, [])
  );


  // --------------------------------------------------
  // Percentagem mensal
  // --------------------------------------------------

  const previousBalance =
    saldo - monthlyBalance;


  const monthlyPercentage =
    getPercentage(
      saldo,
      previousBalance
    );


  // --------------------------------------------------
  // Cor da percentagem
  // --------------------------------------------------

  const percentageColor =
    monthlyPercentage > 0
      ? '#6EE7A8'
      : monthlyPercentage < 0
      ? '#FF6B6B'
      : '#FFD166';


  // --------------------------------------------------
  // Ícone da percentagem
  // --------------------------------------------------

  const percentageIcon:
    keyof typeof Ionicons.glyphMap =
      monthlyPercentage > 0
        ? 'trending-up'
        : monthlyPercentage < 0
        ? 'trending-down'
        : 'remove';


  return (

    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{
        paddingBottom: 100,
      }}
    >


      {/* ==================================================
          TÍTULO
      ================================================== */}

      <Text
        style={[
          globalStyles.title,
          { marginTop: 40 },
        ]}
      >
        Bem Vindo de Volta
      </Text>


      <Text
        style={[
          globalStyles.smallText,
          { marginTop: 0 },
        ]}
      >
        Aqui está o resumo das suas finanças
      </Text>



      {/* ==================================================
          CARD DO SALDO
      ================================================== */}

      <View style={styles.balanceCard}>

        <View style={styles.balanceHeader}>

          <View>

            <Text style={styles.balanceLabel}>
              Saldo atual
            </Text>

            <Text style={styles.balanceValue}>
              {saldo.toFixed(2)} €
            </Text>

          </View>


          <View style={styles.walletIcon}>

            <Ionicons
              name="wallet-outline"
              size={26}
              color="#FFFFFF"
            />

          </View>

        </View>


        <View style={styles.divider} />


        <View style={styles.monthRow}>

          <View>

            <Text style={styles.monthLabel}>
              Este mês
            </Text>

            <Text style={styles.monthText}>
              Balanço mensal
            </Text>

          </View>


          <View style={styles.percentageContainer}>

            <Ionicons
              name={percentageIcon}
              size={18}
              color={percentageColor}
            />


            <Text
              style={[
                styles.percentage,
                {
                  color: percentageColor,
                },
              ]}
            >

              {monthlyPercentage > 0
                ? '+'
                : ''}

              {monthlyPercentage.toFixed(2)}%

            </Text>

          </View>

        </View>

      </View>



      {/* ==================================================
          RECEITAS / DESPESAS
      ================================================== */}

      <View style={styles.summaryRow}>


        {/* -------------------- Receitas */}

        <View style={styles.summaryCard}>

          <View
            style={[
              styles.summaryIcon,
              styles.incomeIconBackground,
            ]}
          >

            <Ionicons
              name="arrow-down"
              size={20}
              color="#6EE7A8"
            />

          </View>


          <View style={styles.summaryInfo}>

            <Text style={styles.summaryLabel}>
              Receitas
            </Text>

            <Text
              style={[
                styles.summaryValue,
                styles.incomeValue,
              ]}
            >
              +{monthlyIncome.toFixed(2)} €
            </Text>

            <Text style={styles.summaryPeriod}>
              Este mês
            </Text>

          </View>

        </View>



        {/* -------------------- Despesas */}

        <View style={styles.summaryCard}>

          <View
            style={[
              styles.summaryIcon,
              styles.expenseIconBackground,
            ]}
          >

            <Ionicons
              name="arrow-up"
              size={20}
              color="#FF6B6B"
            />

          </View>


          <View style={styles.summaryInfo}>

            <Text style={styles.summaryLabel}>
              Despesas
            </Text>

            <Text
              style={[
                styles.summaryValue,
                styles.expenseValue,
              ]}
            >
              -{monthlyExpense.toFixed(2)} €
            </Text>

            <Text style={styles.summaryPeriod}>
              Este mês
            </Text>

          </View>

        </View>

      </View>



      {/* ==================================================
          TRANSAÇÕES RECENTES
      ================================================== */}

      <View style={styles.transactionsSection}>


        {/* -------------------- Cabeçalho */}

        <View style={styles.transactionsHeader}>

          <Text style={styles.transactionsTitle}>
            Transações recentes
          </Text>


          {/* Botão para abrir todas as transações */}

          <TouchableOpacity
            style={styles.seeAllButton}
            activeOpacity={0.7}
            onPress={() =>
              router.push('/(tabs)/transaction')
            }
          >

            <Text style={styles.seeAllText}>
              Ver tudo
            </Text>

            <Ionicons
              name="chevron-forward"
              size={15}
              color="#8B7CFF"
            />

          </TouchableOpacity>

        </View>



        {/* -------------------- Lista */}

        <View style={styles.transactionsList}>

          {recentTransactions.length > 0 ? (

            recentTransactions.map(
              (transaction) => (

                <TransactionItem
                  key={transaction.id}

                  id={transaction.id}

                  type={transaction.type}

                  value={transaction.value}

                  category={transaction.category}

                  description={
                    transaction.description
                  }

                  date={transaction.date}

                  createdAt={
                    transaction.createdAt
                  }

                  // Se apagarmos uma transação
                  // atualizamos toda a Home
                  onDelete={loadFinanceData}
                />

              )
            )

          ) : (

            // -------------------- Sem transações

            <View style={styles.emptyTransactions}>

              <View style={styles.emptyIcon}>

                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color="#777783"
                />

              </View>

              <Text style={styles.emptyTitle}>
                Sem transações
              </Text>

              <Text style={styles.emptyText}>
                As tuas transações recentes
                vão aparecer aqui.
              </Text>

            </View>

          )}

        </View>

      </View>

    </ScrollView>
  );
}



const styles = StyleSheet.create({


  // ==================================================
  // CARD DO SALDO
  // ==================================================

  balanceCard: {

    marginTop: 24,

    backgroundColor: '#6758FF',

    borderRadius: 24,

    padding: 22,
  },


  balanceHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
  },


  balanceLabel: {

    color: 'rgba(255,255,255,0.75)',

    fontSize: 14,

    fontWeight: '500',
  },


  balanceValue: {

    color: '#FFFFFF',

    fontSize: 36,

    fontWeight: '700',

    marginTop: 6,
  },


  walletIcon: {

    width: 52,

    height: 52,

    borderRadius: 16,

    backgroundColor:
      'rgba(255,255,255,0.15)',

    alignItems: 'center',

    justifyContent: 'center',
  },


  divider: {

    height: 1,

    backgroundColor:
      'rgba(255,255,255,0.18)',

    marginVertical: 20,
  },


  monthRow: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
  },


  monthLabel: {

    color: '#FFFFFF',

    fontSize: 15,

    fontWeight: '600',
  },


  monthText: {

    color: 'rgba(255,255,255,0.65)',

    fontSize: 12,

    marginTop: 3,
  },


  percentageContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor:
      'rgba(0,0,0,0.15)',

    paddingHorizontal: 12,

    paddingVertical: 7,

    borderRadius: 20,

    gap: 5,
  },


  percentage: {

    fontSize: 14,

    fontWeight: '700',
  },



  // ==================================================
  // RECEITAS / DESPESAS
  // ==================================================

  summaryRow: {

    flexDirection: 'row',

    gap: 10,

    marginTop: 12,
  },


  summaryCard: {

    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#1C1C24',

    borderRadius: 16,

    paddingHorizontal: 12,

    paddingVertical: 12,
  },


  summaryIcon: {

    width: 38,

    height: 38,

    borderRadius: 12,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 10,
  },


  incomeIconBackground: {

    backgroundColor:
      'rgba(110,231,168,0.12)',
  },


  expenseIconBackground: {

    backgroundColor:
      'rgba(255,107,107,0.12)',
  },


  summaryInfo: {

    flex: 1,
  },


  summaryLabel: {

    color: '#A7A7B3',

    fontSize: 11,

    fontWeight: '500',
  },


  summaryValue: {

    fontSize: 15,

    fontWeight: '700',

    marginTop: 2,
  },


  incomeValue: {

    color: '#6EE7A8',
  },


  expenseValue: {

    color: '#FF6B6B',
  },


  summaryPeriod: {

    color: '#696975',

    fontSize: 9,

    marginTop: 2,
  },



  // ==================================================
  // TRANSAÇÕES RECENTES
  // ==================================================

  transactionsSection: {

    marginTop: 28,
  },


  // -------------------- Cabeçalho

  transactionsHeader: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 12,
  },


  transactionsTitle: {

    color: '#FFFFFF',

    fontSize: 18,

    fontWeight: '700',
  },


  // -------------------- Ver tudo

  seeAllButton: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 2,
  },


  seeAllText: {

    color: '#8B7CFF',

    fontSize: 13,

    fontWeight: '600',
  },


  // -------------------- Lista

  transactionsList: {

    overflow: 'hidden',

    borderRadius: 18,
  },


  // -------------------- Sem transações

  emptyTransactions: {

    backgroundColor: '#1C1C24',

    borderRadius: 18,

    alignItems: 'center',

    paddingVertical: 28,

    paddingHorizontal: 20,
  },


  emptyIcon: {

    width: 46,

    height: 46,

    borderRadius: 14,

    backgroundColor: '#24242E',

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 10,
  },


  emptyTitle: {

    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '600',
  },


  emptyText: {

    color: '#777783',

    fontSize: 11,

    marginTop: 4,

    textAlign: 'center',
  },

});