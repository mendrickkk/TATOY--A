import {all} from 'redux-saga/effects';

//sagas index for the app

import {userLogin} from './auth';

export default function* rootSaga() {
  yield all([userLogin()]);
}
