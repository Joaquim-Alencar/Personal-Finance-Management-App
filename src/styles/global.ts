import { StyleSheet } from 'react-native';

/*
|--------------------------------------------------------------------------
| CORES GLOBAIS
|--------------------------------------------------------------------------
| Paleta principal do FinGest.
| Assim evitamos escrever códigos hexadecimais espalhados pela aplicação.
*/
export const colors = {
  // Fundos
  background: '#080A10',       // Fundo principal da aplicação
  surface: '#12151D',          // Cards e elementos elevados
  surfaceLight: '#191D28',     // Cards/inputs ligeiramente mais claros
  border: '#242836',           // Bordas e separadores

  // Cor principal
  primary: '#6758FF',          // Roxo principal (tabs, botões, destaques)
  primaryLight: '#8175FF',     // Versão mais clara do roxo
  primaryDark: '#5042DB',      // Versão mais escura

  // Texto
  text: '#FFFFFF',             // Texto principal
  textSecondary: '#9296A5',    // Texto secundário
  textMuted: '#626675',        // Texto menos importante

  // Finanças
  income: '#35D07F',           // Receitas
  incomeBackground: '#102A21', // Fundo de elementos de receita

  expense: '#FF4D61',          // Despesas
  expenseBackground: '#2D151D',// Fundo de elementos de despesa

  // Outras cores
  blue: '#459CF5',
  orange: '#FF9F43',
  purple: '#A855F7',

  // Utilidades
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};


/*
|--------------------------------------------------------------------------
| ESTILOS GLOBAIS
|--------------------------------------------------------------------------
| Estilos que podem ser reutilizados em várias páginas da aplicação.
*/
export const globalStyles = StyleSheet.create({

  /*
  |----------------------------------------------------------------------
  | LAYOUT
  |----------------------------------------------------------------------
  */

  // Container principal de uma página
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },

  // Container quando queremos espaço no topo
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  // Coloca elementos horizontalmente
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Row com um elemento em cada extremidade
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  /*
  |----------------------------------------------------------------------
  | TEXTOS
  |----------------------------------------------------------------------
  */

  // Título principal de uma página
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },

  // Subtítulo abaixo do título principal
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Título de uma secção
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 28,
    marginBottom: 16,
  },

  // Texto normal
  text: {
    fontSize: 15,
    color: colors.text,
  },

  // Texto secundário
  secondaryText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Texto pequeno, por exemplo datas e categorias
  smallText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Texto utilizado quando uma lista está vazia
  empty: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },


  /*
  |----------------------------------------------------------------------
  | HEADER
  |----------------------------------------------------------------------
  */

  // Header genérico utilizado no topo das páginas
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },


  /*
  |----------------------------------------------------------------------
  | CARDS
  |----------------------------------------------------------------------
  */

  // Card normal
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },

  // Card maior, como o card do saldo na Home
  largeCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
  },

  // Card de receita
  incomeCard: {
    flex: 1,
    backgroundColor: colors.incomeBackground,
    borderRadius: 14,
    padding: 16,
  },

  // Card de despesa
  expenseCard: {
    flex: 1,
    backgroundColor: colors.expenseBackground,
    borderRadius: 14,
    padding: 16,
  },


  /*
  |----------------------------------------------------------------------
  | BOTÕES
  |----------------------------------------------------------------------
  */

  // Botão principal roxo
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Texto do botão principal
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Botão secundário
  secondaryButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Texto do botão secundário
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },

  // Botão circular utilizado para ícones
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },


  /*
  |----------------------------------------------------------------------
  | INPUTS
  |----------------------------------------------------------------------
  */

  // Input padrão
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Label que aparece por cima de inputs
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },


  /*
  |----------------------------------------------------------------------
  | TRANSAÇÕES
  |----------------------------------------------------------------------
  */

  // Linha de uma transação
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  // Valor positivo (receita)
  incomeText: {
    color: colors.income,
    fontWeight: '600',
  },

  // Valor negativo (despesa)
  expenseText: {
    color: colors.expense,
    fontWeight: '600',
  },


  /*
  |----------------------------------------------------------------------
  | SEPARADORES
  |----------------------------------------------------------------------
  */

  // Linha horizontal para separar conteúdos
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});