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
import Login from '../Login/Login';
import Logo from './Logo';

import './Header.scss';

const Header = (props) => {
  const { isFetching } = props;
  const gitVersion = config.GIT_VERSION;
  const siteTitle = config.SITE_TITLE;
  const feedbackUrl = config.FEEDBACK_URL;
  const themeColor = config.SITE_THEME;

  return (
    <div className='header'>
      <nav className='navbar navbar-inverse container-fluid' style={{ backgroundColor: themeColor }}>
        <Link to='/' className='brand-title navbar-brand logo' onClick={() => props.fetchNavigation(false)}>
          <Logo />
        </Link>
        <Link to='/' className='brand-title navbar-brand' onClick={() => props.fetchNavigation(false)}>
          Tiedonohjaus
        </Link>
        <p className='navbar-text'>
          <small>
            {siteTitle} {gitVersion}
          </small>
        </p>
        <Login />
        <IsAllowed to={EDIT}>
          <p className='navbar-text pull-right'>
            <Link to='/bulk' className='navbar-link'>
              Massamuutos
            </Link>
          </p>
        </IsAllowed>
        <p className='navbar-text pull-right'>
          <Link to='/search' className='navbar-link'>
            Haku
          </Link>
        </p>
        <p className='navbar-text pull-right'>
          <a href={feedbackUrl} target='_blank' rel='noreferrer' className='navbar-link'>
            Anna palautetta
          </a>
        </p>
      </nav>
      <Loader show={isFetching} />
    </div>
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
