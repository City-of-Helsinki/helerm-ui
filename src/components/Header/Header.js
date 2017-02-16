import React from 'react';
import { connect } from 'react-redux';
import Loader from '../Loader';
import './Header.scss';

export const Header = ({ isFetching }) => (
  <div>
    <nav className='navbar navbar-inverse container-fluid'>
      <a href='' className='brand-title navbar-brand'>Tiedonohjausjärjestelmä Alpha v0.1.4</a>
    </nav>
    {isFetching &&
      <Loader />
    }
  </div>
);

const mapStateToProps = (state) => {
  return {
    isFetching: state.home.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching
  };
};

export default connect(mapStateToProps)(Header);
