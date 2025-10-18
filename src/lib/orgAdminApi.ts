const API_BASE_URL = 'http://localhost:8000/api/admin';

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
  type: string;
  role: string;
  id: number;
  organization_id: number;
  user_type: string;
  data: {
    name: string;
    email: string;
    created_at: string;
    student: any | null;
  };
  meta: {
    permissions: string[];
  };
}

export interface CreateOrgAdminData {
  name: string;
  email: string;
  password: string;
  permissions?: string[];
}

export interface UpdateOrgAdminData {
  name: string;
  email: string;
  permissions?: string[];
}

export interface Location {
  id: number;
  organization_id: number;
  location_name: string;
  capacity: number;
  current_registrations?: number;
  organization?: {
    id: number;
    name: string;
  };
}

export const orgAdminApi = {
  // Get all admins in the current admin's organization
  getOrgAdmins: async (): Promise<OrgAdmin[]> => {
    const response = await apiRequest('/my-org-admins');
    return response.data;
  },

  // Create a new admin in the current admin's organization
  createOrgAdmin: async (data: CreateOrgAdminData): Promise<OrgAdmin> => {
    const response = await apiRequest('/my-org-admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update an existing admin
  updateOrgAdmin: async (id: number, data: UpdateOrgAdminData): Promise<OrgAdmin> => {
    const response = await apiRequest(`/my-org-admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete an admin
  deleteOrgAdmin: async (id: number): Promise<void> => {
    await apiRequest(`/my-org-admins/${id}`, {
      method: 'DELETE',
    });
  },

  // Get current organization details
  getMyOrganization: async (): Promise<any> => {
    console.log('Making request to /my-organization...');
    try {
      const response = await apiRequest('/my-organization');
      console.log('getMyOrganization response:', response);
      return response.data;
    } catch (error) {
      console.error('getMyOrganization error:', error);
      throw error;
    }
  },

  // Upload organization logo
  uploadOrganizationLogo: async (logoFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/my-organization/logo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload logo');
    }

    return response.json();
  },

  // Update organization details (name, description, etc.)
  updateMyOrganization: async (data: any): Promise<any> => {
    const response = await apiRequest('/my-organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Get locations for the current organization
  getLocations: async (): Promise<Location[]> => {
    const response = await apiRequest('/locations');
    return response.data;
  },
};
