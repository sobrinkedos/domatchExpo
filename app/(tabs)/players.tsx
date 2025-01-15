import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, FAB, Portal, Modal, TextInput, Button, Surface, Avatar, IconButton } from 'react-native-paper';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';

type Player = {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  created_at: string;
  created_by: string;
};

export default function PlayersScreen() {
  const { profile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setName('');
    setNickname('');
    setPhone('');
  };

  const createPlayer = async () => {
    if (!name || !nickname) {
      Alert.alert('Erro', 'Por favor, preencha nome e apelido');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            name,
            nickname,
            phone,
            created_by: profile?.id,
          },
        ])
        .select();

      if (error) throw error;

      Alert.alert('Sucesso', 'Jogador cadastrado com sucesso!');
      hideModal();
      fetchPlayers();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('created_by', profile?.id)
        .order('name');

      if (error) throw error;

      setPlayers(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar jogadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlayer = async (playerId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este jogador?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', playerId);

              if (error) throw error;

              Alert.alert('Sucesso', 'Jogador excluído com sucesso!');
              fetchPlayers();
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

  React.useEffect(() => {
    fetchPlayers();
  }, [profile?.id]);

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Meus Jogadores
        </Text>
      </Surface>

      <ScrollView style={styles.content}>
        {players.map((player) => (
          <Surface key={player.id} style={styles.playerCard} elevation={1}>
            <View style={styles.playerInfo}>
              <Avatar.Text
                size={50}
                label={player.name.substring(0, 2).toUpperCase()}
                style={styles.avatar}
              />
              <View style={styles.playerDetails}>
                <Text variant="titleMedium" style={styles.playerName}>
                  {player.name}
                </Text>
                <Text variant="bodyMedium" style={styles.nickname}>
                  {player.nickname}
                </Text>
                {player.phone && (
                  <Text variant="bodySmall" style={styles.phone}>
                    {player.phone}
                  </Text>
                )}
              </View>
            </View>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => deletePlayer(player.id)}
              style={styles.deleteButton}
            />
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
            Novo Jogador
          </Text>
          <TextInput
            label="Nome"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Apelido"
            value={nickname}
            onChangeText={setNickname}
            style={styles.input}
          />
          <TextInput
            label="Telefone (opcional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={createPlayer}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Cadastrar
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
        label="Novo Jogador"
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
  playerCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginRight: 16,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontWeight: 'bold',
  },
  nickname: {
    color: '#666',
  },
  phone: {
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    margin: -8,
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
