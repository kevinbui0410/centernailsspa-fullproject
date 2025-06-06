import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Booking Services
export const bookingService = {
  getServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },

  createAppointment: async (appointmentData: any) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  cancelAppointment: async (appointmentId: string) => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },
};

// Points Services
export const pointsService = {
  getPoints: async () => {
    const response = await api.get('/customer/points');
    return response.data;
  },

  getRewards: async () => {
    const response = await api.get('/customer/rewards');
    return response.data;
  },

  redeemReward: async (rewardId: string) => {
    const response = await api.post(`/customer/rewards/${rewardId}/redeem`);
    return response.data;
  },

  getPointsHistory: async () => {
    const response = await api.get('/customer/points/history');
    return response.data;
  },
};

// Payment Services
export const paymentService = {
  createPaymentIntent: async (amount: number) => {
    const response = await api.post('/payments/create-intent', { amount });
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string) => {
    const response = await api.post('/payments/confirm', { paymentIntentId });
    return response.data;
  },
};

export default api; 