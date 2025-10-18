const API_BASE_URL = 'http://localhost:8000/api/admin';

// Lazy import of examApi to avoid circular dependency issues in some builds
import { getExams } from './examApi';

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

  // Try to parse response as JSON, but fall back to text if the server returned HTML or plain text
  const tryParse = async () => {
    try {
      const json = await response.json();
      return json;
    } catch (e) {
      try {
        const txt = await response.text();
        return txt;
      } catch (e2) {
        return null;
      }
    }
  };

  const parsed = await tryParse();

  if (!response.ok) {
    // parsed may be an object or a string (HTML/text)
    const message = (parsed && typeof parsed === 'object' && parsed.message) ? parsed.message : (typeof parsed === 'string' ? parsed : response.statusText || 'API request failed');
    const err: any = new Error(String(message));
    err.status = response.status;
    err.data = parsed;
    throw err;
  }

  return parsed;
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
  // Get dashboard metrics for the current org admin (summary stats, trends, etc.)
  getDashboard: async (): Promise<any> => {
    // Try the admin dashboard; some backends reserve this for super-admins and return 403.
    // In that case try org-scoped fallbacks so organization admins can still get their data.
    const tryEndpoints = ['/dashboard', '/my-dashboard', '/organization/dashboard'];

    let lastError: any = null;
    for (const ep of tryEndpoints) {
      try {
        const response = await apiRequest(ep);
        return response;
      } catch (err: any) {
        lastError = err;
        // If the error clearly indicates a Super admin restriction, continue to next fallback
        const msg = String(err?.message || '').toLowerCase();
        if (msg.includes('super admin') || msg.includes('super-admin') || msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('403')) {
          // try next fallback
          continue;
        }
        // Unknown error - rethrow
        throw err;
      }
    }

    // If all above failed, attempt to fetch current organization and call an org-specific dashboard endpoint
    try {
      const org = await orgAdminApi.getMyOrganization();
      if (org && org.id) {
        try {
          const response = await apiRequest(`/organizations/${org.id}/dashboard`);
          return response;
        } catch (err: any) {
          lastError = err;
        }
      }
    } catch (err: any) {
      lastError = err;
    }

    // All attempts failed - throw the last error
    // Final fallback: try to build dashboard from available org-scoped endpoints like /exam
    try {
      const resp = await getExams();
      const exams = resp.data || resp;

      // Build aggregated dashboard
      const totalExams = Array.isArray(exams) ? exams.length : 0;
      // recent registrations: gather exam_dates and their current_registrations
      const recent_registrations: any[] = [];
      const monthly_map: Record<string, number> = {};
      const distribution_map: Record<string, number> = {};
      let totalRegistrations = 0;

      if (Array.isArray(exams)) {
        exams.forEach((exam: any) => {
          const examName = exam.name || exam.title || exam.testName || `Exam ${exam.id}`;
          (exam.exam_dates || exam.examDates || []).forEach((ed: any) => {
            // aggregate current registrations per date
            const current = Number((ed.current_registrations ?? ed.currentRegistrations ?? ed.pivot?.current_registrations) || 0);
            totalRegistrations += current;

            // monthly key from date
            const d = new Date(ed.date || ed.exam_date || ed.date_time || null);
            const monthLabel = isNaN(d.getTime()) ? (ed.month || '') : d.toLocaleString('en-US', { month: 'short' });
            if (monthLabel) monthly_map[monthLabel] = (monthly_map[monthLabel] || 0) + current;

            // distribution by exam name/type
            const type = exam.name || exam.type || exam.exam_type || examName;
            distribution_map[type] = (distribution_map[type] || 0) + current;

            recent_registrations.push({ id: ed.id || `${exam.id}-${ed.date}`, student: ed.student_name || '', exam: examName, date: ed.date, status: ed.status || 'registered' });
          });
        });
      }

      const monthly_registrations = Object.keys(monthly_map).map(k => ({ name: k, value: monthly_map[k] }));
      const exam_distribution = Object.keys(distribution_map).map(k => ({ name: k, value: distribution_map[k] }));

      return {
        data: {
          total_exams: totalExams,
          total_registrations: totalRegistrations,
          monthly_registrations,
          exam_distribution,
          recent_registrations,
          total_revenue: 0,
          upcoming_exams: exams.reduce((acc: number, e: any) => acc + ((e.upcoming_count ?? 0) || 0), 0),
        }
      };
    } catch (err) {
      // if even that fails, throw the last server error
      throw lastError || err || new Error('Failed to load dashboard');
    }
  },
};
