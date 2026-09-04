import AsyncStorage from '@react-native-community/async-storage';
import axios, { AxiosInstance } from 'axios';

// VanLink API Client for React Native
// Connects to the Railway NestJS backend

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://vanlinkllc-backend-production.up.railway.app';

let authToken: string | null = null;

// Initialize token from AsyncStorage
let tokenInitialized = false;

export async function initializeToken(): Promise<void> {
  if (tokenInitialized) return;
  try {
    authToken = await AsyncStorage.getItem('vanlink_token');
    tokenInitialized = true;
  } catch (error) {
    console.error('Failed to initialize token:', error);
    tokenInitialized = true;
  }
}

export function setToken(token: string): void {
  authToken = token;
  AsyncStorage.setItem('vanlink_token', token).catch(error =>
    console.error('Failed to save token:', error)
  );
}

export function getToken(): string | null {
  return authToken;
}

export function clearToken(): void {
  authToken = null;
  AsyncStorage.removeItem('vanlink_token').catch(error =>
    console.error('Failed to clear token:', error)
  );
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  async config => {
    // Ensure token is initialized
    if (!tokenInitialized) {
      await initializeToken();
    }
    
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

// Core API wrapper
export async function api<T>(
  path: string,
  options: { method?: string; data?: any } = {}
): Promise<T> {
  try {
    const config = {
      method: options.method || 'GET',
      url: path,
      ...(options.data && { data: options.data }),
    };

    const response = await apiClient(config);
    return response.data;
  } catch (error: any) {
    let errorMessage = 'API Error';

    if (error.response?.data?.message) {
      errorMessage = Array.isArray(error.response.data.message)
        ? error.response.data.message.join(', ')
        : error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.response?.status) {
      errorMessage = `API Error: ${error.response.status}`;
    }

    throw new Error(errorMessage);
  }
}

export { apiClient, API_URL };
