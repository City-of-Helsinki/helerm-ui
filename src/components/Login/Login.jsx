/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';

import './Login.scss';
import useAuth from '../../hooks/useAuth';

const Login = () => {
  const [displayName, setDisplayName] = useState(null);

  const { authenticated, user, login, logout } = useAuth();

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
      logout();
    } else {
      login();
    }
  };

  return (
    <p className='navbar-text pull-right login-link'>
      {!!displayName && <small>{displayName}</small>}

      <button className='btn btn-link login-button' type='button' onClick={handleUserLinkClick}>
        {authenticated ? 'Kirjaudu ulos' : 'Kirjaudu sisään'}
      </button>
    </p>
  );
};

export default Login;
