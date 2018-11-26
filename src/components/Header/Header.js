import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { fetchNavigation } from '../Navigation/reducer';
import Loader from '../Loader';
import LoginContainer from '../Login/LoginContainer';
import { displayMessage } from '../../utils/helpers';

import './Header.scss';

export class Header extends React.Component {

  constructor (props) {
    super(props);

    this.fetchNavigation = this.fetchNavigation.bind(this);
  }

  fetchNavigation (event) {
    event.preventDefault();
    this.props.fetchNavigation(false)
      .catch(err => {
        this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`
          },
          { type: 'error' }
        );
      });
  }

  render () {
    const { isFetching } = this.props;
    return (
      <div>
        <nav className='navbar navbar-inverse container-fluid'>
          <Link
            to='/'
            className='brand-title navbar-brand'
            onClick={this.fetchNavigation}
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
  displayMessage: PropTypes.func.isRequired,
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

const mapDispatchToProps = dispatch => ({
  displayMessage: (msg, opts) => displayMessage(msg, opts),
  fetchNavigation: bindActionCreators(fetchNavigation, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
