import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/lib/auth';
import { supabase } from '../../src/lib/supabase'; // Atualizado o caminho de importação do supabase
import { TablesInsert } from '../../types/database';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (phone: string) => {
    // Remove tudo que não for número
    const numbers = phone.replace(/\D/g, '');
    
    // Adiciona +55 se não começar com +
    if (!numbers.startsWith('+')) {
      return `+55${numbers}`;
    }
    return numbers;
  };

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    if (!formattedPhone.match(/^\+[1-9]\d{1,14}$/)) {
      Alert.alert('Erro', 'Número de telefone inválido');
      return;
    }

    try {
      setLoading(true);

      // 1. Criar conta de usuário
      const { user, error: signUpError } = await signUp(email, password);

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Erro ao criar usuário');

      // 2. Criar perfil do usuário
      const profileData: TablesInsert<'profiles'> = {
        id: user.id,
        name,
        nickname: nickname || null,
        phone: formattedPhone,
        roles: ['admin', 'organizer'], // Todo novo usuário é admin e organizer
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) throw profileError;

      Alert.alert(
        'Sucesso',
        'Conta criada com sucesso! Por favor, verifique seu email.',
        [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Criar Conta
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Registre-se para começar
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
          label="Email *"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label="Senha *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          label="Confirmar Senha *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Registrar
        </Button>

        <View style={styles.footer}>
          <Text variant="bodyMedium">Já tem uma conta? </Text>
          <Link href="/auth/login" asChild>
            <Text style={styles.link} variant="bodyMedium">
              Entre aqui
            </Text>
          </Link>
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
  contentContainer: {
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    color: '#2196F3',
  },
});
