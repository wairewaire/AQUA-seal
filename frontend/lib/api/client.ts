import type { ApiError } from '@/types';

// Thin HTTP client abstraction. Today it backs mock functions; tomorrow it
// wraps fetch() against the Go modular monolith. UI code never calls this
// directly — it goes through /lib/api modules.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';

export const API_LATENCY_MS = 650; // simulated network latency for mocks

export class ApiRequestError extends Error {
  code: string;
  status?: number;
  details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}

export function notFoundError(resource: string, id: string): ApiRequestError {
  return new ApiRequestError({
    code: 'not_found',
    message: `${resource} "${id}" was not found.`,
    status: 404,
  });
}

export function networkError(message = 'Network error. Please try again.'): ApiRequestError {
  return new ApiRequestError({
    code: 'network_error',
    message,
    status: 503,
  });
}

export function validationError(message: string, details?: Record<string, unknown>): ApiRequestError {
  return new ApiRequestError({
    code: 'validation_error',
    message,
    details,
    status: 400,
  });
}

// Simulated async latency used by all mock implementations.
export function delay<T>(value: T, ms = API_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function delayError(error: ApiRequestError, ms = API_LATENCY_MS): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(error), ms));
}

// Normalize a batch id: uppercase, trim, strip spaces.
export function normalizeBatchId(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}
