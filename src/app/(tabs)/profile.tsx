
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';

import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';


import Svg, {
  Circle,
  Line,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import {
  getExpensesByCategory,
  getMonthlyIncomeExpenses,
  type ExpensePeriod,
} from '@/utils/finance';

// TIPOS

type MonthlyIncomeExpense = {
  month: string;
  income: number;
  expenses: number;
};

type CategoryExpense = {
  category: string;
  value: number;
};

const screenWidth = Dimensions.get('window').width;

// INFORMAÇÃO DAS CATEGORIAS

const categoryInfo: Record<
  string,
  { name: string; color: string }
> = {
  food: { name: 'Alimentação', color: '#FF9F43' },
  transport: { name: 'Transporte', color: '#459CF5' },
  house: { name: 'Moradia', color: '#A855F7' },
  leisure: { name: 'Lazer', color: '#EC4899' },
  health: { name: 'Saúde', color: '#FF4D61' },
  education: { name: 'Educação', color: '#38BDF8' },
  shopping: { name: 'Compras', color: '#FBBF24' },
  bills: { name: 'Contas', color: '#35D07F' },
  other: { name: 'Outros', color: '#9296A5' },
};

const chartConfig = {
  backgroundGradientFrom: '#12151D',
  backgroundGradientTo: '#12151D',
  decimalPlaces: 0,
  color: (opacity = 1) =>
    `rgba(129, 117, 255, ${opacity})`,
  labelColor: () => '#9296A5',
  propsForBackgroundLines: {
    stroke: '#242836',
  },
};

// FORMATAR VALORES EM EUROS

function formatMoney(value: number) {
  return `${value.toLocaleString('pt-PT', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} €`;
}

// GRÁFICO PERSONALIZADO: RECEITAS VS DESPESAS

function IncomeExpenseChart({
  data,
}: {
  data: MonthlyIncomeExpense[];
}) {
  const width = screenWidth - 72;
  const height = 250;

  const plotLeft = 65;
  const plotRight = width - 10;
  const plotTop = 15;
  const plotBottom = 205;

  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  // Encontrar o maior valor mensal

  const maxValue = Math.max(
    ...data.flatMap((item) => [
      item.income,
      item.expenses,
    ]),
    1
  );

  // Calcular uma escala adequada

  const rawStep = maxValue / 4;

  const magnitude = Math.pow(
    10,
    Math.floor(Math.log10(rawStep))
  );

  const normalizedStep = rawStep / magnitude;

  let niceStep: number;

  if (normalizedStep <= 1) {
    niceStep = 1;
  } else if (normalizedStep <= 2) {
    niceStep = 2;
  } else if (normalizedStep <= 5) {
    niceStep = 5;
  } else {
    niceStep = 10;
  }

  const maxScale = niceStep * magnitude * 4;

  const barWidth = Math.min(
    14,
    (plotWidth / data.length) * 0.28
  );

  const barGap = 4;

  const getBarHeight = (value: number) =>
    (value / maxScale) * plotHeight;

  const formatAxisValue = (value: number) =>
    `${value.toLocaleString('pt-PT')} €`;

  return (
    <Svg width={width} height={height}>

      {/* LINHAS HORIZONTAIS E VALORES */}

      {[0, 1, 2, 3, 4].map((index) => {
        const value = (maxScale / 4) * index;

        const y =
          plotBottom - (plotHeight / 4) * index;

        return (
          <React.Fragment key={index}>
            <Line
              x1={plotLeft}
              y1={y}
              x2={plotRight}
              y2={y}
              stroke="#292D38"
              strokeWidth={1}
            />

            <SvgText
              x={plotLeft - 8}
              y={y + 4}
              fontSize={10}
              fill="#9296A5"
              textAnchor="end"
            >
              {formatAxisValue(value)}
            </SvgText>
          </React.Fragment>
        );
      })}

      {/* BARRAS DE RECEITAS E DESPESAS */}

      {data.map((item, index) => {
        const slotWidth = plotWidth / data.length;

        const centerX =
          plotLeft +
          slotWidth * index +
          slotWidth / 2;

        const incomeHeight = getBarHeight(item.income);
        const expenseHeight = getBarHeight(item.expenses);

        const incomeX =
          centerX - barGap / 2 - barWidth;

        const expenseX =
          centerX + barGap / 2;

        return (
          <React.Fragment key={`${item.month}-${index}`}>

            {/* RECEITAS - AZUL */}

            <Rect
              x={incomeX}
              y={plotBottom - incomeHeight}
              width={barWidth}
              height={Math.max(incomeHeight, 0)}
              rx={4}
              fill="#35A9F5"
            />

            {/* DESPESAS - VERMELHO */}

            <Rect
              x={expenseX}
              y={plotBottom - expenseHeight}
              width={barWidth}
              height={Math.max(expenseHeight, 0)}
              rx={4}
              fill="#FF626E"
            />

            {/* NOME DO MÊS */}

            <SvgText
              x={centerX}
              y={plotBottom + 24}
              fontSize={10}
              fill="#9296A5"
              textAnchor="middle"
            >
              {item.month}
            </SvgText>

          </React.Fragment>
        );
      })}

    </Svg>
  );
}

// GRÁFICO CIRCULAR: DESPESAS POR CATEGORIA

function CategoryDonut({
  data,
}: {
  data: CategoryExpense[];
}) {
  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const gap = 8;

  return (
    <View>

      {/* GRÁFICO CIRCULAR */}

      <View style={styles.donutContainer}>
        <Svg width={240} height={240}>

          {total > 0 &&
            data.map((item, index) => {
              const previousTotal = data
                .slice(0, index)
                .reduce(
                  (sum, category) =>
                    sum + category.value,
                  0
                );

              const fraction = item.value / total;

              const segmentLength = Math.max(
                fraction * circumference - gap,
                0
              );

              const offset =
                (previousTotal / total) *
                circumference;

              return (
                <Circle
                  key={item.category}
                  cx={120}
                  cy={120}
                  r={radius}
                  stroke={
                    categoryInfo[item.category]?.color ??
                    '#9296A5'
                  }
                  strokeWidth={17}
                  fill="none"
                  strokeDasharray={`${segmentLength} ${
                    circumference - segmentLength
                  }`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  rotation={-90}
                  origin="120, 120"
                />
              );
            })}

          {/* TOTAL NO CENTRO */}

          <SvgText
            x={120}
            y={130}
            fontSize={27}
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            {formatMoney(total)}
          </SvgText>

        </Svg>
      </View>

      {/* LISTA DE CATEGORIAS */}

      {data.length > 0 ? (
        <View style={styles.categoryList}>

          {data.map((item) => {
            const percentage =
              total > 0
                ? (item.value / total) * 100
                : 0;

            return (
              <View
                key={item.category}
                style={styles.categoryRow}
              >

                <View style={styles.categoryNameContainer}>
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor:
                          categoryInfo[item.category]?.color ??
                          '#9296A5',
                      },
                    ]}
                  />

                  <Text style={styles.categoryName}>
                    {categoryInfo[item.category]?.name ??
                      item.category}
                  </Text>
                </View>

                <Text style={styles.categoryPercentage}>
                  {Math.round(percentage)}%
                </Text>

                <Text style={styles.categoryValue}>
                  {formatMoney(item.value)}
                </Text>

              </View>
            );
          })}

        </View>
      ) : (
        <Text style={styles.emptyText}>
          Ainda não existem despesas neste período.
        </Text>
      )}

    </View>
  );
}

// COMPONENTE PRINCIPAL

export default function Profile() {

  const [categoryExpenses, setCategoryExpenses] =
    useState<CategoryExpense[]>([]);

  const [incomeExpenses, setIncomeExpenses] =
    useState<MonthlyIncomeExpense[]>([]);

  const [selectedPeriod, setSelectedPeriod] =
    useState<ExpensePeriod>('month');

  // CARREGAR OS DADOS

  const loadChartData = async () => {
    try {
      const [categories, incomeExpense] =
        await Promise.all([
          getExpensesByCategory(selectedPeriod),
          getMonthlyIncomeExpenses(),
        ]);

      setCategoryExpenses(categories);
      setIncomeExpenses(incomeExpense);

    } catch (error) {
      console.error(
        'Erro ao carregar os gráficos:',
        error
      );
    }
  };

  // ATUALIZAR AO ENTRAR NO SEPARADOR
  // E QUANDO MUDAR O PERÍODO

  useFocusEffect(
    useCallback(() => {
      loadChartData();
    }, [selectedPeriod])
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >

      <Text style={styles.title}>
        Estatísticas
      </Text>

      <Text style={styles.subtitle}>
        Acompanha a evolução das tuas despesas.
      </Text>

      {/* RECEITAS VS DESPESAS */}

      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          Receitas vs Despesas
        </Text>

        <Text style={styles.description}>
          Comparação dos últimos 6 meses
        </Text>

        {/* LEGENDA */}

        <View style={styles.legendContainer}>

          <View style={styles.legendItem}>
            <View style={styles.incomeColor} />

            <Text style={styles.legendText}>
              Receitas
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={styles.expenseColor} />

            <Text style={styles.legendText}>
              Despesas
            </Text>
          </View>

        </View>

        {/* GRÁFICO */}

        {incomeExpenses.length > 0 ? (
          <View style={styles.customChart}>
            <IncomeExpenseChart
              data={incomeExpenses}
            />
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Ainda não existem dados para comparar.
          </Text>
        )}

      </View>

      {/* DESPESAS POR CATEGORIA */}

      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          Despesas por categoria
        </Text>

        <Text style={styles.description}>
          Distribuição das tuas despesas
        </Text>

        {/* SELEÇÃO DO PERÍODO */}

        <View style={styles.periodContainer}>

          {([
            { value: 'month', label: 'Mês' },
            { value: 'quarter', label: 'Trimestre' },
            { value: 'year', label: 'Ano' },
          ] as const).map((period) => (

            <Pressable
              key={period.value}
              onPress={() =>
                setSelectedPeriod(period.value)
              }
              style={[
                styles.periodButton,
                selectedPeriod === period.value &&
                  styles.periodButtonActive,
              ]}
            >

              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.value &&
                    styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>

            </Pressable>
          ))}

        </View>

        {/* GRÁFICO CIRCULAR E LISTA */}

        <CategoryDonut
          data={categoryExpenses}
        />

      </View>

    </ScrollView>
  );
}

// ESTILOS

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#080A10',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 15,
  },

  subtitle: {
    color: '#9296A5',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#12151D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  description: {
    color: '#9296A5',
    fontSize: 13,
    marginTop: 5,
  },

  // GRÁFICO DE RECEITAS E DESPESAS

  customChart: {
    marginTop: 15,
    alignItems: 'center',
  },

  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 18,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  incomeColor: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#35A9F5',
  },

  expenseColor: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#FF626E',
  },

  legendText: {
    color: '#9296A5',
    fontSize: 12,
  },

  // SELEÇÃO DO PERÍODO

  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#080A10',
    borderRadius: 20,
    padding: 4,
    marginTop: 20,
    marginBottom: 15,
  },

  periodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 16,
  },

  periodButtonActive: {
    backgroundColor: '#292633',
  },

  periodText: {
    color: '#9296A5',
    fontSize: 12,
    fontWeight: '500',
  },

  periodTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // GRÁFICO CIRCULAR

  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },

  // LISTA DE CATEGORIAS

  categoryList: {
    marginTop: 15,
    gap: 16,
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  categoryName: {
    color: '#D0D0D5',
    fontSize: 14,
  },

  categoryPercentage: {
    color: '#9296A5',
    fontSize: 13,
    width: 45,
    textAlign: 'right',
  },

  categoryValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    width: 85,
    textAlign: 'right',
  },

  // OUTROS

  emptyText: {
    color: '#9296A5',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },

});
