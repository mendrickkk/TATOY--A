import {Image, Text, View} from 'react-native';

import {IMG} from '../utils';

const ProfileScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'blue',
      }}>
      <Image source={IMG.LOGO} style={{width: 320, height: 120}} />
      <Text style={{fontSize: 40}}>ProfileScreen</Text>
    </View>
  );
};

export default ProfileScreen;
