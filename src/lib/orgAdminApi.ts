const API_BASE_URL = 'http://localhost:8000/api/admin';

// Import axios if not already available
import axios from 'axios';

// Helper function for API requests using axios instead of fetch
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  
  console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);
  console.log('Token:', token ? 'Present' : 'Missing');
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Add any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const axiosConfig = {
      method: (options.method || 'GET') as any,
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      ...(options.body && { data: JSON.parse(options.body as string) })
    };

    console.log('Request config:', axiosConfig);

    const response = await axios(axiosConfig);
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      if (error.response.status === 422 && error.response.data?.errors) {
        // Validation errors - format them nicely
        const validationErrors = error.response.data.errors;
        console.error('Detailed validation errors:', validationErrors);
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        throw new Error(`Validation errors:\n${errorMessages}`);
      }
      
      const errorMessage = error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: No response received from server');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
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

  // Change password
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<any> => {
    const response = await apiRequest('/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};
