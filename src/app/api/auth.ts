import {Platform} from 'react-native';

type LoginParams = {
  username?: string;
  email?: string;
  password: string;
};

//api for auth actions

type LoginErrorPayload = {
  errors?: {
    password?: string;
    detail?: string;
  };
  detail?: string;
  message?: string;
};

type LoginError = Error & {
  status: number;
  payload: unknown;
};

/** Shared by auth and other API modules (e.g. products). */
export const REQUEST_TIMEOUT_MS = 10000;

/**
 * Physical device on the same Wi‑Fi as your PC: set your computer’s LAN IP, e.g.
 * `'http://192.168.1.10:8000'`. Emulator/simulator can leave this empty.
 * (127.0.0.1 on a phone points at the phone itself, not your PC.)
 */
export const EXTRA_DEV_API_BASE_URL = '';

export function getApiBaseCandidates(): string[] {
  const extra = EXTRA_DEV_API_BASE_URL.trim().replace(/\/$/, '');
  const defaults =
    Platform.OS === 'android'
      ? ['http://10.0.2.2:8000', 'http://127.0.0.1:8000']
      : ['http://127.0.0.1:8000'];
  if (!extra) {
    return defaults;
  }
  const rest = defaults.filter(b => b !== extra);
  return [extra, ...rest];
}

export function normalizeFetchConnectionError(err: Error): Error {
  const msg = err.message || '';
  if (msg === 'Network request failed' || msg.includes('Network request failed')) {
    return new Error(
      'Network request failed: the app could not reach Symfony. ' +
        'Start the server on port 8000. On a real phone, set EXTRA_DEV_API_BASE_URL in src/app/api/auth.ts ' +
        'to http://YOUR_PC_LAN_IP:8000 (same Wi‑Fi), then reload. On Android, rebuild after Gradle changes for HTTP.',
    );
  }
  return err;
}

function stringish(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return value.join(', ');
  }

  return undefined;
}

function apiErrorMessageFromBody(data: unknown, defaultMessage: string): string {
  const body =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : undefined;
  const errors =
    body?.errors && typeof body.errors === 'object'
      ? (body.errors as Record<string, unknown>)
      : undefined;

  return (
    stringish(body?.text) ||
    stringish(body?.message) ||
    stringish(body?.error) ||
    stringish(body?.detail) ||
    stringish(errors?.password) ||
    stringish(errors?.detail) ||
    stringish(errors?.message) ||
    stringish(errors?.non_field_errors) ||
    stringish(errors?.__all__) ||
    defaultMessage
  );
}

export async function userLogin({
  username,
  email,
  password,
}: LoginParams): Promise<unknown> {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    // Backend validation is inconsistent across attempts:
    // sometimes it expects `email`, sometimes it expects `username`.
    // Send both so whichever key is required will be present.
    body: JSON.stringify({
      username,
      email: email ?? username,
      password,
    }),
  };

  let lastConnectionError: Error | null = null;

  for (const baseUrl of getApiBaseCandidates()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/api/login`, {
        ...options,
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        lastConnectionError = new Error(
          `Connection timed out reaching ${baseUrl}. Check that the server is running and reachable.`,
        );
      } else if (err instanceof Error) {
        lastConnectionError = normalizeFetchConnectionError(err);
      } else {
        lastConnectionError = new Error('Connection failed');
      }
      continue;
    }
    clearTimeout(timeoutId);

    let rawText = '';
    try {
      rawText = await response.text();
    } catch {
      rawText = '';
    }

    let data: unknown = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText) as LoginErrorPayload;
      } catch {
        data = {text: rawText};
      }
    }

    if (response.ok) {
      console.log('Login success response:', data ?? {success: true});
      return data ?? {success: true};
    }

    const message = apiErrorMessageFromBody(data, 'Login failed');
    const statusSuffix = response.status ? ` (HTTP ${response.status})` : '';
    const error = new Error(`${message}${statusSuffix}`) as LoginError;
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  throw (
    lastConnectionError ||
    new Error('Connection failed. Check that the server is running and reachable.')
  );
}

export type RegisterParams = {
  username: string;
  email: string;
  password: string;
};

/**
 * POST /api/register — same host discovery as {@link userLogin}.
 * Backend expects username, email, password (JSON).
 */
export async function userRegister({
  username,
  email,
  password,
}: RegisterParams): Promise<unknown> {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({username, email, password}),
  };

  let lastConnectionError: Error | null = null;

  for (const baseUrl of getApiBaseCandidates()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/api/register`, {
        ...options,
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        lastConnectionError = new Error(
          `Connection timed out reaching ${baseUrl}. Check that the server is running and reachable.`,
        );
      } else if (err instanceof Error) {
        lastConnectionError = normalizeFetchConnectionError(err);
      } else {
        lastConnectionError = new Error('Connection failed');
      }
      continue;
    }
    clearTimeout(timeoutId);

    let rawText = '';
    try {
      rawText = await response.text();
    } catch {
      rawText = '';
    }

    let data: unknown = null;
    if (rawText) {
      try {
        data = JSON.parse(rawText) as LoginErrorPayload;
      } catch {
        data = {text: rawText};
      }
    }

    if (response.ok) {
      return data ?? {success: true};
    }

    const message = apiErrorMessageFromBody(data, 'Registration failed');
    const statusSuffix = response.status ? ` (HTTP ${response.status})` : '';
    const error = new Error(`${message}${statusSuffix}`) as LoginError;
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  throw (
    lastConnectionError ||
    new Error('Connection failed. Check that the server is running and reachable.')
  );
}
