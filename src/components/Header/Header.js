import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { closeMessage } from '../../store/uiReducer';
import { setNavigationVisibility } from '../Navigation/navigationReducer';

import Alert from '../Alert/Alert';
import Loader from '../Loader';
import LoginContainer from '../Login/containers/LoginContainer';

import './Header.scss';

export class Header extends React.Component {
  constructor (props) {
    super(props);
    this.state = { showAlert: false };
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.message) {
      this.setState({ showAlert: nextProps.message.active });
    }
  }

  render () {
    const { isFetching, message, closeMessage, setNavigationVisibility } = this.props;
    let alertMessage = null;
    if (this.state.showAlert === true) {
      alertMessage = (
        <Alert
          text={message.text}
          style={(message.success ? 'alert-success' : 'alert-danger')}
          close={closeMessage}
        />
      );
      setTimeout(closeMessage, 5000);
    }

    return (
      <div>
        <nav
          className='navbar navbar-inverse container-fluid'
          onClick={() => setNavigationVisibility(true)}>
          <Link to='/' className='brand-title navbar-brand'>Tiedonohjausjärjestelmä Alpha v0.1.4</Link>
          <LoginContainer />
        </nav>
        <Loader show={isFetching}/>
        <ReactCSSTransitionGroup
          transitionName={'alert-position'}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={600}>
          {this.state.showAlert && alertMessage}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

Header.propTypes = {
  closeMessage: React.PropTypes.func,
  isFetching: React.PropTypes.bool,
  message: React.PropTypes.object,
  setNavigationVisibility: React.PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    message: state.ui.message,
    isFetching: state.ui.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeMessage: bindActionCreators(closeMessage, dispatch),
    setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
