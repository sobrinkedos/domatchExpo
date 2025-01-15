import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { whatsappService } from '../../src/services/whatsapp';

export default function NewCommunityScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da comunidade é obrigatório');
      return;
    }

    try {
      setLoading(true);

      // 1. Criar a comunidade no banco de dados
      const { data: community, error: createError } = await supabase
        .from('communities')
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            location: location.trim() || null,
            created_by: null, // Removendo a referência ao created_by
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

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
      } catch (whatsappError: any) {
        console.error('Erro ao criar grupo no WhatsApp:', whatsappError);
        // Não vamos impedir a criação da comunidade se o grupo falhar
      }

      Alert.alert(
        'Sucesso',
        'Comunidade criada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.replace(`/communities/${community.id}`),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar comunidade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Nova Comunidade</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Crie uma nova comunidade para começar a organizar seus jogos
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Nome da Comunidade *"
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
  button: {
    marginTop: 8,
  },
});
