import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { setNavigationVisibility } from '../Navigation/reducer';

import Loader from '../Loader';
import LoginContainer from '../Login/LoginContainer';

import './Header.scss';

export class Header extends React.Component {
  componentWillReceiveProps (nextProps) {
    if (nextProps.message) {
      this.setState({ showAlert: nextProps.message.active });
    }
  }

  render () {
    const { isFetching } = this.props;

    return (
      <div>
        <nav className='navbar navbar-inverse container-fluid'>
          <Link
            to='/'
            className='brand-title navbar-brand'
            onClick={() => this.props.setNavigationVisibility(true)}>
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
  isFetching: React.PropTypes.bool,
  message: React.PropTypes.object,
  setNavigationVisibility: React.PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    isFetching: state.ui.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
