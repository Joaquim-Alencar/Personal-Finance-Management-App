import { router, usePathname } from 'expo-router';
import { ReactNode } from 'react';
import {
  PanResponder,
  View,
} from 'react-native';

type SwipeNavigationProps = {
  children: ReactNode;
};

export default function SwipeNavigation({
  children,
}: SwipeNavigationProps) {

  const pathname = usePathname();

  // Ordem das páginas
  const pages = [
    '/',
    '/add-meal',
    '/meals',
  ];

  const panResponder = PanResponder.create({

    // Começa a detetar o gesto quando existe movimento horizontal
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },

    // Quando o utilizador termina o gesto
    onPanResponderRelease: (_, gestureState) => {

      const currentIndex = pages.indexOf(pathname);

      if (currentIndex === -1) {
        return;
      }

      // Swipe para a ESQUERDA
      // Vai para a página da direita
      if (
        gestureState.dx < -50 &&
        currentIndex < pages.length - 1
      ) {
        router.replace(pages[currentIndex + 1] as any);
      }

      // Swipe para a DIREITA
      // Vai para a página da esquerda
      if (
        gestureState.dx > 50 &&
        currentIndex > 0
      ) {
        router.replace(pages[currentIndex - 1] as any);
      }
    },
  });

  return (
    <View
      style={{ flex: 1 }}
      {...panResponder.panHandlers}
    >
      {children}
    </View>
  );
}