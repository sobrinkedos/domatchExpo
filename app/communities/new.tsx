import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { whatsappService } from '../../src/services/whatsapp';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function NewCommunityScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const session = supabase.auth.session();

  const { mutateAsync: createCommunity } = useMutation({
    mutationFn: async () => {
      const { error, data } = await supabase
        .from('communities')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          created_by: session?.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: async (community) => {
      try {
        // 2. Criar o grupo no WhatsApp
        const groupId = await whatsappService.createGroup(
          name.trim(),
          description.trim() || null,
          [] // Inicialmente sem participantes
        );

        // 3. Atualizar a comunidade com o ID do grupo
        const { error: updateError } = await supabase
          .from('communities')
          .update({ whatsapp_group_id: groupId })
          .eq('id', community.id);

        if (updateError) {
          console.error('Erro ao atualizar ID do grupo:', updateError);
        }

        // 4. Atualizar a cache do React Query
        queryClient.invalidateQueries(['communities']);

        // 5. Redirecionar para a página da comunidade
        router.replace(`/communities/${community.id}`);
      } catch (error) {
        console.error('Erro ao criar grupo no WhatsApp:', error);
        Alert.alert(
          'Erro',
          'Não foi possível criar o grupo no WhatsApp. A comunidade foi criada, mas você precisará criar o grupo manualmente.'
        );
      }
    },
    onError: (error) => {
      console.error('Erro ao criar comunidade:', error);
      Alert.alert(
        'Erro',
        'Não foi possível criar a comunidade. Por favor, tente novamente.'
      );
    },
  });

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da comunidade é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await createCommunity();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Nova Comunidade
        </Text>

        <TextInput
          label="Nome"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <TextInput
          label="Localização"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Criar Comunidade
        </Button>
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
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
