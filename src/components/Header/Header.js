import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { closeMessage } from '../../store/uiReducer';

import Alert from '../Alert/Alert';
import Loader from '../Loader';
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
    const { isFetching, message, closeMessage } = this.props;
    let alertMessage = null;
    if (this.state.showAlert === true) {
      alertMessage = (
        <Alert
          message={message.text}
          style={(message.success ? 'alert-success' : 'alert-danger')}
          close={closeMessage}
        />
      );
      setTimeout(closeMessage, 5000);
    }

    return (
      <div>
        <nav className='navbar navbar-inverse container-fluid'>
          <Link to='/' className='brand-title navbar-brand'>Tiedonohjausjärjestelmä Alpha v0.1.4</Link>
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
  message: React.PropTypes.object
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
