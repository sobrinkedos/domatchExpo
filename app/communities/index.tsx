import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, FAB, useTheme, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Database } from '../../types/database';

type Community = Database['public']['Tables']['communities']['Row'];

export default function CommunitiesScreen() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar comunidades:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunities();
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const renderCommunityCard = ({ item }: { item: Community }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/communities/${item.id}`)}
    >
      <Card.Content>
        <Text variant="titleLarge">{item.name}</Text>
        {item.description && (
          <Text variant="bodyMedium" style={styles.description}>
            {item.description}
          </Text>
        )}
        {item.location && (
          <Text variant="bodySmall" style={styles.location}>
            📍 {item.location}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={communities}
        renderItem={renderCommunityCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">Nenhuma comunidade encontrada</Text>
            <Text variant="bodyMedium">Crie uma nova comunidade para começar!</Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/communities/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginTop: 8,
  },
  location: {
    marginTop: 4,
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
});
