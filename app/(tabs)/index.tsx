import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, Card, Avatar, Button, useTheme } from 'react-native-paper';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Summary = {
  playersCount: number;
  communitiesCount: number;
  activeCompetitionsCount: number;
  recentGames: Array<{
    id: string;
    player1: { name: string; nickname: string };
    player2: { name: string; nickname: string };
    player1_score: number;
    player2_score: number;
    created_at: string;
    competition: { name: string };
  }>;
};

export default function HomeScreen() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState<Summary>({
    playersCount: 0,
    communitiesCount: 0,
    activeCompetitionsCount: 0,
    recentGames: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const fetchSummary = async () => {
    try {
      // Buscar contagem de jogadores
      const { data: players } = await supabase
        .from('players')
        .select('id');

      // Buscar contagem de comunidades
      const { data: communities } = await supabase
        .from('communities')
        .select('id');

      // Buscar contagem de competições ativas
      const { data: activeCompetitions } = await supabase
        .from('competitions')
        .select('id')
        .eq('status', 'in_progress');

      const recentGames = await fetchRecentGames();

      setSummary({
        playersCount: players?.length || 0,
        communitiesCount: communities?.length || 0,
        activeCompetitionsCount: activeCompetitions?.length || 0,
        recentGames: recentGames || []
      });
    } catch (error: any) {
      console.error('Erro ao buscar resumo:', error.message);
    }
  };

  const fetchRecentGames = async () => {
    try {
      // Primeiro busca os jogos
      const { data: games } = await supabase
        .from('games')
        .select('id, player1_id, player2_id, player1_score, player2_score, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!games || games.length === 0) return [];

      // Depois busca os jogadores
      const playerIds = [...new Set(games.flatMap(game => [game.player1_id, game.player2_id]))];
      const { data: players } = await supabase
        .from('players')
        .select('id, name, nickname')
        .in('id', playerIds);

      if (!players) return games;

      // Mapeia os jogadores para um objeto para fácil acesso
      const playersMap = players.reduce((acc, player) => ({
        ...acc,
        [player.id]: player
      }), {});

      // Combina os dados
      return games.map(game => ({
        ...game,
        player1: playersMap[game.player1_id] || null,
        player2: playersMap[game.player2_id] || null
      }));
    } catch (error: any) {
      console.error('Erro ao buscar jogos recentes:', error.message);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSummary();
  }, [profile?.id]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Bem-vindo ao DoMatch
        </Text>
      </Surface>

      <View style={styles.statsContainer}>
        <Surface style={[styles.statCard, { backgroundColor: theme.colors.primary }]} elevation={2}>
          <MaterialCommunityIcons name="account-group" size={32} color="#fff" />
          <Text variant="titleLarge" style={styles.statNumber}>
            {summary.playersCount}
          </Text>
          <Text variant="bodyMedium" style={styles.statLabel}>
            Jogadores
          </Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: '#4CAF50' }]} elevation={2}>
          <MaterialCommunityIcons name="home-group" size={32} color="#fff" />
          <Text variant="titleLarge" style={styles.statNumber}>
            {summary.communitiesCount}
          </Text>
          <Text variant="bodyMedium" style={styles.statLabel}>
            Comunidades
          </Text>
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: '#FF9800' }]} elevation={2}>
          <MaterialCommunityIcons name="trophy" size={32} color="#fff" />
          <Text variant="titleLarge" style={styles.statNumber}>
            {summary.activeCompetitionsCount}
          </Text>
          <Text variant="bodyMedium" style={styles.statLabel}>
            Competições Ativas
          </Text>
        </Surface>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Jogos Recentes
        </Text>
        {summary.recentGames.length > 0 ? (
          summary.recentGames.map((game) => (
            <Card key={game.id} style={styles.gameCard} mode="elevated">
              <Card.Content>
                <Text variant="bodySmall" style={styles.competitionName}>
                  {/* {game.competition.name} */}
                </Text>
                <View style={styles.gameContent}>
                  <View style={styles.player}>
                    <Avatar.Text
                      size={40}
                      label={game.player1.name.substring(0, 2).toUpperCase()}
                      style={styles.avatar}
                    />
                    <Text variant="titleMedium" style={styles.playerName}>
                      {game.player1.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.score}>
                      {game.player1_score}
                    </Text>
                  </View>

                  <Text variant="titleLarge" style={styles.vs}>
                    VS
                  </Text>

                  <View style={styles.player}>
                    <Avatar.Text
                      size={40}
                      label={game.player2.name.substring(0, 2).toUpperCase()}
                      style={styles.avatar}
                    />
                    <Text variant="titleMedium" style={styles.playerName}>
                      {game.player2.name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.score}>
                      {game.player2_score}
                    </Text>
                  </View>
                </View>
                <Text variant="bodySmall" style={styles.date}>
                  {new Date(game.created_at).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="gamepad-variant" size={48} color="#666" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nenhum jogo registrado ainda
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/competitions')}
              style={styles.createButton}
            >
              Criar Competição
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  gameCard: {
    marginBottom: 12,
  },
  competitionName: {
    color: '#666',
    marginBottom: 8,
  },
  gameContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  player: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 8,
  },
  playerName: {
    textAlign: 'center',
    marginBottom: 4,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  vs: {
    marginHorizontal: 16,
    color: '#666',
  },
  date: {
    color: '#666',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 16,
  },
});
