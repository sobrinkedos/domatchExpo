import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, FAB, Portal, Modal, TextInput, Button, Surface, Avatar, IconButton, Chip } from 'react-native-paper';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Community = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  whatsapp_group_id: string | null;
  created_at: string;
};

type Member = {
  id: string;
  community_id: string;
  player_id: string;
  role: 'admin' | 'member';
  player: {
    name: string;
    nickname: string;
  };
};

export default function CommunitiesScreen() {
  const { profile } = useAuth();
  const [visible, setVisible] = useState(false);
  const [membersVisible, setMembersVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setName('');
    setDescription('');
    setLocation('');
  };

  const showMembers = async (community: Community) => {
    setSelectedCommunity(community);
    await fetchMembers(community.id);
    setMembersVisible(true);
  };

  const hideMembers = () => {
    setMembersVisible(false);
    setSelectedCommunity(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da comunidade é obrigatório');
      return;
    }

    try {
      setLoading(true);

      const { data: community, error } = await supabase
        .from('communities')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setCommunities([community, ...communities]);
      setVisible(false);
      setName('');
      setDescription('');
      setLocation('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('communities')
        .select('*, community_members(player_id, role)')
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

  const fetchMembers = async (communityId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_members')
        .select('*, player:players(*)')
        .eq('community_id', communityId)
        .order('created_at');

      if (error) throw error;

      setMembers(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar membros:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!selectedCommunity) return;

    try {
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('created_by', profile?.id)
        .order('name');

      if (playersError) throw playersError;

      // Aqui você pode implementar um modal de seleção de jogadores
      // Por enquanto, vamos apenas mostrar um alerta
      Alert.alert(
        'Adicionar Membro',
        'Implementar seleção de jogadores da sua lista'
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  React.useEffect(() => {
    fetchCommunities();
  }, [profile?.id]);

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>
          Comunidades
        </Text>
      </Surface>

      <ScrollView style={styles.content}>
        {communities.map((community) => (
          <Surface key={community.id} style={styles.communityCard} elevation={1}>
            <View style={styles.communityHeader}>
              <Avatar.Text
                size={50}
                label={community.name.substring(0, 2).toUpperCase()}
                style={styles.avatar}
              />
              <View style={styles.communityInfo}>
                <Text variant="titleMedium" style={styles.communityName}>
                  {community.name}
                </Text>
                {community.description && (
                  <Text variant="bodyMedium" style={styles.description}>
                    {community.description}
                  </Text>
                )}
                {community.location && (
                  <View style={styles.locationContainer}>
                    <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                    <Text variant="bodySmall" style={styles.location}>
                      {community.location}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => showMembers(community)}
                icon="account-group"
                style={styles.actionButton}
              >
                Membros
              </Button>
            </View>
          </Surface>
        ))}
      </ScrollView>

      {/* Modal de Nova Comunidade */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Nova Comunidade
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
            label="Localização"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Criar Comunidade
          </Button>
        </Modal>

        {/* Modal de Membros */}
        <Modal
          visible={membersVisible}
          onDismiss={hideMembers}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Membros
            </Text>
            <IconButton icon="close" onPress={hideMembers} />
          </View>

          <ScrollView style={styles.membersList}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <Avatar.Text
                  size={40}
                  label={member.player.name.substring(0, 2).toUpperCase()}
                  style={styles.memberAvatar}
                />
                <View style={styles.memberInfo}>
                  <Text variant="bodyLarge">{member.player.name}</Text>
                  <Text variant="bodySmall" style={styles.memberNickname}>
                    {member.player.nickname}
                  </Text>
                </View>
                <Chip
                  mode="flat"
                  textStyle={{ color: member.role === 'admin' ? '#fff' : '#000' }}
                  style={[
                    styles.roleChip,
                    { backgroundColor: member.role === 'admin' ? '#2196F3' : '#E0E0E0' },
                  ]}
                >
                  {member.role === 'admin' ? 'Admin' : 'Membro'}
                </Chip>
              </View>
            ))}
          </ScrollView>

          <Button
            mode="contained"
            onPress={addMember}
            icon="account-plus"
            style={styles.addMemberButton}
          >
            Adicionar Membro
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={showModal}
        label="Nova Comunidade"
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
  communityCard: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  communityHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginRight: 16,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: '#666',
    marginLeft: 4,
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
  button: {
    marginTop: 8,
  },
  membersList: {
    maxHeight: 400,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberAvatar: {
    backgroundColor: '#2196F3',
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberNickname: {
    color: '#666',
  },
  roleChip: {
    borderRadius: 16,
  },
  addMemberButton: {
    marginTop: 16,
  },
});
