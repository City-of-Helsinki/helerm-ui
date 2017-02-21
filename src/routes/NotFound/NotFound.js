import React from 'react';
import { Link } from 'react-router';
import './NotFound.scss';

export const NotFound = () => (
  <div className='not-found-container'>
    <img className='helsinki-logo' src={require('../../static/assets/helsinki-vaakuna-helfisininen.svg')} alt='Helsinki City Logo' />
    <h1>Tätä sivua ei löytynyt :(</h1>
    <p>Takaisin kotisivulle <Link to='/'>tästä.</Link></p>
  </div>
);

export default NotFound;
