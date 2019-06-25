import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import head from 'lodash/head';

import { EDIT } from '../../../config/constants';
import { fetchNavigation } from '../Navigation/reducer';
import IsAllowed from '../IsAllowed/IsAllowed';
import Loader from '../Loader';
import LoginContainer from '../Login/LoginContainer';
import Logo from './Logo';

import './Header.scss';

export class Header extends React.Component {
  render () {
    const { isFetching } = this.props;
    const gitVersion = head(GIT_VERSION.split('-'));

    return (
      <div className='header'>
        <nav className='navbar navbar-inverse container-fluid'>
          <Link
            to='/'
            className='brand-title navbar-brand logo'
            onClick={() => this.props.fetchNavigation(false)}
          >
            <Logo />
          </Link>
          <Link
            to='/'
            className='brand-title navbar-brand'
            onClick={() => this.props.fetchNavigation(false)}
          >
            Tiedonohjaus
          </Link>
          <p className='navbar-text'>
            <small>{SITE_TITLE} {gitVersion}</small>
          </p>
          <LoginContainer />
          <IsAllowed to={EDIT}>
            <p className='navbar-text pull-right'>
              <Link
                to='bulk'
                className='navbar-link'
              >
                Massamuutos
              </Link>
            </p>
          </IsAllowed>
          <p className='navbar-text pull-right'>
            <Link
              to={FEEDBACK_URL}
              target='_blank'
              className='navbar-link'
            >
              Anna palautetta
            </Link>
          </p>
        </nav>
        <Loader show={isFetching}/>
      </div>
    );
  }
}

Header.propTypes = {
  fetchNavigation: PropTypes.func,
  isFetching: PropTypes.bool
};

Header.defaultProps = {
  fetchNavigation: () => {}
};

const mapStateToProps = (state) => {
  return {
    isFetching: state.ui.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchNavigation
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Header);
