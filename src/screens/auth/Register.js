import { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { ROUTES } from '../../utils';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const navigation = useNavigation();

  const handleRegister = () => {
    if (firstName === '' || lastName === '' || birthDate === '') {
      Alert.alert(
        'Incomplete Information',
        'Please fill in First Name, Last Name, and Birthdate',
      );
      return;
    }

    if (!acceptTerms) {
      Alert.alert(
        'Terms Not Accepted',
        'Please accept the Terms and Conditions to proceed',
      );
      return;
    }

    // TODO: Implement registration logic
    Alert.alert(
      'Success',
      `Registration successful for ${firstName} ${lastName}`,
    );
  };

  return (
    <ScrollView>
      <View
        style={{
          flex: 1,
          padding: 20,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 30 }}>
          Create Account
        </Text>

        <View style={{ width: '100%' }}>
          <CustomTextInput
            label={'First Name'}
            placeholder={'Enter First Name'}
            value={val => setFirstName(val)}
            containerStyle={{
              padding: 5,
            }}
            textStyle={{
              borderRadius: 10,
              color: 'black',
              marginLeft: 10,
              fontWeight: 'bold',
            }}
          />
          <CustomTextInput
            label={'Middle Name'}
            placeholder={'Enter Middle Name (Optional)'}
            value={val => setMiddleName(val)}
            containerStyle={{
              padding: 5,
            }}
            textStyle={{
              borderRadius: 10,
              color: 'black',
              marginLeft: 10,
              fontWeight: 'bold',
            }}
          />
          <CustomTextInput
            label={'Last Name'}
            placeholder={'Enter Last Name'}
            value={val => setLastName(val)}
            containerStyle={{
              padding: 5,
            }}
            textStyle={{
              borderRadius: 10,
              color: 'black',
              marginLeft: 10,
              fontWeight: 'bold',
            }}
          />
          <CustomTextInput
            label={'Birthdate'}
            placeholder={'MM/DD/YYYY'}
            value={val => setBirthDate(val)}
            containerStyle={{
              padding: 5,
            }}
            textStyle={{
              borderRadius: 10,
              color: 'black',
              marginLeft: 10,
              fontWeight: 'bold',
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 20,
            width: '100%',
          }}
        >
          <TouchableOpacity
            onPress={() => setAcceptTerms(!acceptTerms)}
            style={{
              width: 24,
              height: 24,
              borderWidth: 2,
              borderColor: '#007AFF',
              borderRadius: 4,
              marginRight: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: acceptTerms ? '#007AFF' : 'white',
            }}
          >
            {acceptTerms && <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>}
          </TouchableOpacity>
          <Text style={{ flex: 1, flexWrap: 'wrap' }}>
            I accept the Terms and Conditions
          </Text>
        </View>

        <CustomButton
          label={'REGISTER'}
          containerStyle={{
            backgroundColor: 'blue',
            borderRadius: 10,
            marginVertical: 20,
            width: '80%',
          }}
          textStyle={{
            color: 'white',
            fontWeight: 'bold',
          }}
          onPress={handleRegister}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate(ROUTES.LOGIN)}>
            <Text style={{ color: 'red', marginLeft: 10, fontWeight: 'bold' }}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Register;