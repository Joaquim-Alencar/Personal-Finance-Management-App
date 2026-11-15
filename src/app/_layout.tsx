
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <NavigationBar style="dark" />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
