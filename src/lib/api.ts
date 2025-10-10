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
  message?: string;
  user?: T;
  token?: string;
  errors?: Record<string, string[]>;
  // New response structure
  type?: string;
  role?: string;
  id?: number;
  data?: {
    name: string;
    email: string;
    created_at: string;
    student?: {
      local: boolean;
      passport_nic: string;
    } | null;
  };
  meta?: {
    permissions: string[];
  };
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
  const token = getAuthToken();
  console.log('Logout API: Token before request:', token ? 'EXISTS' : 'MISSING');
  console.log('Logout API: Token value:', token);
  
  try {
    await apiRequest('/logout', {
      method: 'POST',
    });
    console.log('Logout API: Request completed successfully');
  } catch (error) {
    console.log('Logout API: Request failed with error:', error);
    throw error; // Re-throw the error so the calling code can handle it
  }
  // Don't remove token here - let the calling component handle it
  // This allows the token to be available for the API request
};

export const getCurrentUser = async (): Promise<any> => {
  return await apiRequest('/user');
};

export const updateProfile = async (profileData: { name: string; email: string }): Promise<any> => {
  return await apiRequest('/profile', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
};

export const updatePassword = async (passwordData: { 
  current_password: string; 
  password: string; 
  password_confirmation: string; 
}): Promise<any> => {
  return await apiRequest('/profile/password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  });
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

// Payment verification
export const verifyPayment = async (orderId: string): Promise<{
  exam_name: string;
  registration_status: string;
  index_number: string;
  payment: {
    payment_id: string;
    amount: string;
    currency: string;
    status_message: string;
    created_at: string;
  };
}> => {
  return await apiRequest('/payment/verify', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
};
