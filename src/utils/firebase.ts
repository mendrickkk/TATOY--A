import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';


GoogleSignin.configure({
    webClientId: '674321333887-pam2k7o27gvis9hcjsmu58rei8unef2j.apps.googleusercontent.com',
});

const sign_in_with_google = async () => {
  console.log('signing in');
  // await GoogleSignin.signOut();
  // return
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      return { userInfo: response.data };
    } else {
      console.log('cancelled');
      // sign in was cancelled by user
    }
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // Android only, play services not available or outdated
          break;
        default:
        // some other error happened
      }
    } else {
      // an error that's not related to google sign in occurred
    }
  }
};

export default sign_in_with_google;