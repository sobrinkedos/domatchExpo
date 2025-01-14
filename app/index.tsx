import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../src/lib/auth';

export default function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Link href="/(tabs)" replace />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>
          DoMatch
        </Text>
        <Text variant="titleLarge" style={styles.subtitle}>
          Organize suas competições de dominó
        </Text>
        <Button 
          mode="contained" 
          style={styles.ctaButton}
          contentStyle={Platform.select({
            web: { height: 40, paddingHorizontal: 16 },
            default: {}
          })}
        >
          Começar Agora
        </Button>
      </View>

      <View style={styles.features}>
        {[
          {
            icon: 'trophy',
            title: 'Competições',
            text: 'Crie e gerencie torneios'
          },
          {
            icon: 'account-group',
            title: 'Comunidades',
            text: 'Conecte-se com outros jogadores'
          },
          {
            icon: 'chart-bar',
            title: 'Estatísticas',
            text: 'Acompanhe seu desempenho'
          },
          {
            icon: 'whatsapp',
            title: 'WhatsApp',
            text: 'Integração com grupos'
          }
        ].map((feature, index) => (
          <Surface 
            key={index} 
            style={styles.featureCard}
            elevation={2}
          >
            <MaterialCommunityIcons 
              name={feature.icon} 
              size={40} 
              color="#2196F3" 
            />
            <Text variant="titleMedium" style={styles.featureTitle}>
              {feature.title}
            </Text>
            <Text variant="bodyMedium" style={styles.featureText}>
              {feature.text}
            </Text>
          </Surface>
        ))}
      </View>

      <View style={styles.cta}>
        <Link href="/auth/register" asChild>
          <Button 
            mode="contained" 
            style={styles.button}
            contentStyle={Platform.select({
              web: { height: 40 },
              default: {}
            })}
          >
            Criar Conta
          </Button>
        </Link>
        <Link href="/auth/login" asChild>
          <Button 
            mode="outlined" 
            style={styles.button}
            contentStyle={Platform.select({
              web: { height: 40 },
              default: {}
            })}
          >
            Entrar
          </Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 8,
    color: '#2196F3',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  ctaButton: {
    ...Platform.select({
      web: {
        minWidth: 200,
      },
      default: {
        paddingHorizontal: 32,
      }
    })
  },
  features: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: Platform.select({
      web: 'calc(50% - 10px)',
      default: '48%'
    }),
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  featureTitle: {
    marginTop: 8,
    marginBottom: 4,
    color: '#333',
  },
  featureText: {
    textAlign: 'center',
    color: '#666',
  },
  cta: {
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginBottom: 12,
    ...Platform.select({
      web: {
        width: '100%',
      }
    })
  },
});
