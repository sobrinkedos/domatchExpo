import React from 'react';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/lib/auth';
import { queryClient } from '../src/lib/react-query';
import { theme } from '../src/lib/theme';
import * as Font from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function RootLayoutNav() {
  const { session } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  React.useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, segments, navigationState?.key]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(MaterialCommunityIcons.font);
        setFontsLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar fontes:', error);
        // Mesmo com erro, vamos permitir que o app continue
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
