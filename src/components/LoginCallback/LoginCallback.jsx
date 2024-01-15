import React from 'react';
import { LoginCallbackHandler } from 'hds-react';
import { useHistory } from 'react-router-dom';

import { displayMessage } from '../../utils/helpers';
import Loader from '../Loader';
import useUpdateApiTokens from './hooks/useUpdateApiTokens';

const LoginCallback = () => {
  const history = useHistory();

  const { updateApiTokens } = useUpdateApiTokens();

  const onSuccess = async () => {
    await updateApiTokens();

    history.push('/');
  };

  const onError = () => {
    displayMessage({ title: 'Virhe', body: 'Kirjautuminen epäonnistui!' }, { type: 'error' });

    history.push('/');
  };

  return (
    <LoginCallbackHandler onSuccess={onSuccess} onError={onError}>
      <h3>Hetkinen, tarkistetaan kirjautumistietoja...</h3>
      <Loader show />
    </LoginCallbackHandler>
  );
};

export default LoginCallback;
