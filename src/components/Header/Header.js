import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Loader from '../Loader';
import './Header.scss';

export const Header = ({ isFetching }) => (
  <div>
    <nav className='navbar navbar-inverse container-fluid'>
      <Link to='/' className='brand-title navbar-brand'>Tiedonohjausjärjestelmä Alpha v0.1.4</Link>
    </nav>
    {isFetching &&
    <Loader />
    }
  </div>
);

Header.propTypes = {
  isFetching: React.PropTypes.bool
};

const mapStateToProps = (state) => {
  return {
    isFetching: state.ui.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching
  };
};

export default connect(mapStateToProps)(Header);
