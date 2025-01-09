import AsyncStorage from '@react-native-async-storage/async-storage';

type StoredValue<T = unknown> = {
  version: number;
  data: T;
  timestamp: number;
};

const STORAGE_VERSION = 1;

export const storeData = async <T>(key: string, value: T) => {
  try {
    const storedValue: StoredValue<T> = {
      version: STORAGE_VERSION,
      data: value,
      timestamp: Date.now()
    };
    const jsonValue = JSON.stringify(storedValue);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error storing data:', e);
  }
};

export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue == null) return null;

    const storedValue = JSON.parse(jsonValue) as StoredValue<T>;
    
    // Verificar versão e migrar dados se necessário
    if (storedValue.version !== STORAGE_VERSION) {
      // Implementar migração de dados se a versão mudar
      console.warn(`Data version mismatch for key ${key}`);
      return null;
    }

    return storedValue.data;
  } catch (e) {
    console.error('Error getting data:', e);
    return null;
  }
};

export const getMultipleData = async <T>(keys: string[]) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values.map(([key, jsonValue]) => {
      if (jsonValue == null) return null;
      try {
        const storedValue = JSON.parse(jsonValue) as StoredValue<T>;
        return storedValue.data;
      } catch (e) {
        console.error(`Error parsing data for key ${key}:`, e);
        return null;
      }
    });
  } catch (e) {
    console.error('Error getting multiple data:', e);
    return [];
  }
};

export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing data:', e);
  }
};

export const removeMultipleData = async (keys: string[]) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (e) {
    console.error('Error removing multiple data:', e);
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('Error clearing storage:', e);
  }
};

export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (e) {
    console.error('Error getting all keys:', e);
    return [];
  }
};
