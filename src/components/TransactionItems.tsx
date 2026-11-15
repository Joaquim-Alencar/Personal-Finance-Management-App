
import {
  deleteTransaction,
  getTransactions,
} from '@/storage/transactions';
import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Svg, {
  Circle,
  Line,
  Path,
  Text as SvgText,
} from 'react-native-svg';

import MyAlert from './Myalert';

export const categoryInfo: Record<
  string,
  {
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  }
> = {
  food: {
    name: 'Alimentação',
    icon: 'restaurant-outline',
    color: '#FF9F43',
  },
  transport: {
    name: 'Transporte',
    icon: 'car-outline',
    color: '#459CF5',
  },
  transaction: {
    name: 'Transação',
    icon: 'swap-horizontal-outline',
    color: '#A855F7',
  },
  leisure: {
    name: 'Lazer',
    icon: 'game-controller-outline',
    color: '#EC4899',
  },
  health: {
    name: 'Saúde',
    icon: 'heart-outline',
    color: '#FF4D61',
  },
  education: {
    name: 'Educação',
    icon: 'book-outline',
    color: '#38BDF8',
  },
  shopping: {
    name: 'Compras',
    icon: 'bag-outline',
    color: '#C084FC',
  },
  bills: {
    name: 'Contas',
    icon: 'document-text-outline',
    color: '#35D07F',
  },
  savings: {
    name: 'Poupanças',
    icon: 'trending-up-outline',
    color: '#FBBF24',
  },
  other: {
    name: 'Outros',
    icon: 'ellipsis-horizontal',
    color: '#9296A5',
  },
};

type TransactionItemProps = {
  id: string;
  type: 'despesa' | 'receita';
  value: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  onDelete: () => void;
};

type MonthlyExpense = {
  month: string;
  value: number;
};

const screenHeight = Dimensions.get('window').height;

function formatMoney(value: number) {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// GRÁFICO DOS ÚLTIMOS 12 MESES

function CategoryExpenseChart({
  data,
  color,
}: {
  data: MonthlyExpense[];
  color: string;
}) {
  const chartWidth = 320;
  const chartHeight = 180;

  const maxValue = Math.max(
    ...data.map((item) => item.value),
    1
  );

  const points = data.map((item, index) => {
    const x = 16 + (index * 288) / 11;

    const y =
      112 - (item.value / maxValue) * 90;

    return { x, y };
  });

  const linePath = points
    .map((point, index) =>
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    )
    .join(' ');

  const hasExpenses = data.some(
    (item) => item.value > 0
  );

  return (
    <View style={styles.chartContainer}>
      {hasExpenses ? (
        <>
          <View style={styles.chartSummary}>
            <Text style={styles.chartSummaryLabel}>
              Total gasto nos últimos 12 meses
            </Text>

            <Text style={styles.chartSummaryValue}>
              {formatMoney(
                data.reduce((sum, item) => sum + item.value, 0)
              )} €
            </Text>
          </View>

          <Svg
            width="100%"
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {/* Linhas de referência */}

            <Line
              x1={12}
              y1={112}
              x2={308}
              y2={112}
              stroke="#292D38"
              strokeWidth={1}
            />

            <Line
              x1={12}
              y1={67}
              x2={308}
              y2={67}
              stroke="#292D38"
              strokeWidth={1}
              strokeDasharray="4 5"
            />

            {/* Linha da evolução mensal */}

            <Path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pontos do gráfico */}

            {points.map((point, index) => (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={3}
                fill={color}
              />
            ))}

            {/* Meses */}

            {data.map((item, index) => {
              const x = 16 + (index * 288) / 11;

              return (
                <SvgText
                  key={index}
                  x={x}
                  y={145}
                  fontSize={9}
                  fill="#9296A5"
                  textAnchor="middle"
                >
                  {item.month}
                </SvgText>
              );
            })}
          </Svg>
        </>
      ) : (
        <View style={styles.chartEmpty}>
          <Ionicons
            name="bar-chart-outline"
            size={30}
            color={colors.textMuted}
          />

          <Text style={styles.chartEmptyText}>
            Ainda não existem despesas nesta categoria
            nos últimos 12 meses.
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TransactionItem({
  id,
  type,
  value,
  category,
  description,
  date,
  onDelete,
}: TransactionItemProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData, setChartData] = useState<MonthlyExpense[]>([]);

  const categoryData =
    categoryInfo[category.toLowerCase()] ??
    categoryInfo.other;

  const isExpense = type === 'despesa';

  const formattedDate = new Date(date).toLocaleDateString(
    'pt-PT',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  );

  const formattedValue = formatMoney(value);

  // CALCULAR AS DESPESAS MENSAIS DA CATEGORIA

  async function loadCategoryExpenses() {
    try {
      setChartLoading(true);

      const transactions = await getTransactions();

      const now = new Date();

      // Criar os últimos 12 meses, incluindo o atual.

      const months: MonthlyExpense[] = Array.from(
        { length: 12 },
        (_, index) => {
          const monthDate = new Date(
            now.getFullYear(),
            now.getMonth() - 11 + index,
            1
          );

          return {
            month: monthDate
              .toLocaleDateString('pt-PT', {
                month: 'short',
              })
              .replace('.', ''),
            value: 0,
          };
        }
      );

      const firstMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 11,
        1
      );

      // Somar apenas despesas da mesma categoria.

      transactions.forEach((transaction) => {
        if (
          transaction.type !== 'despesa' ||
          transaction.category.toLowerCase() !==
            category.toLowerCase()
        ) {
          return;
        }

        const transactionDate = new Date(transaction.date);

        if (
          Number.isNaN(transactionDate.getTime()) ||
          transactionDate < firstMonth
        ) {
          return;
        }

        const monthIndex =
          (transactionDate.getFullYear() -
            firstMonth.getFullYear()) *
            12 +
          transactionDate.getMonth() -
          firstMonth.getMonth();

        if (monthIndex >= 0 && monthIndex < 12) {
          months[monthIndex].value += transaction.value;
        }
      });

      setChartData(months);
    } catch (error) {
      console.error(
        'Erro ao carregar despesas da categoria:',
        error
      );

      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }

  // ABRIR DETALHES

  async function handleOpenDetails() {
    setDetailsVisible(true);
    await loadCategoryExpenses();
  }

  // ELIMINAR TRANSAÇÃO

  async function handleDelete() {
    try {
      await deleteTransaction(id);

      setShowAlert(false);
      onDelete();
    } catch (error) {
      console.error('Erro ao eliminar transação:', error);
    }
  }

  return (
    <>
      {/* ITEM DA LISTA */}

      <TouchableOpacity
        style={styles.container}
        onPress={handleOpenDetails}
        onLongPress={() => setShowAlert(true)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${categoryData.color}20`,
            },
          ]}
        >
          <Ionicons
            name={categoryData.icon}
            size={22}
            color={categoryData.color}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.category}>
            {categoryData.name}
          </Text>

          <Text
            style={styles.description}
            numberOfLines={1}
          >
            {description}
          </Text>

          <Text style={styles.date}>
            {formattedDate}
          </Text>
        </View>

        <Text
          style={[
            styles.value,
            {
              color: isExpense
                ? colors.expense
                : colors.income,
            },
          ]}
        >
          {isExpense ? '-' : '+'}{formattedValue} €
        </Text>
      </TouchableOpacity>

      {/* MODAL DE DETALHES DA TRANSAÇÃO */}

      <Modal
        visible={detailsVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setDetailsVisible(false)}
      >
        <View style={styles.modalOverlay}>

          {/* FUNDO DESFOCADO */}

          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDetailsVisible(false)}
          >
            <BlurView
              intensity={35}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.darkOverlay} />
          </Pressable>

          {/* FICHA SOBREPOSTA */}

          <View style={styles.detailsSheet}>
            <View style={styles.sheetHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              {/* CABEÇALHO */}

              <View style={styles.detailsHeader}>
                <Text style={styles.detailsTitle}>
                  Detalhes da transação
                </Text>

                <Pressable
                  style={styles.closeButton}
                  onPress={() => setDetailsVisible(false)}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>

              {/* VALOR */}

              <View style={styles.amountContainer}>
                <View
                  style={[
                    styles.detailsIcon,
                    {
                      backgroundColor: `${categoryData.color}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={categoryData.icon}
                    size={27}
                    color={categoryData.color}
                  />
                </View>

                <Text
                  style={[
                    styles.detailsAmount,
                    {
                      color: isExpense
                        ? colors.expense
                        : colors.income,
                    },
                  ]}
                >
                  {isExpense ? '-' : '+'}
                  {formattedValue} €
                </Text>

                <Text style={styles.detailsDate}>
                  {formattedDate}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* INFORMAÇÕES */}

              <Text style={styles.sectionTitle}>
                Informações
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Nome / descrição
                </Text>

                <Text style={styles.infoValue}>
                  {description || 'Sem nome'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Categoria
                </Text>

                <View style={styles.categoryDetail}>
                  <View
                    style={[
                      styles.categoryDot,
                      {
                        backgroundColor: categoryData.color,
                      },
                    ]}
                  />

                  <Text style={styles.infoValue}>
                    {categoryData.name}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Tipo
                </Text>

                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isExpense
                        ? colors.expense
                        : colors.income,
                    },
                  ]}
                >
                  {isExpense ? 'Despesa' : 'Receita'}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* GRÁFICO DA CATEGORIA */}

              <Text style={styles.sectionTitle}>
                Gastos em {categoryData.name}
              </Text>

              <Text style={styles.chartSubtitle}>
                Evolução mensal dos últimos 12 meses
              </Text>

              {chartLoading ? (
                <View style={styles.chartLoading}>
                  <Text style={styles.chartEmptyText}>
                    A carregar gráfico...
                  </Text>
                </View>
              ) : (
                <CategoryExpenseChart
                  data={chartData}
                  color={categoryData.color}
                />
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CONFIRMAÇÃO DE ELIMINAÇÃO */}

      <MyAlert
        visible={showAlert}
        title="Eliminar transação"
        message="Tens a certeza de que queres eliminar esta transação?"
        onCancel={() => setShowAlert(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  category: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },

  description: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },

  date: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },

  value: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },

  // MODAL

  modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 12,
  },

  darkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

 detailsSheet: {
  height: screenHeight * 0.85,
  width: '100%',
  backgroundColor: colors.surface,
  borderRadius: 26,
  borderWidth: 1,
  borderColor: colors.border,
  overflow: 'hidden',
},

  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 5,
    backgroundColor: colors.textMuted,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },

  sheetContent: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 35,
  },

  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  detailsTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: 'bold',
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  amountContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },

  detailsIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  detailsAmount: {
    fontSize: 29,
    fontWeight: 'bold',
  },

  detailsDate: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 19,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },

  infoLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    flexShrink: 0,
  },

  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  categoryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },

  // GRÁFICO

  chartSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: -9,
    marginBottom: 12,
  },

  chartContainer: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 12,
    marginTop: 5,
  },

  chartSummary: {
    marginBottom: 8,
  },

  chartSummaryLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },

  chartSummaryValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 4,
  },

  chartEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
    gap: 10,
  },

  chartEmptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  chartLoading: {
    paddingVertical: 30,
    alignItems: 'center',
  },
});
