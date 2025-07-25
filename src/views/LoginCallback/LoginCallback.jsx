import React from 'react';
import { LoginCallbackHandler } from 'hds-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { displayMessage } from '../../utils/helpers';
import Loader from '../../components/Loader';
import useUpdateApiTokens from './hooks/useUpdateApiTokens';
import {
  handleLoginCallbackErrorThunk,
  initializeLoginCallbackThunk,
  retrieveUserFromSession,
} from '../../store/reducers/user';

const LoginCallback = () => {
  const navigate = useNavigate();

  const { updateApiTokens } = useUpdateApiTokens();

  const dispatch = useDispatch();

  const onSuccess = async (user) => {
    dispatch(initializeLoginCallbackThunk());

    const { profile } = user;
    const { sub: userId } = profile;

    await updateApiTokens();

    dispatch(retrieveUserFromSession(userId));

    navigate('/');
  };

  const onError = () => {
    dispatch(handleLoginCallbackErrorThunk());

    displayMessage({ title: 'Virhe', body: 'Kirjautuminen epäonnistui!' }, { type: 'error' });

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
