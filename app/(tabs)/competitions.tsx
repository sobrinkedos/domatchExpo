import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, FAB, Portal, Modal, TextInput, Button, Surface, Chip, IconButton, SegmentedButtons } from 'react-native-paper';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Competition = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'in_progress' | 'finished';
  community_id: string;
  created_at: string;
  community: {
    name: string;
  };
};

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
};

export default function CompetitionsScreen() {
  const { profile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [gamesVisible, setGamesVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<{ id: string; name: string } | null>(null);
  const [communities, setCommunities] = useState<{ id: string; name: string; }[]>([]);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'finished'>('all');

  const showModal = async () => {
    await fetchCommunities();
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setSelectedCommunity(null);
  };

  const showGames = async (competition: Competition) => {
    setSelectedCompetition(competition);
    await fetchGames(competition.id);
    setGamesVisible(true);
  };

  const hideGames = () => {
    setGamesVisible(false);
    setSelectedCompetition(null);
  };

  const fetchCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name')
        .eq('created_by', profile?.id);

      if (error) throw error;

      setCommunities(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar comunidades:', error);
    }
  };

  const createCompetition = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da competição é obrigatório');
      return;
    }

    if (!selectedCommunity) {
      Alert.alert('Erro', 'Selecione uma comunidade');
      return;
    }

    try {
      setLoading(true);

      const { data: competition, error } = await supabase
        .from('competitions')
        .insert({
          name: name.trim(),
          community_id: selectedCommunity.id,
          status: 'draft',
        })
        .select('*, community:communities(name)')
        .single();

      if (error) throw error;

      setCompetitions([competition, ...competitions]);
      setVisible(false);
      setName('');
      setSelectedCommunity(null);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('competitions')
        .select('*, community:communities(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompetitions(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar competições:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async (competitionId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select('*, player1:players!player1_id(*), player2:players!player2_id(*)')
        .eq('competition_id', competitionId)
        .order('created_at');

      if (error) throw error;

      setGames(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar jogos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async () => {
    if (!selectedCompetition) return;

    try {
      const { data: players, error: playersError } = await supabase
        .from('community_members')
        .select('player:players(*)')
        .eq('community_id', selectedCompetition.community_id);

      if (playersError) throw playersError;

      // Aqui você pode implementar um modal de seleção de jogadores
      // Por enquanto, vamos apenas mostrar um alerta
      Alert.alert(
        'Novo Jogo',
        'Implementar seleção de jogadores da comunidade'
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  React.useEffect(() => {
    fetchCompetitions();
  }, [profile?.id, filter]);

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Competições
        </Text>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as typeof filter)}
          buttons={[
            { value: 'all', label: 'Todas' },
            { value: 'in_progress', label: 'Em Andamento' },
            { value: 'finished', label: 'Finalizadas' },
          ]}
          style={styles.filter}
        />
      </Surface>

      <ScrollView style={styles.content}>
        {competitions.map((competition) => (
          <Surface key={competition.id} style={styles.competitionCard} elevation={1}>
            <View style={styles.competitionHeader}>
              <View style={styles.competitionInfo}>
                <Text variant="titleMedium" style={styles.competitionName}>
                  {competition.name}
                </Text>
                <Text variant="bodySmall" style={styles.communityName}>
                  {competition.community.name}
                </Text>
                {competition.description && (
                  <Text variant="bodyMedium" style={styles.description}>
                    {competition.description}
                  </Text>
                )}
              </View>
              <Chip
                mode="flat"
                textStyle={{ color: '#fff' }}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor:
                      competition.status === 'draft'
                        ? '#FFC107'
                        : competition.status === 'in_progress'
                        ? '#2196F3'
                        : '#4CAF50',
                  },
                ]}
              >
                {competition.status === 'draft'
                  ? 'Rascunho'
                  : competition.status === 'in_progress'
                  ? 'Em Andamento'
                  : 'Finalizada'}
              </Chip>
            </View>

            <View style={styles.dateContainer}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.date}>
                {new Date(competition.start_date).toLocaleDateString()}
                {competition.end_date &&
                  ` - ${new Date(competition.end_date).toLocaleDateString()}`}
              </Text>
            </View>

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => showGames(competition)}
                icon="gamepad-variant"
                style={styles.actionButton}
              >
                Jogos
              </Button>
            </View>
          </Surface>
        ))}
      </ScrollView>

      {/* Modal de Nova Competição */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Nova Competição
          </Text>
          <TextInput
            label="Nome"
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
            label="Data de Término (opcional)"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="DD/MM/AAAA"
            style={styles.input}
          />
          {communities.length > 0 ? (
            <View style={styles.communitiesContainer}>
              <Text variant="bodyMedium" style={styles.selectLabel}>
                Selecione uma comunidade:
              </Text>
              <ScrollView horizontal style={styles.communitiesList}>
                {communities.map((community) => (
                  <Chip
                    key={community.id}
                    selected={selectedCommunity?.id === community.id}
                    onPress={() => setSelectedCommunity(community)}
                    style={styles.communityChip}
                    mode={selectedCommunity?.id === community.id ? 'flat' : 'outlined'}
                  >
                    {community.name}
                  </Chip>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.noCommunities}>
              Você precisa criar uma comunidade primeiro
            </Text>
          )}
          <Button
            mode="contained"
            onPress={createCompetition}
            loading={loading}
            disabled={loading || !selectedCommunity}
            style={styles.button}
          >
            Criar Competição
          </Button>
        </Modal>

        {/* Modal de Jogos */}
        <Modal
          visible={gamesVisible}
          onDismiss={hideGames}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Jogos
            </Text>
            <IconButton icon="close" onPress={hideGames} />
          </View>

          <ScrollView style={styles.gamesList}>
            {games.map((game) => (
              <Surface key={game.id} style={styles.gameCard} elevation={1}>
                <View style={styles.gameHeader}>
                  <Text variant="bodySmall" style={styles.gameDate}>
                    {new Date(game.created_at).toLocaleDateString()}
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

                <View style={styles.players}>
                  <View style={styles.player}>
                    <Text variant="titleMedium">{game.player1.name}</Text>
                    <Text variant="bodyMedium" style={styles.nickname}>
                      {game.player1.nickname}
                    </Text>
                    {game.status === 'finished' && (
                      <Text variant="headlineMedium" style={styles.score}>
                        {game.player1_score}
                      </Text>
                    )}
                  </View>

                  <Text variant="titleLarge" style={styles.vs}>
                    VS
                  </Text>

                  <View style={styles.player}>
                    <Text variant="titleMedium">{game.player2.name}</Text>
                    <Text variant="bodyMedium" style={styles.nickname}>
                      {game.player2.nickname}
                    </Text>
                    {game.status === 'finished' && (
                      <Text variant="headlineMedium" style={styles.score}>
                        {game.player2_score}
                      </Text>
                    )}
                  </View>
                </View>

                {game.status === 'finished' && game.winner_id && (
                  <View style={styles.winner}>
                    <MaterialCommunityIcons name="trophy" size={20} color="#FFC107" />
                    <Text variant="bodyMedium" style={styles.winnerText}>
                      Vencedor:{' '}
                      {game.winner_id === game.player1_id
                        ? game.player1.name
                        : game.player2.name}
                    </Text>
                  </View>
                )}
              </Surface>
            ))}
          </ScrollView>

          {selectedCompetition?.status !== 'finished' && (
            <Button
              mode="contained"
              onPress={createGame}
              icon="plus"
              style={styles.addGameButton}
            >
              Novo Jogo
            </Button>
          )}
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
        label="Nova Competição"
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
    marginBottom: 16,
  },
  filter: {
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  competitionCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  competitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  competitionInfo: {
    flex: 1,
    marginRight: 12,
  },
  competitionName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  communityName: {
    color: '#666',
    marginBottom: 8,
  },
  description: {
    color: '#666',
  },
  statusChip: {
    borderRadius: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    color: '#666',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    minWidth: 120,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  communitiesContainer: {
    marginBottom: 16,
  },
  selectLabel: {
    marginBottom: 8,
  },
  communitiesList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  communityChip: {
    marginRight: 8,
  },
  noCommunities: {
    color: '#666',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 8,
  },
  gamesList: {
    maxHeight: 400,
  },
  gameCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameDate: {
    color: '#666',
  },
  players: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  player: {
    flex: 1,
    alignItems: 'center',
  },
  nickname: {
    color: '#666',
  },
  vs: {
    marginHorizontal: 16,
    color: '#666',
  },
  score: {
    marginTop: 8,
    color: '#2196F3',
  },
  winner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  winnerText: {
    marginLeft: 8,
    color: '#666',
  },
  addGameButton: {
    marginTop: 16,
  },
});
