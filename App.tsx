import React from 'react';
import {View} from 'react-native';
import {Provider} from 'react-redux';

import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import AppNav from './src/navigation';

const {store, runSaga} = configureStore();
runSaga(rootSaga);

const App = () => {
  return (
    <Provider store={store}>
      <View style={{flex: 1}}>
        <AppNav />
      </View>
    </Provider>
  );
};

export default App;
