export const USER_LOGIN = 'USER_LOGIN';
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_COMPLETE = 'USER_LOGIN_COMPLETE';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const RESET_USER_LOGIN = 'RESET_USER_LOGIN';
export const AUTH_PROFILE_UPDATE = 'AUTH_PROFILE_UPDATE';

//actions for auth actions

export type LoginPayload = {
  username?: string;
  email?: string;
  password: string;
};

export type AuthLoginAction = {
  type: typeof USER_LOGIN;
  payload: LoginPayload;
};

export type AuthLogoutAction = {
  type: typeof RESET_USER_LOGIN;
};

export type AuthProfileUpdateAction = {
  type: typeof AUTH_PROFILE_UPDATE;
  payload: unknown;
};

export type AuthAction =
  | AuthLoginAction
  | AuthLogoutAction
  | AuthProfileUpdateAction
  | {type: typeof USER_LOGIN_REQUEST}
  | {type: typeof USER_LOGIN_COMPLETE; payload: unknown}
  | {type: typeof USER_LOGIN_ERROR; error: string};

export const authLogin = (payload: LoginPayload): AuthLoginAction => ({
  type: USER_LOGIN,
  payload,
});

export const authLogout = (): AuthLogoutAction => ({
  type: RESET_USER_LOGIN,
});

export const authProfileUpdate = (payload: unknown): AuthProfileUpdateAction => ({
  type: AUTH_PROFILE_UPDATE,
  payload,
});
