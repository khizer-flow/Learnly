import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Lesson, 
  Subscription, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest,
  ApiResponse,
  PaginatedResponse,
  LessonFilters
} from '../types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data!;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> => {
    const response = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', data);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/logout', { refreshToken });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },
};

// Lessons API
export const lessonsAPI = {
  getAll: async (filters: LessonFilters = {}): Promise<PaginatedResponse<Lesson>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<Lesson>>(`/lessons?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Lesson>> => {
    const response = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`);
    return response.data;
  },

  search: async (searchTerm: string, filters: Omit<LessonFilters, 'search'> = {}): Promise<PaginatedResponse<Lesson>> => {
    const params = new URLSearchParams({ search: searchTerm });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<Lesson>>(`/lessons/search?${params.toString()}`);
    return response.data;
  },

  getByCategory: async (category: string, filters: Omit<LessonFilters, 'category'> = {}): Promise<PaginatedResponse<Lesson>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await api.get<PaginatedResponse<Lesson>>(`/lessons/category/${category}?${params.toString()}`);
    return response.data;
  },
};

// Subscriptions API
export const subscriptionsAPI = {
  createCheckoutSession: async (data: { priceId: string; successUrl: string; cancelUrl: string }): Promise<ApiResponse<{ sessionId: string; url: string }>> => {
    const response = await api.post<ApiResponse<{ sessionId: string; url: string }>>('/subscriptions/checkout', data);
    return response.data;
  },

  createBillingPortalSession: async (data: { returnUrl: string }): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.post<ApiResponse<{ url: string }>>('/subscriptions/billing-portal', data);
    return response.data;
  },

  getStatus: async (): Promise<ApiResponse<{ hasSubscription: boolean; subscription: any }>> => {
    const response = await api.get<ApiResponse<{ hasSubscription: boolean; subscription: any }>>('/subscriptions/status');
    return response.data;
  },

  cancel: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/subscriptions/cancel');
    return response.data;
  },
};

export default api;
