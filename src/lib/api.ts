const API_BASE_URL = 'http://localhost:8000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  local: boolean;
  passport_nic: string;
}

interface ApiResponse<T = any> {
  message: string;
  user?: T;
  token?: string;
  errors?: Record<string, string[]>;
}

// Get stored token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'An error occurred',
      errors: data.errors || {},
    };
  }

  return data;
};

// Auth API calls
export const login = async (credentials: LoginCredentials): Promise<ApiResponse> => {
  const response = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
};

export const register = async (userData: RegisterData): Promise<ApiResponse> => {
  const response = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
};

export const logout = async (): Promise<void> => {
  try {
    await apiRequest('/logout', {
      method: 'POST',
    });
  } finally {
    removeAuthToken();
  }
};

export const getCurrentUser = async (): Promise<any> => {
  return await apiRequest('/user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};
