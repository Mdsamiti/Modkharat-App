/**
 * API configuration.
 * In development, the backend runs on localhost:3000.
 * For Android emulator, use 10.0.2.2 instead of localhost.
 */
import { Platform } from 'react-native';

const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000`
  : 'https://modkharat-app-production.up.railway.app';

export const SUPABASE_URL = 'https://zihwdatecsxxbeewurko.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppaHdkYXRlY3N4eGJlZXd1cmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1Mjk2MTcsImV4cCI6MjA4ODEwNTYxN30.yIK2mY9rWPjDvoZvZMzcpgchPSwQSTyEWjgIpRkIag4'; // Replace with actual anon key
