import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';

export default function TabTwoScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Explorar
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        Em breve você poderá explorar competições e comunidades de dominó aqui!
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push('/profile')}
        style={styles.button}
      >
        Ver Perfil
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 16,
  },
});
