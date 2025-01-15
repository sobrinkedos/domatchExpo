import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, FAB, Portal, Modal, TextInput, Button, Surface, Chip } from 'react-native-paper';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Tournament = {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  prize: string;
  status: 'open' | 'in_progress' | 'finished';
};

export default function TournamentsScreen() {
  const { profile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [prize, setPrize] = useState('');

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setName('');
    setDescription('');
    setStartDate('');
    setMaxParticipants('');
    setPrize('');
  };

  const createTournament = async () => {
    if (!name || !description || !startDate || !maxParticipants || !prize) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .insert([
          {
            name,
            description,
            start_date: startDate,
            max_participants: parseInt(maxParticipants),
            prize,
            status: 'open',
          },
        ])
        .select();

      if (error) throw error;

      Alert.alert('Sucesso', 'Torneio criado com sucesso!');
      hideModal();
      fetchTournaments();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;

      setTournaments(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar torneios:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (tournamentId: number) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('tournament_participants')
        .insert([
          {
            tournament_id: tournamentId,
            player_id: profile?.id,
          },
        ]);

      if (error) throw error;

      Alert.alert('Sucesso', 'Inscrição realizada com sucesso!');
      fetchTournaments();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTournaments();
  }, []);

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'open':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      case 'finished':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'open':
        return 'Aberto';
      case 'in_progress':
        return 'Em Andamento';
      case 'finished':
        return 'Finalizado';
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Torneios
        </Text>
      </Surface>

      <ScrollView style={styles.content}>
        {tournaments.map((tournament) => (
          <Surface key={tournament.id} style={styles.tournamentCard} elevation={1}>
            <View style={styles.tournamentHeader}>
              <Text variant="titleLarge" style={styles.tournamentName}>
                {tournament.name}
              </Text>
              <Chip
                mode="flat"
                textStyle={{ color: '#fff' }}
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(tournament.status) },
                ]}
              >
                {getStatusText(tournament.status)}
              </Chip>
            </View>

            <Text variant="bodyMedium" style={styles.description}>
              {tournament.description}
            </Text>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text variant="bodyMedium" style={styles.infoText}>
                  {new Date(tournament.start_date).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="account-group" size={20} color="#666" />
                <Text variant="bodyMedium" style={styles.infoText}>
                  {tournament.current_participants}/{tournament.max_participants}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="trophy" size={20} color="#666" />
                <Text variant="bodyMedium" style={styles.infoText}>
                  {tournament.prize}
                </Text>
              </View>
            </View>

            {tournament.status === 'open' && (
              <Button
                mode="contained"
                onPress={() => joinTournament(tournament.id)}
                style={styles.joinButton}
              >
                Participar
              </Button>
            )}
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
            Novo Torneio
          </Text>
          <TextInput
            label="Nome do Torneio"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <TextInput
            label="Data de Início"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="DD/MM/AAAA"
            style={styles.input}
          />
          <TextInput
            label="Número Máximo de Participantes"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Premiação"
            value={prize}
            onChangeText={setPrize}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={createTournament}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Criar Torneio
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
        label="Novo Torneio"
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
  tournamentCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentName: {
    flex: 1,
    marginRight: 12,
    fontWeight: 'bold',
  },
  statusChip: {
    borderRadius: 16,
  },
  description: {
    color: '#666',
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 4,
    color: '#666',
  },
  joinButton: {
    marginTop: 8,
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
  button: {
    marginTop: 8,
  },
});
