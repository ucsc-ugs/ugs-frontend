const API_BASE_URL = 'http://localhost:8000/api/admin';

interface ExamDate {
  id?: number;
  exam_id?: number;
  date: string;
  location?: string;
  locations?: Array<{
    id: number;
    location_name: string;
    capacity: number;
    pivot: {
      priority: number;
      current_registrations: number;
    };
  }>;
  status?: 'upcoming' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

interface ExamData {
  id?: number;
  name: string;
  code_name?: string;
  description?: string;
  price: number;
  organization_id: number;
  registration_deadline?: string;
  exam_dates?: ExamDate[];
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T = any> {
  message: string;
  data: T;
}

// Get stored token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
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

  console.log('API Request:', `${API_BASE_URL}${endpoint}`, config);
  
  // For debugging: if this is an exam request and we have a token, check current user
  if (endpoint.includes('/exam') && token) {
    try {
      const userCheckResponse = await fetch(`${API_BASE_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (userCheckResponse.ok) {
        const currentUser = await userCheckResponse.json();
        console.log('👤 Current authenticated user:', currentUser);
      }
    } catch (error) {
      console.log('⚠️ User verification failed:', error);
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  const responseText = await response.text();
  console.log('Response text:', responseText.substring(0, 200) + '...');
  
  if (!response.ok) {
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: `Server returned ${response.status}: ${responseText.substring(0, 100)}` };
    }
    
    const errorMessage = data.message || `Request failed with status ${response.status}`;
    
    throw {
      status: response.status,
      message: errorMessage,
      errors: data.errors || {},
    };
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('JSON Parse Error:', e);
    console.error('Response was:', responseText);
    throw {
      status: 500,
      message: `Server returned invalid JSON. Response: ${responseText.substring(0, 100)}`,
      errors: {},
    };
  }
  
  return data;
};

// Exam API functions
export const getExams = async (): Promise<ApiResponse<ExamData[]>> => {
  return await apiRequest('/exam');
};

export const getExam = async (id: number): Promise<ApiResponse<ExamData>> => {
  return await apiRequest(`/exam/${id}`);
};

export const createExam = async (examData: Omit<ExamData, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ExamData>> => {
  return await apiRequest('/exam/create', {
    method: 'POST',
    body: JSON.stringify(examData),
  });
};

export const updateExam = async (id: number, examData: Partial<ExamData>): Promise<ApiResponse<ExamData>> => {
  return await apiRequest(`/exam/update/${id}`, {
    method: 'PUT',
    body: JSON.stringify(examData),
  });
};

export const deleteExam = async (id: number): Promise<ApiResponse> => {
  console.log('🗑️ deleteExam called with ID:', id, 'Type:', typeof id);
  return await apiRequest(`/exam/delete/${id}`, {
    method: 'DELETE',
  });
};

// Test function to verify API connectivity
export const testConnection = async (): Promise<any> => {
  return await apiRequest('/debug/user-context');
};

// Exam Date API functions
export const updateExamDateStatus = async (examDateId: number, status: 'upcoming' | 'completed' | 'cancelled'): Promise<ApiResponse<ExamDate>> => {
  return await apiRequest(`/exam-date/${examDateId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// Add single exam date to existing exam
export const addExamDate = async (examId: number, examDateData: {
  date: string;
  location?: string;
  location_id?: number;
  location_ids?: number[];
}): Promise<ApiResponse<ExamDate>> => {
  return await apiRequest(`/exam/${examId}/exam-dates`, {
    method: 'POST',
    body: JSON.stringify(examDateData),
  });
};

// Add multiple exam dates to existing exam (bulk)
export const addMultipleExamDates = async (examId: number, examDatesData: {
  exam_dates: Array<{
    date: string;
    location?: string;
    location_id?: number;
    location_ids?: number[];
  }>;
}): Promise<ApiResponse<ExamDate[]>> => {
  return await apiRequest(`/exam/${examId}/exam-dates/bulk`, {
    method: 'POST',
    body: JSON.stringify(examDatesData),
  });
};

// Automatically update expired exam dates
export const updateExpiredExamStatuses = async (): Promise<ApiResponse<{ updated_count: number }>> => {
  return await apiRequest('/exam-dates/update-expired-statuses', {
    method: 'POST',
  });
};

export type { ExamData, ExamDate, ApiResponse };
