import { ApiResponse } from '@/types';

export interface MockApiOptions {
  latencyMs?: number;
  shouldFail?: boolean;
}

export class MockApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code: string = 'BAD_REQUEST', status: number = 400, details?: any) {
    super(message);
    this.name = 'MockApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/**
 * Universal Mock API layer with envelope formatting, simulated latency,
 * and error control (400, 403, 404, 409, 500).
 */
export async function executeMockRequest<T>(
  action: () => T | Promise<T>,
  options: MockApiOptions = {}
): Promise<ApiResponse<T>> {
  const { latencyMs = 80, shouldFail = false } = options;

  if (latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
  }

  if (shouldFail) {
    throw new MockApiError(
      'Simulated 500 Internal Server Error. Fleet telematics gateway timed out.',
      'INTERNAL_SERVER_ERROR',
      500
    );
  }

  try {
    const result = await action();
    return {
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  } catch (err: any) {
    if (err instanceof MockApiError) {
      return {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0-mock',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: err?.message || 'An unexpected mock API error occurred',
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0-mock',
      },
    };
  }
}
