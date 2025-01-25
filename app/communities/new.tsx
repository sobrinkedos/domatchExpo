import { supabase } from '@/lib/supabase';
import { whatsappService } from '@/services/whatsapp';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function NewCommunityScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { mutateAsync: createCommunity } = useMutation({
    mutationFn: async () => {
      try {
        console.log('=== Iniciando criação de comunidade ===');
        
        // 1. Obter sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Sessão:', JSON.stringify(session, null, 2));
        
        if (sessionError) {
          console.error('Erro de sessão:', sessionError);
          throw new Error('Erro ao obter sessão');
        }

        if (!session?.user?.id) {
          console.error('Usuário não autenticado');
          throw new Error('Usuário não autenticado');
        }

        // 2. Preparar dados
        const userId = session.user.id;
        console.log('ID do usuário:', userId);

        const communityData = {
          name: name.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          created_by: userId
        };

        console.log('Dados para inserção:', communityData);

        // 3. Inserir no banco
        const { data, error } = await supabase
          .from('communities')
          .insert(communityData)
          .select()
          .single();

        if (error) {
          console.error('Erro na inserção:', error);
          throw error;
        }

        console.log('Comunidade criada:', data);
        return data;

      } catch (error) {
        console.error('Erro completo:', error);
        throw error;
      }
    },
    onSuccess: async (community) => {
      try {
        const groupId = await whatsappService.createGroup(
          name.trim(),
          description.trim() || null,
          []
        );

        const { error: updateError } = await supabase
          .from('communities')
          .update({ whatsapp_group_id: groupId })
          .eq('id', community.id);

        if (updateError) {
          console.error('Erro ao atualizar ID do grupo:', updateError);
        }

        queryClient.invalidateQueries({ queryKey: ['communities'] });
        
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
      } catch (error) {
        console.error('Erro ao criar grupo no WhatsApp:', error);
        Alert.alert(
          'Aviso',
          'A comunidade foi criada, mas houve um erro ao criar o grupo no WhatsApp. Você pode tentar criar o grupo manualmente mais tarde.'
        );
        router.replace(`/communities/${community.id}`);
      }
    },
    onError: (error: any) => {
      console.error('Erro na mutação:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível criar a comunidade. Por favor, tente novamente.'
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
      console.error('Erro no submit:', error);
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
