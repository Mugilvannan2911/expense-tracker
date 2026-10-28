/**
 * Base API Client wrapper using real backend session cookies and error handling
 */

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Real backend HTTP-only cookies
  };

  const response = await fetch(endpoint, config);

  let responseData: unknown = null;
  const contentType = response.headers.get('content-type');
  try {
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
  } catch {
    // responseData remains null if empty or unparseable
  }

  if (!response.ok) {
    let errorMessage = 'An unexpected server error occurred';

    if (responseData && typeof responseData === 'object') {
      const parsed = responseData as { message?: string; error?: string };
      errorMessage = parsed.message || parsed.error || errorMessage;
    } else if (typeof responseData === 'string' && responseData.length > 0) {
      errorMessage = responseData;
    }

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}
