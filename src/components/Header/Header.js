import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

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
            className='brand-title navbar-brand'>
            Tiedonohjausjärjestelmä v{VERSION}
          </Link>
          <LoginContainer />
        </nav>
        <Loader show={isFetching}/>
      </div>
    );
  }
}

Header.propTypes = {
  isFetching: React.PropTypes.bool
};

const mapStateToProps = (state) => {
  return {
    isFetching: state.ui.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching
  };
};

export default connect(mapStateToProps)(Header);
