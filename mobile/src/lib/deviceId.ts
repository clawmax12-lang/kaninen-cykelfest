import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const KEY = 'kaninen_voter_id';

let cached: string | null = null;

export async function getDeviceVoterId(): Promise<string> {
  if (cached) return cached;
  const stored = await AsyncStorage.getItem(KEY);
  if (stored) {
    cached = stored;
    return stored;
  }
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(KEY, id);
  cached = id;
  return id;
}
