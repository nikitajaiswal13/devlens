import type { ApiResponse, AuthSuccessData, LoginPayload, RegisterPayload, UserSuccessData } from '../types/auth';
import type { CodeAnalysisPayload, CodeAnalysisResult } from '../types/analysis';

const TOKEN_KEY = 'devlens_token';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      // sessionStorage might be restricted in some environments
    }
  },
  remove: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = tokenStorage.get();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(endpoint, config);
  } catch {
    throw new ApiError('Unable to connect to DevLens server. Please check your network or server status.');
  }

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      response.ok ? 'Invalid response from server' : `Request failed with status ${response.status}`,
      response.status
    );
  }

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || 'Something went wrong', response.status);
  }

  return (data.data as T);
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthSuccessData> => {
    return request<AuthSuccessData>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  register: async (payload: RegisterPayload): Promise<AuthSuccessData> => {
    return request<AuthSuccessData>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getCurrentUser: async (): Promise<UserSuccessData> => {
    return request<UserSuccessData>('/api/auth/me', {
      method: 'GET',
    });
  },
};

export const analysisApi = {
  analyze: async (payload: CodeAnalysisPayload): Promise<CodeAnalysisResult> => {
    return request<CodeAnalysisResult>('/api/analysis/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
