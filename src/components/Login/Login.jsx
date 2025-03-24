import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import './Login.scss';
import useAuth from '../../hooks/useAuth';

const Login = ({ loginDispatch, logoutDispatch }) => {
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
      logoutDispatch();

      logout();
    } else {
      loginDispatch();

      login();
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

Login.propTypes = {
  loginDispatch: PropTypes.func.isRequired,
  logoutDispatch: PropTypes.func.isRequired,
};

export default Login;
