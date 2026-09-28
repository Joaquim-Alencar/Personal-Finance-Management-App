import { deleteTransaction } from '@/storage/transactions';
import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MyAlert from './Myalert';


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


export default function TransactionItem({
  id,
  type,
  value,
  category,
  description,
  date,
  onDelete,
}: TransactionItemProps) {

  // Controla o alerta de eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  // -------------------- Informação da categoria

  function getCategoryInfo(): {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
  } {

    if (category.toLowerCase() === 'food') {
      return {
        icon: 'restaurant-outline',
        color: '#FF9F43',
      };

    } else if (category.toLowerCase() === 'transport') {
      return {
        icon: 'car-outline',
        color: '#459CF5',
      };

    } else if (category.toLowerCase() === 'house') {
      return {
        icon: 'home-outline',
        color: '#A855F7',
      };

    } else if (category.toLowerCase() === 'leisure') {
      return {
        icon: 'game-controller-outline',
        color: '#EC4899',
      };

    } else if (category.toLowerCase() === 'health') {
      return {
        icon: 'heart-outline',
        color: '#FF4D61',
      };

    } else if (category.toLowerCase() === 'education') {
      return {
        icon: 'book-outline',
        color: '#38BDF8',
      };

    } else if (category.toLowerCase() === 'shopping') {
      return {
        icon: 'bag-outline',
        color: '#FBBF24',
      };

    } else if (category.toLowerCase() === 'bills') {
      return {
        icon: 'document-text-outline',
        color: '#35D07F',
      };

    } else {
      return {
        icon: 'ellipsis-horizontal',
        color: '#9296A5',
      };
    }
  }


  const categoryInfo = getCategoryInfo();


  // -------------------- Long press

  const handleLongPress = () => {
    setShowDeleteModal(true);
  };


  // -------------------- Eliminar

  const handleDelete = async () => {

    setShowDeleteModal(false);

    await deleteTransaction(id);

    // Atualiza a lista depois de apagar
    onDelete();
  };


  return (
    <>

      {/* -------------------- Transação */}

      <TouchableOpacity
        style={styles.container}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >

        {/* Ícone */}

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                categoryInfo.color + '20',
            },
          ]}
        >

          <Ionicons
            name={categoryInfo.icon}
            size={24}
            color={categoryInfo.color}
          />

        </View>


        {/* -------------------- Informação */}

        <View style={styles.info}>

          <Text style={styles.category}>
            {category}
          </Text>

          <Text style={styles.description}>
            {description || 'Sem descrição'}
          </Text>

          <Text style={styles.date}>
            {new Date(date).toLocaleDateString('pt-PT')}
          </Text>

        </View>


        {/* -------------------- Valor */}

        <Text
          style={[
            styles.value,

            type === 'receita'
              ? styles.income
              : styles.expense,
          ]}
        >
          {type === 'receita' ? '+' : '-'}
          {value.toFixed(2)} €
        </Text>

      </TouchableOpacity>


      {/* -------------------- Alerta */}

      <MyAlert
        visible={showDeleteModal}
        title="Eliminar transação?"
        message={`Tens a certeza que queres eliminar "${category}"?`}
        cancelText="Cancelar"
        confirmText="Eliminar"

        onCancel={() =>
          setShowDeleteModal(false)
        }

        onConfirm={handleDelete}
      />

    </>
  );
}


const styles = StyleSheet.create({

  // -------------------- Linha da transação

  container: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 14,
    paddingVertical: 16,

    // Linha que separa as transações
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },


  // -------------------- Ícone

  iconContainer: {
    width: 46,
    height: 46,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },


  // -------------------- Informação

  info: {
    flex: 1,
  },

  category: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },

  description: {
    fontSize: 13,
    color: colors.textSecondary,

    marginTop: 2,
  },

  date: {
    fontSize: 11,
    color: colors.textMuted,

    marginTop: 3,
  },


  // -------------------- Valor

  value: {
    fontSize: 15,
    fontWeight: '700',

    marginLeft: 10,
  },

  income: {
    color: colors.income,
  },

  expense: {
    color: colors.expense,
  },

});