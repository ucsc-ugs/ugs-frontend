const API_BASE_URL = 'http://localhost:8000/api';

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
};

export interface OrgAdmin {
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
  };
}

export interface CreateOrgAdminData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateOrgAdminData {
  name: string;
  email: string;
}

export const orgAdminApi = {
  // Get all admins in the current admin's organization
  getOrgAdmins: async (): Promise<OrgAdmin[]> => {
    const response = await apiRequest('/admin/my-org-admins');
    return response.data;
  },

  // Create a new admin in the current admin's organization
  createOrgAdmin: async (data: CreateOrgAdminData): Promise<OrgAdmin> => {
    const response = await apiRequest('/admin/my-org-admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update an existing admin
  updateOrgAdmin: async (id: number, data: UpdateOrgAdminData): Promise<OrgAdmin> => {
    const response = await apiRequest(`/admin/my-org-admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete an admin
  deleteOrgAdmin: async (id: number): Promise<void> => {
    await apiRequest(`/admin/my-org-admins/${id}`, {
      method: 'DELETE',
    });
  },
};
