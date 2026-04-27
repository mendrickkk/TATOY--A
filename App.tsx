import React from 'react';
import {View} from 'react-native';
import {Provider} from 'react-redux';

import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import AppNav from './src/navigation';
import toastConfig from './src/components/alert_messages/config';

import Toast from 'react-native-toast-message';


const {store, runSaga} = configureStore();
runSaga(rootSaga);

const App = () => {
  return (
    <Provider store={store}>
      <View style={{flex: 1}}>
        <AppNav />
        <Toast config={toastConfig} />
      </View>
    </Provider>
  );
};

export default App;
