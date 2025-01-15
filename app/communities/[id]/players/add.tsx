import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../src/lib/supabase';
import { whatsappService } from '../../../../src/services/whatsapp';
import { Database } from '../../../../types/database';

type Community = Database['public']['Tables']['communities']['Row'];

export default function AddPlayerScreen() {
  const { id: communityId } = useLocalSearchParams();
  const [community, setCommunity] = useState<Community | null>(null);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();

      if (error) throw error;
      setCommunity(data);
    } catch (error) {
      console.error('Erro ao buscar comunidade:', error);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [communityId]);

  const formatPhoneNumber = (phone: string) => {
    // Remove tudo que não for número
    const numbers = phone.replace(/\D/g, '');
    
    // Adiciona +55 se não começar com +
    if (!numbers.startsWith('+')) {
      return `+55${numbers}`;
    }
    return numbers;
  };

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Erro', 'Nome e telefone são obrigatórios');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone.match(/^\+[1-9]\d{1,14}$/)) {
      Alert.alert('Erro', 'Número de telefone inválido');
      return;
    }

    try {
      setLoading(true);

      // 1. Verificar se o jogador já existe
      const { data: existingPlayer, error: searchError } = await supabase
        .from('players')
        .select('id')
        .eq('phone', formattedPhone)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      let playerId;

      if (existingPlayer) {
        playerId = existingPlayer.id;
      } else {
        // 2. Criar novo jogador se não existir
        const { data: newPlayer, error: createError } = await supabase
          .from('players')
          .insert([
            {
              name: name.trim(),
              nickname: nickname.trim() || null,
              phone: formattedPhone,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        playerId = newPlayer.id;
      }

      // 3. Adicionar jogador à comunidade
      const { error: memberError } = await supabase
        .from('community_members')
        .insert([
          {
            community_id: communityId,
            player_id: playerId,
            role: 'member',
          },
        ]);

      if (memberError) throw memberError;

      try {
        // 4. Enviar convite do WhatsApp
        if (community) {
          // 4.1 Adicionar ao grupo se existir
          if (community.whatsapp_group_id) {
            await whatsappService.addParticipantToGroup(
              community.whatsapp_group_id,
              formattedPhone
            );
          }

          // 4.2 Enviar mensagem de boas-vindas
          await whatsappService.sendGroupInvite(
            formattedPhone,
            community.name
          );
        }
      } catch (whatsappError: any) {
        console.error('Erro ao enviar convite do WhatsApp:', whatsappError);
        // Não vamos impedir a adição do jogador se o convite falhar
      }

      Alert.alert(
        'Sucesso',
        'Jogador adicionado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      if (error.code === '23505') {
        Alert.alert('Erro', 'Este jogador já faz parte da comunidade');
      } else {
        Alert.alert('Erro', error.message || 'Erro ao adicionar jogador');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Adicionar Jogador</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Preencha os dados do jogador
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Nome *"
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
          label="Telefone *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          placeholder="+55 (99) 99999-9999"
        />

        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.button}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            Adicionar
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
