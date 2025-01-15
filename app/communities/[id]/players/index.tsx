import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, FAB, useTheme, ActivityIndicator, Avatar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../src/lib/supabase';
import { Database } from '../../../../types/database';

type Player = Database['public']['Tables']['players']['Row'];

export default function CommunityPlayersScreen() {
  const { id: communityId } = useLocalSearchParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          player:players(
            id,
            name,
            nickname,
            phone
          )
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Extrair os jogadores do resultado aninhado
      const playersList = data
        .map(item => item.player)
        .filter((player): player is Player => player !== null);

      setPlayers(playersList);
    } catch (error: any) {
      console.error('Erro ao buscar jogadores:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlayers();
  };

  useEffect(() => {
    fetchPlayers();
  }, [communityId]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderPlayerCard = ({ item }: { item: Player }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/communities/${communityId}/players/${item.id}`)}
    >
      <Card.Title
        title={item.name}
        subtitle={item.nickname || 'Sem apelido'}
        left={(props) => (
          <Avatar.Text
            {...props}
            label={getInitials(item.name)}
            size={40}
          />
        )}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        renderItem={renderPlayerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">Nenhum jogador encontrado</Text>
            <Text variant="bodyMedium">Adicione jogadores para começar!</Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push(`/communities/${communityId}/players/add`)}
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
