import {applyMiddleware, combineReducers, createStore} from 'redux';
import createSagaMiddleware from 'redux-saga';

//root reducer for the app

import auth from './auth';

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  auth,
});

export type RootState = ReturnType<typeof rootReducer>;

export default () => {
  const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
  const runSaga = sagaMiddleware.run;

  return {store, runSaga};
};
