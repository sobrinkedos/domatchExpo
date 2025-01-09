import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { AuthProvider } from '@config/auth';
import { QueryPersistProvider } from '@config/query-persist';
import { useColorScheme } from '@hooks/useColorScheme';
import { theme, queryClient } from '@config';
import { Alert } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const queryCache = new QueryCache({
    onError: (error) => {
      Alert.alert(
        'Erro',
        error.message || 'Ocorreu um erro inesperado',
        [{ text: 'OK' }]
      );
    },
  });

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <QueryPersistProvider>
          <PaperProvider theme={theme}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen 
                  name="(tabs)" 
                  options={{ 
                    headerShown: false,
                    gestureEnabled: false 
                  }} 
                />
                <Stack.Screen 
                  name="+not-found" 
                  options={{ 
                    title: 'Página não encontrada',
                    gestureEnabled: false
                  }} 
                />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </PaperProvider>
        </QueryPersistProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
