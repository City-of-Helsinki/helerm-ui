import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.scss';
import hkiLogo from './helsinki-vaakuna-helfisininen.svg';

export const NotFound = () => (
  <div className='not-found-container'>
    <img className='helsinki-logo' src={hkiLogo} alt='Helsinki City Logo'/>
    <h1>Tätä sivua ei löytynyt :(</h1>
    <p>Takaisin etusivulle <Link to='/'>tästä.</Link></p>
  </div>
);

export default NotFound;
