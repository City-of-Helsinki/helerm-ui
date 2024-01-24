import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { EDIT } from '../../constants';
import config from '../../config';
import { fetchNavigation } from '../Navigation/reducer';
import IsAllowed from '../IsAllowed/IsAllowed';
import Loader from '../Loader';
import Logo from './Logo';
import './Header.scss';
import LoginContainer from '../Login/LoginContainer';

const Header = (props) => {
  const { isFetching } = props;
  const gitVersion = config.GIT_VERSION;
  const siteTitle = config.SITE_TITLE;
  const feedbackUrl = config.FEEDBACK_URL;
  const themeColor = config.SITE_THEME;

  return (
    <header className='header'>
      <nav className='navbar navbar-inverse container-fluid' style={{ backgroundColor: themeColor }}>
        <Link to='/' className='brand-title navbar-brand logo' onClick={() => props.fetchNavigation(false)}>
          <Logo />
        </Link>
        <Link to='/' className='brand-title navbar-brand' onClick={() => props.fetchNavigation(false)}>
          Tiedonohjaus
        </Link>
        <span className='navbar-text'>
          <small>
            {siteTitle} {gitVersion}
          </small>
        </span>
        <div className='menu'>
          <ul className='link-list'>
            <IsAllowed to={EDIT}>
              <li className='navbar-text'>
                <Link to='/bulk' className='navbar-link'>
                  Massamuutos
                </Link>
              </li>
            </IsAllowed>
            <li className='navbar-text'>
              <Link to='/search' className='navbar-link'>
                Haku
              </Link>
            </li>
            <li className='navbar-text'>
              <Link to='/cookies' className='navbar-link'>
                Evästeasetukset
              </Link>
            </li>
            <li className='navbar-text'>
              <a href={feedbackUrl} target='_blank' rel='noreferrer' className='navbar-link'>
                Anna palautetta
              </a>
            </li>
          </ul>
          <LoginContainer />
        </div>
      </nav>
      <Loader show={isFetching} />
    </header>
  );
};

Header.propTypes = {
  fetchNavigation: PropTypes.func,
  isFetching: PropTypes.bool,
};

Header.defaultProps = {
  fetchNavigation: () => {},
};

const mapStateToProps = (state) => ({
  isFetching: state.ui.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchNavigation,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Header);
