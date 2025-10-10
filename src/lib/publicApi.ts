const API_BASE_URL = 'http://localhost:8000/api';

interface ExamDate {
  id?: number;
  exam_id?: number;
  date: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

interface Organization {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface PublicExamData {
  id: number;
  name: string;
  description?: string;
  price: number;
  organization_id: number;
  registration_deadline?: string;
  organization?: Organization;
  exam_dates?: ExamDate[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T = any> {
  message: string;
  data: T;
}

// API request helper for public endpoints (no auth required)
const publicApiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw {
      message: data.message || 'An error occurred',
      status: response.status,
      data: data
    };
  }

  return data;
};

// Public API functions
export const getPublicExams = async (): Promise<ApiResponse<PublicExamData[]>> => {
  return await publicApiRequest('/exams');
};

export type { PublicExamData, ExamDate, Organization, ApiResponse };
