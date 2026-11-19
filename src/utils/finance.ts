import { getTransactions } from '@/storage/transactions';


// --------------------------------------------------
// Função auxiliar
// Recebe o total atual, o tipo e o valor da transação
// e devolve o novo total
// --------------------------------------------------

function calculateTotal(
  total: number,
  type: 'despesa' | 'receita',
  value: number
): number {

  if (type === 'despesa') {
    return total - value;
  } else {
    return total + value;
  }
}


// --------------------------------------------------
// Saldo total
// --------------------------------------------------

export async function getBalance() {

  const transactions = await getTransactions();

  let total = 0;

  for (let i = 0; i < transactions.length; i++) 
  {

    total = calculateTotal(total,transactions[i].type,transactions[i].value);

  }

  return total;
}

///--------------------------------------------------
/// Saldo on Day x
///--------------------------------------------------
export async function getDayBalance(data : Date) {

  const transactions = await getTransactions();
  
  let total = 0;

  for (let i = 0; i < transactions.length; i++) 
  {
     const transactionDate = new Date(transactions[i].date);
    if(transactionDate<data){
        total = calculateTotal(total,transactions[i].type,transactions[i].value);
    }
  }
  return total;
}

// --------------------------------------------------
// Saldo de uma categoria
// Exemplo: getCategory('food')
// --------------------------------------------------

export async function getCategory(category: string) {

  const transactions = await getTransactions();

  let total = 0;

  for (let i = 0; i < transactions.length; i++) {

    
    if (transactions[i].category === category) {


      total = calculateTotal(total,transactions[i].type,transactions[i].value);

    }

  }

  return total;
}


// --------------------------------------------------
// Saldo do mês atual
// --------------------------------------------------

export async function getMonthlyBalance() {

  const transactions = await getTransactions();

  const hoje = new Date();

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  let total = 0;

  for (let i = 0; i < transactions.length; i++) 
  {

    const transactionDate = new Date(transactions[i].date);

    if (transactionDate.getMonth() === mesAtual &&transactionDate.getFullYear() === anoAtual)
    {
      total = calculateTotal(total,transactions[i].type,transactions[i].value);
    }

  }

  return total;
}
///-------------------------------------------------------
/// Despesas Mensais / Receitas Mensais
///-------------------------------------------------------
export async function getMonthlyBalanceType(type: 'despesa' | 'receita') {

  const transactions = await getTransactions();

  const hoje = new Date();

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  let total = 0;

  for (let i = 0; i < transactions.length; i++) 
  {

    const transactionDate = new Date(transactions[i].date);

    if (transactionDate.getMonth() === mesAtual &&transactionDate.getFullYear() === anoAtual && transactions[i].type==type)
    {
      total = calculateTotal(total,transactions[i].type,transactions[i].value);
    }

  }

  return total;
}


export async function getTriMestBalance() {
  const transactions = await getTransactions();

  const hoje = new Date();

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Primeiro dia de 2 meses atrás
  // O Date trata automaticamente mudanças de ano
  const inicioTrimestre = new Date(anoAtual, mesAtual - 2, 1);

  let total = 0;

  for (let i = 0; i < transactions.length; i++) {

    const transactionDate = new Date(transactions[i].date);

    // Se a transação aconteceu desde o início do trimestre
    // até hoje, entra no cálculo
    if (
      transactionDate >= inicioTrimestre &&
      transactionDate <= hoje
    ) {
      total = calculateTotal(
        total,
        transactions[i].type,
        transactions[i].value
      );
    }
  }

  return total;
}


//------------------------------------------------------
// Cálculo de percentagem
//------------------------------------------------------

export function getPercentage(
  newValue: number,
  oldValue: number
): number {

  if (oldValue === 0) {
    return 0;
  }

  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}


//REVER

export async function getMonthlyExpenses() {
  const transactions = await getTransactions();

  const hoje = new Date();

  const inicio = new Date(
    hoje.getFullYear(),
    hoje.getMonth() - 5,
    1
  );

  const meses = [];

  for (let i = 0; i < 6; i++) {
    const data = new Date(
      inicio.getFullYear(),
      inicio.getMonth() + i,
      1
    );

    meses.push({
      month: data.toLocaleDateString('pt-PT', {
        month: 'short',
      }),
      year: data.getFullYear(),
      monthIndex: data.getMonth(),
      total: 0,
    });
  }

  for (const transaction of transactions) {
    if (transaction.type !== 'despesa') continue;

    const data = new Date(transaction.date);

    const mes = meses.find(
      (m) =>
        m.monthIndex === data.getMonth() &&
        m.year === data.getFullYear()
    );

    if (mes) {
      mes.total += transaction.value;
    }
  }

  return meses.map(({ month, total }) => ({
    month,
    total,
  }));
}



export type ExpensePeriod = 'month' | 'quarter' | 'year';

export async function getExpensesByCategory(
  period: ExpensePeriod = 'month'
) {
  const transactions = await getTransactions();

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  let inicio: Date;
  let fim: Date;

  if (period === 'month') {
    inicio = new Date(anoAtual, mesAtual, 1);
    fim = new Date(anoAtual, mesAtual + 1, 1);
  } else if (period === 'quarter') {
    const inicioTrimestre = Math.floor(mesAtual / 3) * 3;

    inicio = new Date(anoAtual, inicioTrimestre, 1);
    fim = new Date(anoAtual, inicioTrimestre + 3, 1);
  } else {
    inicio = new Date(anoAtual, 0, 1);
    fim = new Date(anoAtual + 1, 0, 1);
  }

  const categorias: Record<string, number> = {};

  for (const transaction of transactions) {
    if (transaction.type !== 'despesa') continue;

    const data = new Date(transaction.date);

    if (data < inicio || data >= fim) continue;

    if (!categorias[transaction.category]) {
      categorias[transaction.category] = 0;
    }

    categorias[transaction.category] += transaction.value;
  }

  return Object.entries(categorias)
    .map(([category, value]) => ({
      category,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}



export async function getMonthlyIncomeExpenses() {
  const transactions = await getTransactions();

  const hoje = new Date();

  const inicio = new Date(
    hoje.getFullYear(),
    hoje.getMonth() - 5,
    1
  );

  const meses = [];

  for (let i = 0; i < 6; i++) {
    const data = new Date(
      inicio.getFullYear(),
      inicio.getMonth() + i,
      1
    );

    meses.push({
      month: data.toLocaleDateString('pt-PT', {
        month: 'short',
      }),
      year: data.getFullYear(),
      monthIndex: data.getMonth(),
      income: 0,
      expenses: 0,
    });
  }

  for (const transaction of transactions) {
    const data = new Date(transaction.date);

    const mes = meses.find(
      (m) =>
        m.monthIndex === data.getMonth() &&
        m.year === data.getFullYear()
    );

    if (!mes) continue;

    if (transaction.type === 'receita') {
      mes.income += transaction.value;
    } else if (transaction.type === 'despesa') {
      mes.expenses += transaction.value;
    }
  }

  return meses.map(({ month, income, expenses }) => ({
    month,
    income,
    expenses,
  }));
}




export type Insight = {
  id: string;
  title: string;
  message: string;
  suggestion: string;
  type: 'warning' | 'success' | 'info';
  icon: string;
};


// Número de meses usados para calcular a média.
const INSIGHT_MONTHS = 5;


function getMonthRange(monthOffset: number, day: number) {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;

  const start = new Date(year, month, 1);

  const lastDay = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0
  ).getDate();

  const endDay = Math.min(day, lastDay);

  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    endDay + 1
  );

  return { start, end };
}

function isInsidePeriod(date: Date, start: Date, end: Date) {
  return date >= start && date < end;
}

function formatInsightMoney(value: number) {
  return value.toLocaleString('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  });
}

export async function getFinancialInsights(): Promise<Insight[]> {
  const transactions = await getTransactions();

  if (transactions.length === 0) {
    return [];
  }

  const now = new Date();
  const currentDay = now.getDate();

  const currentRange = getMonthRange(0, currentDay);

  // Consideramos apenas movimentos até ao momento atual.
  const currentTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    return (
      !Number.isNaN(date.getTime()) &&
      date >= currentRange.start &&
      date <= now
    );
  });

  // Obter os cinco períodos anteriores equivalentes.
  const previousRanges = Array.from(
    { length: INSIGHT_MONTHS },
    (_, index) => getMonthRange(-(index + 1), currentDay)
  );

  const getPeriodTotals = (
    start: Date,
    end: Date
  ) => {
    let expenses = 0;
    let income = 0;
    let savings = 0;

    const categories: Record<string, number> = {};

    for (const transaction of transactions) {
      const date = new Date(transaction.date);

      if (
        Number.isNaN(date.getTime()) ||
        !isInsidePeriod(date, start, end)
      ) {
        continue;
      }

      if (transaction.type === 'receita') {
        income += transaction.value;
      }

      if (transaction.type === 'despesa') {
        if (transaction.category === 'savings') {
          savings += transaction.value;
        } else {
          expenses += transaction.value;

          categories[transaction.category] =
            (categories[transaction.category] || 0) +
            transaction.value;
        }
      }
    }

    return { expenses, income, savings, categories };
  };

  const current = getPeriodTotals(
    currentRange.start,
    new Date(now.getTime() + 1)
  );

  const previous = previousRanges.map((range) =>
    getPeriodTotals(range.start, range.end)
  );

  // Médias mensais dos cinco períodos anteriores.
  const averageExpenses =
    previous.reduce((sum, item) => sum + item.expenses, 0) /
    INSIGHT_MONTHS;

  // Contar apenas os meses em que foram feitas poupanças.
const monthsWithSavings = previous.filter(
  (period) => period.savings > 0
).length;

const averageSavings =
  monthsWithSavings > 0
    ? previous.reduce((sum, item) => sum + item.savings, 0) /
      monthsWithSavings
    : 0;

  const insights: Insight[] = [];

  // --------------------------------------------------
  // 1. EVOLUÇÃO DAS DESPESAS
  // --------------------------------------------------

  if (averageExpenses > 0) {
    const difference =
      ((current.expenses - averageExpenses) / averageExpenses) * 100;

    if (difference > 0) {
      insights.push({
        id: 'expenses',
        title: 'Evolução das despesas',
        message: `Gastaste ${difference.toFixed(1)}% acima da tua média habitual.`,
        suggestion: `Este mês gastaste ${formatInsightMoney(current.expenses)}. A tua média é ${formatInsightMoney(averageExpenses)}.`,
        type: difference >= 20 ? 'warning' : 'info',
        icon: 'trending-up',
      });
    } else if (difference < 0) {
      insights.push({
        id: 'expenses',
        title: 'Boa evolução nas despesas',
        message: `Gastaste ${Math.abs(difference).toFixed(1)}% abaixo da tua média habitual.`,
        suggestion: `Reduziste os gastos em comparação com a média de ${formatInsightMoney(averageExpenses)}.`,
        type: 'success',
        icon: 'trending-down',
      });
    } else {
      insights.push({
        id: 'expenses',
        title: 'Evolução das despesas',
        message: 'Estás praticamente em linha com a tua média.',
        suggestion: `A tua média e as despesas atuais são de ${formatInsightMoney(averageExpenses)}.`,
        type: 'info',
        icon: 'wallet',
      });
    }
  } else {
    insights.push({
      id: 'expenses',
      title: 'Evolução das despesas',
      message: 'Ainda não existe histórico suficiente para comparar.',
      suggestion: 'Continua a registar despesas para descobrires a tua evolução.',
      type: 'info',
      icon: 'wallet',
    });
  }

  // --------------------------------------------------
// 2. ANÁLISE POR CATEGORIA
// --------------------------------------------------

// Somar os valores anteriores de cada categoria.
const previousCategoryTotals: Record<string, number> = {};

for (const period of previous) {
  for (const [category, value] of Object.entries(period.categories)) {
    previousCategoryTotals[category] =
      (previousCategoryTotals[category] || 0) + value;
  }
}

// Procurar as duas categorias com maior aumento percentual.
const highestCategories: {
  name: string;
  current: number;
  average: number;
  increase: number;
}[] = [];

for (const [category, currentValue] of Object.entries(current.categories)) {
  // Só contar os meses em que houve despesas nesta categoria.
  const monthsWithExpenses = previous.filter(
    (period) => (period.categories[category] || 0) > 0
  ).length;

  const average =
    monthsWithExpenses > 0
      ? (previousCategoryTotals[category] || 0) / monthsWithExpenses
      : 0;

  if (average <= 0 || currentValue <= average) {
    continue;
  }

  const increase = ((currentValue - average) / average) * 100;

  highestCategories.push({
    name: category,
    current: currentValue,
    average,
    increase,
  });
}

// Ordenar por aumento percentual e ficar com as duas primeiras.
highestCategories.sort((a, b) => b.increase - a.increase);

const topCategories = highestCategories.slice(0, 2);

if (topCategories.length > 0) {
  for (const category of topCategories) {
    insights.push({
      id: `category-${category.name}`,
      title: `Aumento em ${category.name}`,
      message: `${category.name} está ${category.increase.toFixed(1)}% acima da tua média.`,
      suggestion: `Gastaste ${formatInsightMoney(category.current)} nesta categoria. A média é ${formatInsightMoney(category.average)}.`,
      type: category.increase >= 25 ? 'warning' : 'info',
      icon: 'pie-chart',
    });
  }
} else {
  insights.push({
    id: 'category',
    title: 'Análise por categoria',
    message: 'Não encontrámos aumentos relevantes nas categorias.',
    suggestion: 'Continua a acompanhar os teus gastos para identificares alterações nos teus hábitos.',
    type: 'success',
    icon: 'pie-chart',
  });
}
  // --------------------------------------------------
  // 3. EVOLUÇÃO DAS POUPANÇAS
  // --------------------------------------------------

  if (averageSavings > 0) {
    const difference =
      ((current.savings - averageSavings) / averageSavings) * 100;

    insights.push({
      id: 'savings',
      title: 'As tuas poupanças',
      message: `Este mês guardaste ${formatInsightMoney(current.savings)}.`,
      suggestion:
        difference >= 0
          ? `Estás ${difference.toFixed(1)}% acima da tua média de ${formatInsightMoney(averageSavings)}.`
          : `Estás ${Math.abs(difference).toFixed(1)}% abaixo da tua média de ${formatInsightMoney(averageSavings)}.`,
      type: difference >= 0 ? 'success' : 'info',
      icon: 'piggy-bank',
    });
  } else {
    insights.push({
      id: 'savings',
      title: 'As tuas poupanças',
      message: `Este mês guardaste ${formatInsightMoney(current.savings)}.`,
      suggestion: 'Ainda não existe histórico de poupanças suficiente para calcular uma média.',
      type: 'info',
      icon: 'piggy-bank',
    });
  }
return insights;
}