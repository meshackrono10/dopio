import { Platform } from 'react-native';

// In development, use the local IP address of your machine
// For Android Emulator, 10.0.2.2 is the alias for localhost
// For iOS Simulator, localhost works
const DEV_API_URL = 'http://192.168.0.12:5000/api';

const PROD_API_URL = 'https://your-production-api.com/api'; // REPLACE with your actual production API URL

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const CONFIG = {
    API_URL,
    AUTH_TOKEN_KEY: 'house_haunters_auth_token',
    USER_DATA_KEY: 'house_haunters_user_data',
};
