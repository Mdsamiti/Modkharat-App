/**
 * API configuration.
 * In development, the backend runs on localhost:3000.
 * For Android emulator, use 10.0.2.2 instead of localhost.
 */
import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000`
  : 'https://your-production-api.com'; // Replace with production URL

export const SUPABASE_URL = 'https://zihwdatecsxxbeewurko.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with actual anon key
