import React from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import AppNav from './src/navigation';
import toastConfig from './src/components/alert_messages/config';

import Toast from 'react-native-toast-message';


const {store, runSaga} = configureStore();
runSaga(rootSaga);

const App = () => {
  return (
    <GestureHandlerRootView style={styles.appRoot}>
      <Provider store={store}>
        <SafeAreaProvider>
          <View style={styles.appRoot}>
            <AppNav />
            <Toast config={toastConfig} />
          </View>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
});
