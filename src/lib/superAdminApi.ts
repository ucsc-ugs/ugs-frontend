const ADMIN_API_BASE_URL = 'http://localhost:8000/api/admin';

interface SuperAdminLoginCredentials {
  email: string;
  password: string;
}

interface Organization {
  id: number;
  name: string;
  description: string;
  org_admins_count?: number;
  created_at: string;
  updated_at: string;
}

interface OrgAdmin {
  id: number;
  name: string;
  user_id: number;
  organization_id: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  organization: {
    id: number;
    name: string;
    description: string;
  };
}

interface SuperAdminApiResponse<T = any> {
  message: string;
  data?: T;
  user?: any;
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

// API request helper for super admin
const adminApiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
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

  const response = await fetch(`${ADMIN_API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw { 
      message: data.message || 'An error occurred', 
      errors: data.errors || {},
      status: response.status 
    };
  }

  return data;
};

// Super Admin Authentication
export const superAdminLogin = async (credentials: SuperAdminLoginCredentials): Promise<SuperAdminApiResponse> => {
  const response = await adminApiRequest('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.token) {
    setAuthToken(response.token);
  }

  return response;
};

export const superAdminLogout = async (): Promise<void> => {
  await adminApiRequest('/logout', {
    method: 'POST',
  });
  // Don't remove token here - let the calling component handle it
  // This allows the token to be available for the API request
};

// Dashboard
export const getSuperAdminDashboard = async (): Promise<SuperAdminApiResponse> => {
  return await adminApiRequest('/dashboard');
};

// Organizations
export const getOrganizations = async (): Promise<SuperAdminApiResponse<Organization[]>> => {
  return await adminApiRequest('/organizations');
};

export const createOrganization = async (orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<SuperAdminApiResponse<Organization>> => {
  return await adminApiRequest('/organizations', {
    method: 'POST',
    body: JSON.stringify(orgData),
  });
};

export const updateOrganization = async (id: number, orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>): Promise<SuperAdminApiResponse<Organization>> => {
  return await adminApiRequest(`/organizations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(orgData),
  });
};

export const deleteOrganization = async (id: number): Promise<SuperAdminApiResponse> => {
  return await adminApiRequest(`/organizations/${id}`, {
    method: 'DELETE',
  });
};

// Org Admins
export const getOrgAdmins = async (): Promise<SuperAdminApiResponse<OrgAdmin[]>> => {
  return await adminApiRequest('/org-admins');
};

export const createOrgAdmin = async (adminData: {
  name: string;
  email: string;
  password: string;
  organization_id: number;
}): Promise<SuperAdminApiResponse<OrgAdmin>> => {
  return await adminApiRequest('/org-admins', {
    method: 'POST',
    body: JSON.stringify(adminData),
  });
};

export const updateOrgAdmin = async (id: number, adminData: {
  name: string;
  email: string;
  organization_id: number;
}): Promise<SuperAdminApiResponse<OrgAdmin>> => {
  return await adminApiRequest(`/org-admins/${id}`, {
    method: 'PUT',
    body: JSON.stringify(adminData),
  });
};

export const deleteOrgAdmin = async (id: number): Promise<SuperAdminApiResponse> => {
  return await adminApiRequest(`/org-admins/${id}`, {
    method: 'DELETE',
  });
};

// Check if user is authenticated
export const isSuperAdminAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};
