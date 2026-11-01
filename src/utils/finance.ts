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