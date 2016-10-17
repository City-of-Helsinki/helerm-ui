import React from 'react';
import { IndexLink, Link } from 'react-router';
import './Header.scss';

export const Header = () => (
  <nav className="navbar navbar-inverse container-fluid">
    <a className="brand-title navbar-brand">Tiedonohjausjärjestelmä</a>
  </nav>
);

export default Header;
