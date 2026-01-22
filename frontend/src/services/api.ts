import axios from 'axios';

// API Base URL - using environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api-rest-1.0-SNAPSHOT';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your internet connection.',
      });
    }

    // Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear any local state and redirect to login
      // Only redirect if not already on a login page
      const isLoginPage = window.location.pathname.includes('login') || 
                          window.location.pathname === '/register';
      if (!isLoginPage) {
        // Clear auth store
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }

    // Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Not found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data);
    }

    // Server error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  adminLogin: (username: string, password: string) =>
    api.post('/auth', { username, password }),
  
  candidateLogin: (email: string, accessCode: string) =>
    api.post<CandidateAuthResponse>('/auth/candidate', { email, accessCode }),
  
  logout: () => api.post('/auth/logout'),
  
  getTestQuestionsForCandidate: (testId: number) =>
    api.get<CandidateQuestionResponse[]>(`/auth/test/${testId}/questions`),
};

// Enterprise API
export const enterpriseApi = {
  create: (data: EnterpriseCreateRequest) =>
    api.post<LoginResponse>('/enterprises', data),
  
  get: () => api.get<Enterprise>('/enterprises'),
  
  createDomain: (data: Domain) =>
    api.post<Domain>('/enterprises/domain', data),
  
  createMultipleDomains: (domains: Domain[]) =>
    api.post<Domain[]>('/enterprises/domains', domains),
  
  getAllDomains: () =>
    api.get<Domain[]>('/enterprises/domains'),
};

// Test API
export const testApi = {
  create: (data: TestRequest) =>
    api.post<string>('/test', data),
  
  getAll: () => api.get<TestResponse[]>('/test'),
  
  getQuestions: (testId: number) =>
    api.get<TestQuestionResponse[]>(`/test/${testId}/questions`),
  
  getSessions: (testId: number) =>
    api.get<TestSessionResponse[]>(`/test/${testId}/sessions`),
  
  sendInvitations: (data: TestSessionRequest) =>
    api.post<string>('/test/invitation', data),
};

// Question API
export const questionApi = {
  create: (data: QuestionCreateRequest) =>
    api.post<string>('/test/questions', data),
  
  getAll: () => api.get<QuestionResponse[]>('/test/questions'),
};

// Candidate API
export const candidateApi = {
  submitTest: (data: SubmitTestRequest) =>
    api.post<SubmitTestResponse>('/candidate/submit-test', data),
  
  getResults: () =>
    api.get<SubmitTestResponse>('/candidate/results'),
};

// Scoring API
export const scoringApi = {
  scoreOpenQuestion: (data: OpenQuestionScoreRequest) =>
    api.post<OpenQuestionScoreResponse>('/scoring/open-question', data),
  
  healthCheck: () =>
    api.get<{ status: string; groqApiKey: string }>('/scoring/health'),
};

// Type definitions based on OpenAPI spec
export interface LoginRequest {
  username: string;
  password: string;
}

export interface CandidateAuthRequest {
  email: string;
  accessCode: string;
}

export interface LoginResponse {
  token?: string;
  enterpriseId?: string;
  username?: string;
  password?: string;
}

export interface CandidateAuthResponse {
  testName: string;
  totalQuestions: number;
  duration: number;
  testId: number;
}

export interface Enterprise {
  id: string;
  name: string;
  domain: Domain;
}

export interface EnterpriseCreateRequest {
  name: string;
  domain: Domain;
  adminAccount?: {
    username?: string;
    password?: string;
  };
}

export interface Domain {
  id?: number;
  name: string;
}

export interface TestRequest {
  name: string;
  duration_minute: number;
  questions?: { id: number }[];
}

export interface TestResponse {
  id: number;
  name: string;
  durationMinute: number;
  isActive: boolean;
  isPublic: boolean;
  enterpriseId: string;
  adminAccountId: number;
}

export interface TestSessionRequest {
  testId: number;
  emailCandidate: string[];
  dateExpiration: string;
}

export interface TestSessionResponse {
  sessionId: number;
  candidateEmail: string;
  accessCode: string;
  startTime?: string;
  expirationTime: string;
  isUsed: boolean;
  status: 'PLANNED' | 'SCHEDULED' | 'ACTIVE' | 'FINISHED';
  score?: number;
  testName: string;
  testId: number;
  testDuration: number;
}

export interface QuestionCreateRequest {
  label: string;
  hint?: string;
  points: number;
  questionType: 'QCM' | 'TRUE_OR_FALSE' | 'OPEN_QUESTION';
  answers?: AnswerCreateRequest[];
  openAnswers?: OpenAnswerCreateRequest;
}

export interface AnswerCreateRequest {
  label: string;
  correct: boolean;
}

export interface OpenAnswerCreateRequest {
  expectedAnswer: string;
  keyWords?: { keyword: string }[];
}

export interface QuestionResponse {
  id: number;
  label: string;
  hint?: string;
  types: string;
  points: number;
  answers?: AnswerResponse[];
  openAnswers?: OpenAnswerResponse;
}

export interface TestQuestionResponse {
  position: number;
  id: number;
  label: string;
  hint?: string;
  types: string;
  points: number;
  answers?: AnswerResponse[];
}

export interface CandidateQuestionResponse {
  id: number;
  label: string;
  hint?: string;
  questionType: string;
  points: number;
  answers?: CandidateAnswerResponse[];
}

export interface AnswerResponse {
  id: number;
  label: string;
  correct: boolean;
}

export interface CandidateAnswerResponse {
  id: number;
  label: string;
}

export interface OpenAnswerResponse {
  id: number;
  expectedAnswer: string;
  keyWords?: KeywordResponse[];
}

export interface KeywordResponse {
  id: number;
  keyword: string;
}

export interface SubmitTestRequest {
  answers: SubmitAnswerRequest[];
}

export interface SubmitAnswerRequest {
  questionId: number;
  selectedAnswerId?: number | null;
  openAnswerText?: string | null;
}

export interface SubmitTestResponse {
  testSessionId: number;
  totalScore: number;
  totalPossiblePoints: number;
  totalScoreFraction: string;
  scorePercentage: number;
  totalQuestions: number;
  answeredQuestions: number;
  status: 'PLANNED' | 'ACTIVE' | 'FINISHED';
  message?: string;
  questionResults: QuestionResultResponse[];
}

export interface QuestionResultResponse {
  questionId: number;
  questionLabel: string;
  questionType: string;
  candidateAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  scoreFraction: string;
  pointsEarned: number;
  maxPoints: number;
}

export interface OpenQuestionScoreRequest {
  questionId: number;
  studentAnswer: string;
  modelAnswer: string;
  maxPoints: number;
}

export interface OpenQuestionScoreResponse {
  questionId: number;
  score: number;
  feedback: string;
  maxPoints: number;
}
