import { QueryClientProvider, QueryKey } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryClient } from './react-query';
import { getData, storeData } from './storage';

const QUERY_CACHE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

export const QueryPersistProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Restaurar cache ao iniciar
    const restoreCache = async () => {
      const cache = await getData<Array<[QueryKey, unknown]>>(QUERY_CACHE_KEY);
      if (cache) {
        cache.forEach(([key, value]) => {
          queryClient.setQueryData(key, value);
        });
      }
    };
    restoreCache();
  }, []);

  useEffect(() => {
    // Salvar cache ao mudar
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const queries = queryClient.getQueryCache().findAll();
      const cache = queries.map(query => [query.queryKey, query.state.data] as [QueryKey, unknown]);
      storeData(QUERY_CACHE_KEY, cache);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
