import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { closeMessage } from '../../store/uiReducer';

import Alert from '../Alert/Alert';
import Loader from '../Loader';
import './Header.scss';

export const Header = ({ isFetching, message, closeMessage }) => {
  return (
    <div>
      <nav className='navbar navbar-inverse container-fluid'>
        <Link to='/' className='brand-title navbar-brand'>Tiedonohjausjärjestelmä Alpha v0.1.4</Link>
      </nav>
      {isFetching &&
      <Loader />
      }
      {message.text !== '' &&
      <Alert
        message={message.text}
        style={(message.success ? 'alert-success' : 'alert-danger')}
        close={closeMessage}
      />
      }
    </div>
  );
};

Header.propTypes = {
  isFetching: React.PropTypes.bool
};

const mapStateToProps = (state) => {
  return {
    message: state.ui.message,
    isFetching: state.ui.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeMessage: bindActionCreators(closeMessage, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
