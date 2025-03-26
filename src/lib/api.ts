import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive';
  created_at?: string;
  last_login?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  roleFilter?: string;
  statusFilter?: string;
  sortBy?: 'name' | 'username' | 'email' | 'created_at' | 'last_login';
  sortOrder?: 'asc' | 'desc';
}

export const apiClient = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  getUsers: async (params: GetUsersParams = {}): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  createUser: async (userData: Omit<User, 'id'> & { password: string }): Promise<User> => {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  updateUserStatus: async (userId: string, status: 'active' | 'inactive'): Promise<User> => {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  },

  checkDuplicateFields: async (fields: { username: string; email: string }): Promise<{ duplicateUsername: boolean; duplicateEmail: boolean }> => {
    const response = await api.post<{ duplicateUsername: boolean; duplicateEmail: boolean }>('/users/check-duplicate', fields);
    return response.data;
  },
};

export default apiClient; 