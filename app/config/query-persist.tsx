import React from 'react';
import { QueryCache } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryCache = new QueryCache({
    onError: (error: any) => {
      Alert.alert(
        'Erro',
        error.message || 'Ocorreu um erro inesperado',
        [{ text: 'OK' }]
      );
    },
  });

  return <>{children}</>;
};
