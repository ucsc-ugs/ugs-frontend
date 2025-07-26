const API_BASE_URL = 'http://localhost:8000/api/admin';

interface ExamDate {
  id?: number;
  exam_id?: number;
  date: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

interface ExamData {
  id?: number;
  name: string;
  description?: string;
  price: number;
  organization_id: number;
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
  return await apiRequest(`/exam/delete/${id}`, {
    method: 'DELETE',
  });
};

export type { ExamData, ExamDate, ApiResponse };
