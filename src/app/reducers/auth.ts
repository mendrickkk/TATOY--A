import {
  RESET_USER_LOGIN,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
} from '../actions';
import type {AnyAction} from 'redux';

//reducer for auth state

export type AuthState = {
  data: unknown;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
};

const INITIAL_STATE: AuthState = {
  data: null,
  isLoading: false,
  isError: false,
  error: null,
};

export default function reducer(
  state: AuthState = INITIAL_STATE,
  action: AnyAction,
): AuthState {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
      return {
        ...state,
        data: null,
        isLoading: true,
        isError: false,
        error: null,
      };
    case USER_LOGIN_COMPLETE:
      return {
        ...state,
        data: action.payload ?? null,
        isLoading: false,
        isError: false,
        error: null,
      };
    case USER_LOGIN_ERROR:
      return {
        ...state,
        data: null,
        isLoading: false,
        isError: true,
        error: action.error || 'Login failed',
      };
    case RESET_USER_LOGIN:
      return INITIAL_STATE;
    default:
      return state;
  }
}
