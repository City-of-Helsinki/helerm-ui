import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import './Login.scss';
import useAuth from '../../hooks/useAuth';
import { logoutUserThunk } from '../../store/reducers/user';

const Login = () => {
  const [displayName, setDisplayName] = useState(null);
  const dispatch = useDispatch();

  const { authenticated, user, login: authLogin, logout: authLogout } = useAuth();

  const getDisplayName = (profile) => {
    const { name, family_name, given_name } = profile;

    if (name) {
      return name;
    }

    if (given_name) {
      if (family_name) {
        return `${given_name} ${family_name}`;
      }

      return given_name;
    }

    return null;
  };

  useEffect(() => {
    if (authenticated) {
      const { profile } = user;

      const userName = getDisplayName(profile);

      setDisplayName(userName);
    }
  }, [user, authenticated]);

  const handleUserLinkClick = (event) => {
    event.preventDefault();

    if (authenticated) {
      dispatch(logoutUserThunk());
      authLogout();
    } else {
      authLogin();
    }
  };

  return (
    <span className='navbar-text login-link'>
      {!!displayName && <small>{displayName}</small>}

      <button className='btn btn-link login-button' type='button' onClick={handleUserLinkClick}>
        {authenticated ? 'Kirjaudu ulos' : 'Kirjaudu sisään'}
      </button>
    </span>
  );
};

export default Login;
