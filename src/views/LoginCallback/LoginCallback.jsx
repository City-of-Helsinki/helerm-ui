import React from 'react';
import PropTypes from 'prop-types';
import { LoginCallbackHandler } from 'hds-react';
import { useHistory } from 'react-router-dom';

import { displayMessage } from '../../utils/helpers';
import Loader from '../../components/Loader';
import useUpdateApiTokens from './hooks/useUpdateApiTokens';

const LoginCallback = ({ handleCallbackInitialize, retrieveUserFromSession, handleCallbackError }) => {
  const history = useHistory();

  const { updateApiTokens } = useUpdateApiTokens();

  const onSuccess = async (user) => {
    handleCallbackInitialize();

    const { profile } = user;
    const { sub: userId } = profile;

    await updateApiTokens();
    await retrieveUserFromSession(userId);

    history.push('/');
  };

  const onError = () => {
    handleCallbackError();

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

LoginCallback.propTypes = {
  handleCallbackInitialize: PropTypes.func.isRequired,
  retrieveUserFromSession: PropTypes.func.isRequired,
  handleCallbackError: PropTypes.func.isRequired,
};

export default LoginCallback;
