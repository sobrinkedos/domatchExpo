import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../../../src/lib/supabase';
import { Database } from '../../../../../types/database';

type Player = Database['public']['Tables']['players']['Row'];

export default function EditPlayerScreen() {
  const { id: communityId, playerId } = useLocalSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPlayer = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) throw error;
      
      setPlayer(data);
      setName(data.name);
      setNickname(data.nickname || '');
      setPhone(data.phone || '');
    } catch (error: any) {
      console.error('Erro ao buscar jogador:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os dados do jogador');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove tudo que não for número
    const numbers = phone.replace(/\D/g, '');
    
    // Adiciona +55 se não começar com +
    if (!numbers.startsWith('+')) {
      return `+55${numbers}`;
    }
    return numbers;
  };

  const handleSave = async () => {
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
      setSaving(true);

      const { error } = await supabase
        .from('players')
        .update({
          name: name.trim(),
          nickname: nickname.trim() || null,
          phone: formattedPhone,
        })
        .eq('id', playerId);

      if (error) throw error;

      Alert.alert(
        'Sucesso',
        'Jogador atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar jogador');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Editar Jogador</Text>
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
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.button}
          >
            Salvar
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
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
