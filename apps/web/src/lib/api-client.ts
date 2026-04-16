'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function getAuthToken(): Promise<string | null> {
  // Dans un cas réel, récupérer depuis localStorage ou un contexte
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  const hasFormDataBody = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

  if (!hasFormDataBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  // Retourner le Buffer pour les fichiers PDF
  return (await response.blob()) as T;
}

function encodeBody(body?: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}

export const api = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: encodeBody(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: encodeBody(body),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  downloadPdf: async (endpoint: string): Promise<Blob> => {
    const token = await getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      throw new Error(`Failed to download PDF: ${response.status}`);
    }

    return response.blob();
  },
};
