import {call, put, takeLatest} from 'redux-saga/effects';

//saga for user login

import {
  USER_LOGIN,
  USER_LOGIN_COMPLETE,
  USER_LOGIN_ERROR,
  USER_LOGIN_REQUEST,
  type AuthLoginAction,
} from '../actions';
import {userLogin as userLoginApi} from '../api/auth';

function withLoginIdentifier(apiData: unknown, loginId: string | undefined): unknown {
  const id = loginId?.trim();
  if (apiData !== null && typeof apiData === 'object' && !Array.isArray(apiData)) {
    return {
      ...(apiData as Record<string, unknown>),
      ...(id ? {_appLoginIdentifier: id} : {}),
    };
  }
  return id ? {_appLoginRaw: apiData, _appLoginIdentifier: id} : apiData;
}

export function* userLoginAsync(action: AuthLoginAction) {
  try {
    yield put({type: USER_LOGIN_REQUEST});
    const data: unknown = yield call(userLoginApi, action.payload);
    const loginId = action.payload.username ?? action.payload.email;
    yield put({
      type: USER_LOGIN_COMPLETE,
      payload: withLoginIdentifier(data, loginId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    yield put({
      type: USER_LOGIN_ERROR,
      error: message,
    });
  }
}

export function* userLogin() {
  yield takeLatest(USER_LOGIN, userLoginAsync);
}
