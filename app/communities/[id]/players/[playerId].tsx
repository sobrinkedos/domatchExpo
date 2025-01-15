import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { Text, Avatar, Button, Card, IconButton, Menu, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../../src/lib/supabase';
import { Database } from '../../../../types/database';

type Player = Database['public']['Tables']['players']['Row'];

export default function PlayerDetailsScreen() {
  const { id: communityId, playerId } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchPlayer = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) throw error;
      setPlayer(data);
    } catch (error: any) {
      console.error('Erro ao buscar jogador:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes do jogador');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCommunity = async () => {
    Alert.alert(
      'Confirmar Remoção',
      'Tem certeza que deseja remover este jogador da comunidade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await supabase
                .from('community_members')
                .delete()
                .eq('community_id', communityId)
                .eq('player_id', playerId);

              if (error) throw error;

              Alert.alert(
                'Sucesso',
                'Jogador removido da comunidade com sucesso!',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Erro', error.message || 'Erro ao remover jogador');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleWhatsApp = async () => {
    if (!player?.phone) return;
    
    const phoneNumber = player.phone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${phoneNumber}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erro', 'WhatsApp não está instalado');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [playerId]);

  if (loading || !player) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar.Text
            label={getInitials(player.name)}
            size={80}
          />
          <View style={styles.nameContainer}>
            <Text variant="headlineSmall">{player.name}</Text>
            {player.nickname && (
              <Text variant="bodyLarge" style={styles.nickname}>
                "{player.nickname}"
              </Text>
            )}
          </View>
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
                router.push(`/communities/${communityId}/players/${playerId}/edit`);
              }}
              title="Editar"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleRemoveFromCommunity();
              }}
              title="Remover da Comunidade"
              titleStyle={{ color: 'red' }}
            />
          </Menu>
        </View>

        <Button
          mode="contained"
          icon="whatsapp"
          onPress={handleWhatsApp}
          style={styles.whatsappButton}
        >
          Enviar Mensagem
        </Button>
      </View>

      <Card style={styles.statsCard}>
        <Card.Title title="Estatísticas" />
        <Card.Content>
          <Text variant="bodyLarge">Em breve...</Text>
        </Card.Content>
      </Card>

      <Card style={styles.historyCard}>
        <Card.Title title="Histórico de Jogos" />
        <Card.Content>
          <Text variant="bodyLarge">Em breve...</Text>
        </Card.Content>
      </Card>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
  },
  nickname: {
    opacity: 0.7,
    marginTop: 4,
  },
  whatsappButton: {
    marginTop: 8,
  },
  statsCard: {
    margin: 16,
  },
  historyCard: {
    margin: 16,
    marginTop: 0,
  },
});
