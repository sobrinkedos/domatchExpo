import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, FAB, Portal, Modal, TextInput, Button, Surface, IconButton } from 'react-native-paper';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Match = {
  id: number;
  opponent_name: string;
  my_score: number;
  opponent_score: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
};

export default function MatchesScreen() {
  const { profile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [opponentName, setOpponentName] = useState('');
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setOpponentName('');
    setMyScore('');
    setOpponentScore('');
  };

  const createMatch = async () => {
    if (!opponentName || !myScore || !opponentScore) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .insert([
          {
            player_id: profile?.id,
            opponent_name: opponentName,
            my_score: parseInt(myScore),
            opponent_score: parseInt(opponentScore),
            status: 'completed',
          },
        ])
        .select();

      if (error) throw error;

      Alert.alert('Sucesso', 'Partida registrada com sucesso!');
      hideModal();
      fetchMatches();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('player_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMatches(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar partidas:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMatches();
  }, [profile?.id]);

  const getMatchResult = (match: Match) => {
    if (match.my_score > match.opponent_score) return 'Vitória';
    if (match.my_score < match.opponent_score) return 'Derrota';
    return 'Empate';
  };

  const getMatchColor = (match: Match) => {
    const result = getMatchResult(match);
    if (result === 'Vitória') return '#4CAF50';
    if (result === 'Derrota') return '#F44336';
    return '#FFC107';
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Minhas Partidas
        </Text>
      </Surface>

      <ScrollView style={styles.content}>
        {matches.map((match) => (
          <Surface key={match.id} style={styles.matchCard} elevation={1}>
            <View style={styles.matchHeader}>
              <Text variant="titleMedium">{match.opponent_name}</Text>
              <Text
                variant="bodyMedium"
                style={[styles.result, { color: getMatchColor(match) }]}
              >
                {getMatchResult(match)}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <View style={styles.scoreItem}>
                <Text variant="titleLarge">{match.my_score}</Text>
                <Text variant="bodySmall">Você</Text>
              </View>
              <Text variant="titleLarge" style={styles.versus}>
                x
              </Text>
              <View style={styles.scoreItem}>
                <Text variant="titleLarge">{match.opponent_score}</Text>
                <Text variant="bodySmall">Oponente</Text>
              </View>
            </View>
            <Text variant="bodySmall" style={styles.date}>
              {new Date(match.created_at).toLocaleDateString()}
            </Text>
          </Surface>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Nova Partida
          </Text>
          <TextInput
            label="Nome do Oponente"
            value={opponentName}
            onChangeText={setOpponentName}
            style={styles.input}
          />
          <View style={styles.scoreInputs}>
            <TextInput
              label="Sua Pontuação"
              value={myScore}
              onChangeText={setMyScore}
              keyboardType="numeric"
              style={[styles.input, styles.scoreInput]}
            />
            <TextInput
              label="Pontuação Oponente"
              value={opponentScore}
              onChangeText={setOpponentScore}
              keyboardType="numeric"
              style={[styles.input, styles.scoreInput]}
            />
          </View>
          <Button
            mode="contained"
            onPress={createMatch}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Registrar Partida
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
        label="Nova Partida"
      />
    </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  matchCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  result: {
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  versus: {
    marginHorizontal: 16,
    color: '#666',
  },
  date: {
    color: '#666',
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  scoreInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  scoreInput: {
    flex: 1,
  },
  button: {
    marginTop: 8,
  },
});
