import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, Button, TextInput, Portal, Modal, Avatar, IconButton, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Game = {
  id: string;
  competition_id: string;
  player1_id: string;
  player2_id: string;
  player1_score: number;
  player2_score: number;
  status: 'scheduled' | 'in_progress' | 'finished';
  winner_id: string | null;
  created_at: string;
  player1: {
    name: string;
    nickname: string;
  };
  player2: {
    name: string;
    nickname: string;
  };
  competition: {
    name: string;
    community_id: string;
  };
};

type Match = {
  id: string;
  game_id: string;
  player1_score: number;
  player2_score: number;
  notes: string;
  created_at: string;
};

export default function GameScreen() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<Game | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [notes, setNotes] = useState('');

  const fetchGame = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*, player1:players!player1_id(*), player2:players!player2_id(*), competition:competitions(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setGame(data);
    } catch (error) {
      console.error('Erro ao buscar jogo:', error);
      Alert.alert('Erro', 'Não foi possível carregar o jogo');
    }
  };

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('game_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Erro ao buscar partidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async () => {
    if (!player1Score || !player2Score) {
      Alert.alert('Erro', 'Por favor, preencha a pontuação dos dois jogadores');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from('matches').insert([
        {
          game_id: id,
          player1_score: parseInt(player1Score),
          player2_score: parseInt(player2Score),
          notes,
        },
      ]);

      if (error) throw error;

      // Atualizar o placar do jogo
      const totalPlayer1Score = matches.reduce(
        (sum, match) => sum + match.player1_score,
        parseInt(player1Score)
      );
      const totalPlayer2Score = matches.reduce(
        (sum, match) => sum + match.player2_score,
        parseInt(player2Score)
      );

      const { error: gameError } = await supabase
        .from('games')
        .update({
          player1_score: totalPlayer1Score,
          player2_score: totalPlayer2Score,
          status: 'in_progress',
        })
        .eq('id', id);

      if (gameError) throw gameError;

      Alert.alert('Sucesso', 'Partida registrada com sucesso!');
      setMatchModalVisible(false);
      setPlayer1Score('');
      setPlayer2Score('');
      setNotes('');
      fetchGame();
      fetchMatches();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const finishGame = async () => {
    if (!game) return;

    Alert.alert(
      'Finalizar Jogo',
      'Tem certeza que deseja finalizar este jogo? Isso não poderá ser desfeito.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const winnerId =
                game.player1_score > game.player2_score
                  ? game.player1_id
                  : game.player2_id;

              const { error } = await supabase
                .from('games')
                .update({
                  status: 'finished',
                  winner_id: winnerId,
                })
                .eq('id', id);

              if (error) throw error;

              Alert.alert('Sucesso', 'Jogo finalizado com sucesso!');
              fetchGame();
            } catch (error: any) {
              Alert.alert('Erro', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchGame();
    fetchMatches();
  }, [id]);

  if (!game) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <Text variant="titleMedium" style={styles.competitionName}>
            {game.competition.name}
          </Text>
          <Chip
            mode="flat"
            textStyle={{ color: '#fff' }}
            style={[
              styles.statusChip,
              {
                backgroundColor:
                  game.status === 'scheduled'
                    ? '#FFC107'
                    : game.status === 'in_progress'
                    ? '#2196F3'
                    : '#4CAF50',
              },
            ]}
          >
            {game.status === 'scheduled'
              ? 'Agendado'
              : game.status === 'in_progress'
              ? 'Em Andamento'
              : 'Finalizado'}
          </Chip>
        </View>
      </Surface>

      <Surface style={styles.scoreCard} elevation={2}>
        <View style={styles.players}>
          <View style={styles.player}>
            <Avatar.Text
              size={60}
              label={game.player1.name.substring(0, 2).toUpperCase()}
              style={styles.avatar}
            />
            <Text variant="titleMedium" style={styles.playerName}>
              {game.player1.name}
            </Text>
            <Text variant="bodyMedium" style={styles.nickname}>
              {game.player1.nickname}
            </Text>
            <Text variant="headlineLarge" style={styles.score}>
              {game.player1_score}
            </Text>
          </View>

          <Text variant="displaySmall" style={styles.vs}>
            VS
          </Text>

          <View style={styles.player}>
            <Avatar.Text
              size={60}
              label={game.player2.name.substring(0, 2).toUpperCase()}
              style={styles.avatar}
            />
            <Text variant="titleMedium" style={styles.playerName}>
              {game.player2.name}
            </Text>
            <Text variant="bodyMedium" style={styles.nickname}>
              {game.player2.nickname}
            </Text>
            <Text variant="headlineLarge" style={styles.score}>
              {game.player2_score}
            </Text>
          </View>
        </View>

        {game.status === 'finished' && game.winner_id && (
          <View style={styles.winner}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFC107" />
            <Text variant="titleMedium" style={styles.winnerText}>
              Vencedor:{' '}
              {game.winner_id === game.player1_id
                ? game.player1.name
                : game.player2.name}
            </Text>
          </View>
        )}

        {game.status !== 'finished' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => setMatchModalVisible(true)}
              icon="plus"
              style={styles.actionButton}
            >
              Nova Partida
            </Button>
            {matches.length > 0 && (
              <Button
                mode="contained-tonal"
                onPress={finishGame}
                icon="flag-checkered"
                style={styles.actionButton}
              >
                Finalizar Jogo
              </Button>
            )}
          </View>
        )}
      </Surface>

      <View style={styles.matchesSection}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Partidas
        </Text>

        {matches.map((match, index) => (
          <Surface key={match.id} style={styles.matchCard} elevation={1}>
            <View style={styles.matchHeader}>
              <Text variant="titleSmall" style={styles.matchNumber}>
                Partida {matches.length - index}
              </Text>
              <Text variant="bodySmall" style={styles.matchDate}>
                {new Date(match.created_at).toLocaleString()}
              </Text>
            </View>

            <View style={styles.matchScores}>
              <View style={styles.matchPlayer}>
                <Text variant="titleMedium">{game.player1.name}</Text>
                <Text variant="headlineMedium" style={styles.matchScore}>
                  {match.player1_score}
                </Text>
              </View>

              <Text variant="titleLarge" style={styles.matchVs}>
                VS
              </Text>

              <View style={styles.matchPlayer}>
                <Text variant="titleMedium">{game.player2.name}</Text>
                <Text variant="headlineMedium" style={styles.matchScore}>
                  {match.player2_score}
                </Text>
              </View>
            </View>

            {match.notes && (
              <Text variant="bodySmall" style={styles.matchNotes}>
                {match.notes}
              </Text>
            )}
          </Surface>
        ))}

        {matches.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="cards-playing-outline"
              size={48}
              color="#666"
            />
            <Text variant="bodyLarge" style={styles.emptyText}>
              Nenhuma partida registrada ainda
            </Text>
          </View>
        )}
      </View>

      <Portal>
        <Modal
          visible={matchModalVisible}
          onDismiss={() => setMatchModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Nova Partida
          </Text>

          <View style={styles.modalScores}>
            <View style={styles.modalPlayer}>
              <Text variant="titleMedium">{game.player1.name}</Text>
              <TextInput
                label="Pontuação"
                value={player1Score}
                onChangeText={setPlayer1Score}
                keyboardType="numeric"
                style={styles.scoreInput}
              />
            </View>

            <View style={styles.modalPlayer}>
              <Text variant="titleMedium">{game.player2.name}</Text>
              <TextInput
                label="Pontuação"
                value={player2Score}
                onChangeText={setPlayer2Score}
                keyboardType="numeric"
                style={styles.scoreInput}
              />
            </View>
          </View>

          <TextInput
            label="Observações (opcional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />

          <Button
            mode="contained"
            onPress={createMatch}
            loading={loading}
            disabled={loading}
            style={styles.modalButton}
          >
            Registrar Partida
          </Button>
        </Modal>
      </Portal>
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  competitionName: {
    fontWeight: 'bold',
  },
  statusChip: {
    borderRadius: 16,
  },
  scoreCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  players: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  player: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 8,
    backgroundColor: '#2196F3',
  },
  playerName: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nickname: {
    color: '#666',
    marginBottom: 8,
  },
  score: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  vs: {
    marginHorizontal: 16,
    color: '#666',
  },
  winner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
  },
  winnerText: {
    marginLeft: 8,
    color: '#F57C00',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  matchesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  matchCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchNumber: {
    fontWeight: 'bold',
  },
  matchDate: {
    color: '#666',
  },
  matchScores: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchPlayer: {
    flex: 1,
    alignItems: 'center',
  },
  matchScore: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 8,
  },
  matchVs: {
    marginHorizontal: 16,
    color: '#666',
  },
  matchNotes: {
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  modalScores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  modalPlayer: {
    flex: 1,
    alignItems: 'center',
  },
  scoreInput: {
    marginTop: 8,
    width: '100%',
  },
  notesInput: {
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 8,
  },
});
