import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
          default: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: 'Jogadores',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: 'Comunidades',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="competitions"
        options={{
          title: 'Competições',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
