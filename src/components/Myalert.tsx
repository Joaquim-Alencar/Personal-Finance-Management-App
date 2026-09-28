import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type MyAlertProps = {
  visible: boolean;
  title?: string;
  message?: string;

  // Permite colocar componentes dentro do MyAlert
  children?: ReactNode;
   type?: 'success' | 'error';
  cancelText?: string;
  confirmText?: string;

  // Define se o botão Cancel aparece
  showCancel?: boolean;

  onCancel: () => void;
  onConfirm: () => void;
};

export default function MyAlert({
  visible,
  title = 'Confirmar',
  message,
  children,
  cancelText = 'Cancelar',
  confirmText = 'Confirmar',
  showCancel = true,
  type = 'success',
  onCancel,
  onConfirm,
}: MyAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>

        <View style={styles.modal}>

          {/* Ícone no topo */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor:
                  type === 'error'
                    ? colors.expenseBackground
                    : colors.incomeBackground,
              },
            ]}
          >
            <Ionicons
              name={type === 'error' ? 'close' : 'checkmark'}
              size={28}
              color={type === 'error' ? colors.expense : colors.income}
            />
          </View>

          {/* Título */}
          <Text style={styles.title}>
            {title}
          </Text>

          {/* Mensagem - só aparece se existir */}
          {message && (
            <Text style={styles.message}>
              {message}
            </Text>
          )}

          {/*
            Conteúdo personalizado.
            Aqui podem aparecer TextInputs, Text, Views, etc.
          */}
          {children && (
            <View style={styles.content}>
              {children}
            </View>
          )}

          {/* Botões */}
          <View style={styles.buttons}>

            {/* Cancel só aparece se showCancel for true */}
            {showCancel && (
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onCancel}
              >
                <Text style={styles.cancelText}>
                  {cancelText}
                </Text>
              </Pressable>
            )}

            {/* Botão principal */}
            <Pressable
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>
                {confirmText}
              </Text>
            </Pressable>

          </View>

        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({

  // Fundo atrás do alerta
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  // Caixa principal
  modal: {
    width: '100%',
    maxWidth: 380,

    backgroundColor: colors.surface,

    borderRadius: 20,
    padding: 24,

    borderWidth: 1,
    borderColor: colors.border,
  },

  // Círculo do ícone
  iconContainer: {
    width: 56,
    height: 56,

    borderRadius: 28,

    backgroundColor: colors.surfaceLight,

    justifyContent: 'center',
    alignItems: 'center',

    alignSelf: 'center',

    marginBottom: 18,
  },

  // Título
  title: {
    color: colors.text,

    fontSize: 21,
    fontWeight: '700',

    textAlign: 'center',

    marginBottom: 8,
  },

  // Mensagem
  message: {
    color: colors.textSecondary,

    fontSize: 14,
    lineHeight: 21,

    textAlign: 'center',

    marginBottom: 24,
  },

  // Conteúdo personalizado
  content: {
    marginTop: 8,
    marginBottom: 24,
  },

  // Área dos botões
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },

  // Cancelar
  cancelButton: {
    flex: 1,

    paddingVertical: 14,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.surfaceLight,

    borderWidth: 1,
    borderColor: colors.border,
  },

  // Confirmar
  confirmButton: {
    flex: 1,

    paddingVertical: 14,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.primary,
  },

  // Feedback quando carregamos num botão
  buttonPressed: {
    opacity: 0.75,
  },

  // Texto Cancelar
  cancelText: {
    color: colors.textSecondary,

    fontSize: 15,
    fontWeight: '600',
  },

  // Texto Confirmar
  confirmText: {
    color: colors.white,

    fontSize: 15,
    fontWeight: '700',
  },

});