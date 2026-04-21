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
  payload: LoginErrorPayload | null;
};

export async function userLogin({
  username,
  email,
  password,
}: LoginParams): Promise<unknown> {
  const BASE_URL = 'http://10.130.141.34:8000';

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

  const response = await fetch(BASE_URL + '/api/login', options);

  // Read response body (once). Try JSON parse; fallback to raw text.
  let rawText: string | null = null;
  try {
    rawText = await response.text();
  } catch (_) {
    rawText = null;
  }

  let data: LoginErrorPayload | null = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText) as LoginErrorPayload;
    } catch (_) {
      data = null;
    }
  }

  if (response.ok) {
    console.log('login success response', data ?? rawText);
    // If backend returns 200 with an empty body, still treat it as success
    // so `state.auth.data` becomes non-null and navigation switches.
    return data ?? rawText ?? {success: true};
  }

  console.log('login failed', {
    status: response.status,
    data,
    rawText,
  });

  const message =
    data?.errors?.password ??
    data?.errors?.detail ??
    data?.detail ??
    data?.message ??
    rawText ??
    `Login failed (HTTP ${response.status})`;

  const error = new Error(message) as LoginError;
  error.status = response.status;
  error.payload = data;
  throw error;
}
