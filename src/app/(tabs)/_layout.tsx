import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import SwipeNavigation from '../../components/SwipeNavigation';
import { colors } from '../../styles/global';

//--------------Componente TabLayout, que define a navegação por abas do aplicativo
export default function TabLayout() {

  return (

    <SwipeNavigation>

      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.surface,
          },

          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
        }}
      >

        {/* Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="home-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="transaction"
          options={{
            title: 'Transactions',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="swap-horizontal-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="newtransaction"
          options={{
            title: 'New Transaction',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="add-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="goals"
          options={{
            title: 'goals',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="trophy-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

      </Tabs>

    </SwipeNavigation>

  );
}