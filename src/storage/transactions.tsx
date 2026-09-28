import AsyncStorage from '@react-native-async-storage/async-storage';

export type Transaction = {
  id: string;
  type: 'despesa' | 'receita';
  value: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
};

const TRANSACTIONS_KEY = 'transactions';

export const getTransactions = async (): Promise<Transaction[]> => {
  const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);

  return data ? JSON.parse(data) : [];
};

export const addTransaction = async (
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<Transaction> => {

  const transactions = await getTransactions();

  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify([newTransaction, ...transactions])
  );

  return newTransaction;
};

export const deleteTransaction = async (
  id: string
): Promise<void> => {

  const transactions = await getTransactions();

  const filtered = transactions.filter(
    (transaction) => transaction.id !== id
  );

  await AsyncStorage.setItem(
    TRANSACTIONS_KEY,
    JSON.stringify(filtered)
  );
};

export const clearAllTransactions = async (): Promise<void> => {
  await AsyncStorage.removeItem(TRANSACTIONS_KEY);
};