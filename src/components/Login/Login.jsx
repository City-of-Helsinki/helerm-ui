/* eslint-disable camelcase */
import React, { useEffect, useState } from 'react';
import './Login.scss';
import { useOidcClient } from 'hds-react';

const Login = () => {
  const [displayName, setDisplayName] = useState(null);

  const { isAuthenticated, login, logout, getUser } = useOidcClient();

  const user = getUser();
  const isAuth = isAuthenticated();

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
    if (isAuth) {
      const { profile } = user;

      const userName = getDisplayName(profile);

      setDisplayName(userName);
    }
  }, [user, isAuth]);

  const handleUserLinkClick = (event) => {
    event.preventDefault();

    if (isAuth) {
      logout();
    } else {
      login();
    }
  };

  return (
    <p className='navbar-text pull-right login-link'>
      {!!displayName && <small>{displayName}</small>}

      <button className='btn btn-link login-button' type='button' onClick={handleUserLinkClick}>
        {isAuth ? 'Kirjaudu ulos' : 'Kirjaudu sisään'}
      </button>
    </p>
  );
};

export default Login;
