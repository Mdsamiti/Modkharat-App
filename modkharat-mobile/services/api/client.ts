import { API_BASE_URL } from './config';
import { supabase } from './supabase';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public traceId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get the current access token from Supabase session.
 */
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Core fetch wrapper with auth headers, error handling, and response parsing.
 */
async function request<T>(
  method: string,
  path: string,
  options: {
    body?: any;
    query?: Record<string, string | number | undefined>;
    householdId?: string;
    idempotencyKey?: string;
  } = {},
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new ApiError(401, 'NO_SESSION', 'Not authenticated');
  }

  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  if (options.householdId) {
    headers['x-household-id'] = options.householdId;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const json = await res.json();

  if (!res.ok) {
    const err = json.error ?? {};
    throw new ApiError(
      res.status,
      err.code ?? 'UNKNOWN',
      err.message ?? 'Request failed',
      err.traceId,
    );
  }

  return json;
}

/** GET request */
export function get<T>(path: string, query?: Record<string, string | number | undefined>, householdId?: string) {
  return request<T>('GET', path, { query, householdId });
}

/** POST request */
export function post<T>(path: string, body?: any, options?: { householdId?: string; idempotencyKey?: string }) {
  return request<T>('POST', path, { body, ...options });
}

/** PATCH request */
export function patch<T>(path: string, body?: any, householdId?: string) {
  return request<T>('PATCH', path, { body, householdId });
}

/** DELETE request */
export function del<T>(path: string, householdId?: string) {
  return request<T>('DELETE', path, { householdId });
}

/** POST multipart/form-data (for file uploads) */
export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new ApiError(401, 'NO_SESSION', 'Not authenticated');
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type — fetch sets it with boundary for FormData
    },
    body: formData,
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (!res.ok) {
    const err = json.error ?? {};
    throw new ApiError(res.status, err.code ?? 'UNKNOWN', err.message ?? 'Request failed', err.traceId);
  }
  return json;
}
