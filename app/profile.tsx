import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { Tables } from '../types/database';
import { useAuth } from '../src/lib/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setName(data.name);
      setNickname(data.nickname || '');
      setPhone(data.phone);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao carregar perfil');
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

  const handleUpdateProfile = async () => {
    if (!name || !phone) {
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

      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          nickname: nickname || null,
          phone: formattedPhone,
        })
        .eq('id', user?.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso');
      await loadProfile();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao sair');
    }
  };

  if (!profile) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={name.split(' ').map(n => n[0]).join('').toUpperCase()} 
        />
        <Text variant="headlineSmall" style={styles.title}>
          Meu Perfil
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
          label="Apelido (opcional)"
          value={nickname}
          onChangeText={setNickname}
          style={styles.input}
        />

        <TextInput
          label="Telefone *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+55 (99) 99999-9999"
          style={styles.input}
        />

        <TextInput
          label="Email"
          value={user?.email || ''}
          editable={false}
          style={styles.input}
        />

        <Text variant="bodyMedium" style={styles.rolesText}>
          Papéis: {profile.roles.join(', ')}
        </Text>

        <Button
          mode="contained"
          onPress={handleUpdateProfile}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Atualizar Perfil
        </Button>

        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={[styles.button, styles.signOutButton]}
        >
          Sair
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
  contentContainer: {
    padding: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
    gap: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  rolesText: {
    color: '#666',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  signOutButton: {
    marginTop: 16,
  },
});
