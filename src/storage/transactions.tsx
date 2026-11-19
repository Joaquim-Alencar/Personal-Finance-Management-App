
import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecurrenceUnit = 'days' | 'weeks' | 'months';

export type RecurrenceInput = {
  interval: number;
  unit: RecurrenceUnit;
};

type TransactionRecurrence = RecurrenceInput & {
  nextDate: string;
  anchorDay: number;
};

export type Transaction = {
  id: string;
  type: 'despesa' | 'receita';
  value: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  goalId?: string;
  recurrence?: TransactionRecurrence;
  recurrenceId?: string;
};

const TRANSACTIONS_KEY = 'transactions';

let storageQueue: Promise<void> = Promise.resolve();

async function withStorageLock<T>(
  operation: () => Promise<T>
): Promise<T> {
  const result = storageQueue.then(operation, operation);

  storageQueue = result.then(
    () => undefined,
    () => undefined
  );

  return result;
}

async function readTransactions(): Promise<Transaction[]> {
  const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
}

function addRecurrenceInterval(
  date: Date,
  interval: number,
  unit: RecurrenceUnit,
  anchorDay: number
): Date {
  const result = new Date(date);

  if (unit === 'days') {
    result.setDate(result.getDate() + interval);
    return result;
  }

  if (unit === 'weeks') {
    result.setDate(result.getDate() + interval * 7);
    return result;
  }

  const targetMonth = result.getMonth() + interval;
  const targetYear =
    result.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = targetMonth % 12;

  const lastDay = new Date(
    targetYear,
    normalizedMonth + 1,
    0
  ).getDate();

  return new Date(
    targetYear,
    normalizedMonth,
    Math.min(anchorDay, lastDay),
    result.getHours(),
    result.getMinutes(),
    result.getSeconds(),
    result.getMilliseconds()
  );
}

// Processar cobranças vencidas.
async function processRecurringTransactions(): Promise<void> {
  await withStorageLock(async () => {
    const transactions = await readTransactions();
    const now = new Date();

    const generatedTransactions: Transaction[] = [];
    const existingIds = new Set(
      transactions.map((transaction) => transaction.id)
    );

    let hasChanges = false;

    for (let i = 0; i < transactions.length; i++) {
      const original = transactions[i];

      if (!original.recurrence) continue;

      const recurrence = original.recurrence;

      if (
        !Number.isInteger(recurrence.interval) ||
        recurrence.interval <= 0
      ) {
        continue;
      }

      let nextDate = new Date(recurrence.nextDate);

      if (Number.isNaN(nextDate.getTime())) continue;

      let occurrencesCreated = 0;
      let recurrenceChanged = false;

      while (
        nextDate <= now &&
        occurrencesCreated < 1000
      ) {
        const occurrenceId =
          `${original.id}_${nextDate.getTime()}`;

        if (!existingIds.has(occurrenceId)) {
          generatedTransactions.push({
            id: occurrenceId,
            type: original.type,
            value: original.value,
            category: original.category,
            description: original.description,
            date: nextDate.toISOString(),
            createdAt: now.toISOString(),
            goalId: original.goalId,
            recurrenceId: original.id,
          });

          existingIds.add(occurrenceId);
        }

        nextDate = addRecurrenceInterval(
          nextDate,
          recurrence.interval,
          recurrence.unit,
          recurrence.anchorDay
        );

        occurrencesCreated++;
        recurrenceChanged = true;
      }

      if (recurrenceChanged) {
        transactions[i] = {
          ...original,
          recurrence: {
            ...recurrence,
            nextDate: nextDate.toISOString(),
          },
        };

        hasChanges = true;
      }
    }

    if (hasChanges) {
      await AsyncStorage.setItem(
        TRANSACTIONS_KEY,
        JSON.stringify([
          ...generatedTransactions,
          ...transactions,
        ])
      );
    }
  });
}

export const getTransactions = async (): Promise<Transaction[]> => {
  await processRecurringTransactions();
  return readTransactions();
};

// Obter apenas as transações recorrentes ativas.
export const getRecurringTransactions = async (): Promise<Transaction[]> => {
  const transactions = await getTransactions();

  return transactions.filter(
    (transaction) => transaction.recurrence !== undefined
  );
};

// Calcular o valor que ainda está previsto para este mês.
export const getRecurringAmountThisMonth = async (): Promise<number> => {
  const recurringTransactions = await getRecurringTransactions();

  const now = new Date();
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  let total = 0;

  for (const transaction of recurringTransactions) {
    const recurrence = transaction.recurrence;
    if (!recurrence) continue;

    let nextDate = new Date(recurrence.nextDate);
    let count = 0;

    while (
      nextDate > now &&
      nextDate < monthEnd &&
      count < 1000
    ) {
      total += transaction.value;

      nextDate = addRecurrenceInterval(
        nextDate,
        recurrence.interval,
        recurrence.unit,
        recurrence.anchorDay
      );

      count++;
    }
  }

  return total;
};

// Cancelar futuras ocorrências sem apagar o histórico.
export const cancelRecurringTransaction = async (
  id: string
): Promise<void> => {
  await withStorageLock(async () => {
    const transactions = await readTransactions();

    const updated = transactions.map((transaction) => {
      if (transaction.id !== id) return transaction;

      const { recurrence, ...transactionWithoutRecurrence } = transaction;

      return transactionWithoutRecurrence;
    });

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(updated)
    );
  });
};

export const addTransaction = async (
  transaction: Omit<
    Transaction,
    'id' | 'createdAt' | 'recurrence' | 'recurrenceId'
  > & {
    recurrence?: RecurrenceInput;
  }
): Promise<Transaction> => {
  return withStorageLock(async () => {
    const transactions = await readTransactions();
    const { recurrence, ...transactionData } = transaction;

    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    if (recurrence) {
      const originalDate = new Date(transaction.date);

      if (
        !Number.isInteger(recurrence.interval) ||
        recurrence.interval <= 0 ||
        Number.isNaN(originalDate.getTime())
      ) {
        throw new Error('Configuração de repetição inválida.');
      }

      const anchorDay = originalDate.getDate();

      const nextDate = addRecurrenceInterval(
        originalDate,
        recurrence.interval,
        recurrence.unit,
        anchorDay
      );

      newTransaction.recurrence = {
        interval: recurrence.interval,
        unit: recurrence.unit,
        nextDate: nextDate.toISOString(),
        anchorDay,
      };
    }

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify([newTransaction, ...transactions])
    );

    return newTransaction;
  });
};

export const deleteTransaction = async (
  id: string
): Promise<void> => {
  await withStorageLock(async () => {
    const transactions = await readTransactions();

    const filtered = transactions.filter(
      (transaction) => transaction.id !== id
    );

    await AsyncStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(filtered)
    );
  });
};

export const clearAllTransactions = async (): Promise<void> => {
  await withStorageLock(async () => {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
  });
};
