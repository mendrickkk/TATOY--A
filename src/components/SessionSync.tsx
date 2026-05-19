import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import {authLogout} from '../app/actions';
import {registerSessionExpiredHandler} from '../app/api/session';
import {showInfo} from './alert_messages';

/** Wires API 401 (expired JWT) to Redux logout so navigation returns to sign-in. */
const SessionSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      showInfo({
        title: 'Session expired',
        message: 'Please sign in again.',
        position: 'bottom',
        visibilityTime: 3500,
      });
      dispatch(authLogout());
    });
    return () => registerSessionExpiredHandler(null);
  }, [dispatch]);

  return null;
};

export default SessionSync;
