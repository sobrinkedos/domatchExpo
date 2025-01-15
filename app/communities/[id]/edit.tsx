import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { Database } from '../../../types/database';

type Community = Database['public']['Tables']['communities']['Row'];

export default function EditCommunityScreen() {
  const { id } = useLocalSearchParams();
  const [community, setCommunity] = useState<Community | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setCommunity(data);
      setName(data.name);
      setDescription(data.description || '');
      setLocation(data.location || '');
    } catch (error: any) {
      console.error('Erro ao buscar comunidade:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da comunidade');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome da comunidade é obrigatório');
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('communities')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert(
        'Sucesso',
        'Comunidade atualizada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar comunidade');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [id]);

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
        <Text variant="headlineMedium">Editar Comunidade</Text>
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
