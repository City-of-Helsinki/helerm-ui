import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchNavigation } from '../Navigation/reducer';
import Loader from '../Loader';
import LoginContainer from '../Login/LoginContainer';

import './Header.scss';

export class Header extends React.Component {
  render () {
    const { isFetching } = this.props;

    return (
      <div>
        <nav className='navbar navbar-inverse container-fluid'>
          <Link
            to='/'
            className='brand-title navbar-brand'
            onClick={() => this.props.fetchNavigation(false)}
            >
            Tiedonohjausjärjestelmä
          </Link>
          <LoginContainer />
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
