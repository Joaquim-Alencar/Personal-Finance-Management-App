
import { globalStyles } from '@/styles/global';
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';

export default function HomeScreen() {
  return (

     <ScrollView
      style={globalStyles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <Text style={globalStyles.title}>Home Screen</Text>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
});
