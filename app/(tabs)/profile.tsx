import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, Button, Avatar, TextInput, Portal, Modal } from 'react-native-paper';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setName(profile?.name || '');
    setBio(profile?.bio || '');
  };

  const updateProfile = async () => {
    if (!name) {
      Alert.alert('Erro', 'Por favor, preencha seu nome');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile?.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      hideModal();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const statistics = {
    totalMatches: 48,
    victories: 36,
    defeats: 12,
    winRate: '75%',
    tournaments: 5,
    trophies: 2,
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Avatar.Text
          size={80}
          label={profile?.name?.substring(0, 2)?.toUpperCase() || 'US'}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text variant="headlineSmall" style={styles.name}>
            {profile?.name || 'Usuário'}
          </Text>
          <Text variant="bodyMedium" style={styles.bio}>
            {profile?.bio || 'Nenhuma biografia'}
          </Text>
          <Button
            mode="outlined"
            onPress={showModal}
            style={styles.editButton}
            icon="pencil"
          >
            Editar Perfil
          </Button>
        </View>
      </Surface>

      <Surface style={styles.statsContainer} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Estatísticas
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="cards-playing" size={24} color="#2196F3" />
            <Text variant="titleLarge" style={styles.statNumber}>
              {statistics.totalMatches}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Partidas
            </Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="trophy" size={24} color="#4CAF50" />
            <Text variant="titleLarge" style={styles.statNumber}>
              {statistics.victories}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Vitórias
            </Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="close-circle" size={24} color="#F44336" />
            <Text variant="titleLarge" style={styles.statNumber}>
              {statistics.defeats}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Derrotas
            </Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="chart-line" size={24} color="#FF9800" />
            <Text variant="titleLarge" style={styles.statNumber}>
              {statistics.winRate}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Taxa de Vitória
            </Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="tournament" size={24} color="#9C27B0" />
            <Text variant="titleLarge" style={styles.statNumber}>
              {statistics.tournaments}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Torneios
            </Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="medal" size={24} color="#FFC107" />
            <Text variant="titleLarge" style={styles.statNumber}>
              {statistics.trophies}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Troféus
            </Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.actionsContainer} elevation={1}>
        <Button
          mode="contained"
          onPress={handleSignOut}
          icon="logout"
          style={styles.signOutButton}
        >
          Sair
        </Button>
      </Surface>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Editar Perfil
          </Text>
          <TextInput
            label="Nome"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Biografia"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={updateProfile}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Salvar
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
    padding: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#2196F3',
  },
  headerInfo: {
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bio: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  editButton: {
    minWidth: 150,
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  statNumber: {
    marginVertical: 4,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  signOutButton: {
    backgroundColor: '#F44336',
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
