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

export function* userLoginAsync(action: AuthLoginAction) {
  try {
    yield put({type: USER_LOGIN_REQUEST});
    const data: unknown = yield call(userLoginApi, action.payload);
    yield put({
      type: USER_LOGIN_COMPLETE,
      payload: data,
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
