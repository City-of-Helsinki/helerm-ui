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

  const onError = (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    if (!error) return;
    if (
      error.type === 'SIGNIN_ERROR' &&
      error.message ===
        'Current state (HANDLING_LOGIN_CALLBACK) cannot be handled by a callback'
    ) {
      // Note: When the HDS team has improved the error handling,
      // this should be doable with;
      // ```
      // if (isHandlingLoginCallbackError(error)) {
      ///...
      // }
      // ```

      // The HANDLING_LOGIN_CALLBACK error is raised only
      // when we are using the <React.Strict>.
      // We don't want to handle this error,
      // because it is raised during every login process,
      // and it does not affect any how to the signin process.
      // When the <BrowserApp> is removed from the React.Strict -container,
      // The error won't be raised anymore. The HDS team has been noted about this issue.
      return;
    }
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
