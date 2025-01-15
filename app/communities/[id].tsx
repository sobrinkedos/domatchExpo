import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator, IconButton, Menu } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Database } from '../../types/database';

type Community = Database['public']['Tables']['communities']['Row'];

export default function CommunityDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCommunity(data);
    } catch (error: any) {
      console.error('Erro ao buscar comunidade:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da comunidade');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta comunidade? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from('communities')
                .delete()
                .eq('id', id);

              if (error) throw error;

              Alert.alert('Sucesso', 'Comunidade excluída com sucesso!');
              router.replace('/communities');
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao excluir comunidade');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchCommunity();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!community) {
    return (
      <View style={styles.errorContainer}>
        <Text>Comunidade não encontrada</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text variant="headlineMedium">{community.name}</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                router.push(`/communities/${id}/edit`);
              }}
              title="Editar"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleDelete();
              }}
              title="Excluir"
              titleStyle={{ color: 'red' }}
            />
          </Menu>
        </View>

        {community.description && (
          <Text variant="bodyLarge" style={styles.description}>
            {community.description}
          </Text>
        )}

        {community.location && (
          <Text variant="bodyMedium" style={styles.location}>
            📍 {community.location}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Jogadores
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push(`/communities/${id}/players/add`)}
          style={styles.addButton}
        >
          Adicionar Jogador
        </Button>
        {/* Lista de jogadores será implementada posteriormente */}
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Competições
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push(`/communities/${id}/competitions/new`)}
          style={styles.addButton}
        >
          Nova Competição
        </Button>
        {/* Lista de competições será implementada posteriormente */}
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
  location: {
    marginTop: 4,
    opacity: 0.6,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  addButton: {
    marginBottom: 16,
  },
});
