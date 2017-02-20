import React from 'react';

import LoginContainer from '../Login/containers/LoginContainer';

import './Header.scss';

export const Header = () => (
  <nav className='navbar navbar-inverse container-fluid'>
    <a href='' className='brand-title navbar-brand'>Tiedonohjausjärjestelmä Alpha v0.1.4</a>
    <LoginContainer />
  </nav>
);

export default Header;
