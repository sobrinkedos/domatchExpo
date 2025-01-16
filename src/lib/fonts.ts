import * as Font from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const fonts = {
  ...MaterialCommunityIcons.font,
};

export const loadFonts = async () => {
  try {
    // Adiciona um timeout de 3 segundos
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout ao carregar fontes')), 3000)
    );

    await Promise.race([
      Font.loadAsync(fonts),
      timeoutPromise,
    ]);

    return true;
  } catch (error) {
    console.error('Erro ao carregar fontes:', error);
    return false;
  }
};
