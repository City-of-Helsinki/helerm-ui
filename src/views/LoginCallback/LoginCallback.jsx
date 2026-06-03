import { LoginCallbackHandler } from 'hds-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { useNotificationsContext } from '../../components/NotificationsContext/hooks/useNotificationsContext';
import Loader from '../../components/Loader';
import {
  handleLoginCallbackErrorThunk,
  initializeLoginCallbackThunk,
  retrieveUserFromSession,
} from '../../store/reducers/user';
import useAuth from '../../hooks/useAuth';

const LoginCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getApiToken } = useAuth();
  const { addNotification } = useNotificationsContext();

  const onSuccess = async (user) => {
    dispatch(initializeLoginCallbackThunk());

    const { profile } = user;
    const { sub: userId } = profile;

    const apiToken = getApiToken();

    if (userId && apiToken) {
      dispatch(retrieveUserFromSession({ id: userId, token: apiToken }));
    }

    navigate('/');
  };

  const onError = () => {
    dispatch(handleLoginCallbackErrorThunk());

    addNotification({ label: 'Virhe', children: 'Kirjautuminen epäonnistui!', type: 'error' });

    navigate('/');
  };

  return (
    <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
      <h3>Hetkinen, tarkistetaan kirjautumistietoja...</h3>
      <Loader show />
    </LoginCallbackHandler>
  );
};

export default LoginCallback;
