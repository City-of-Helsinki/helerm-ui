import React, { Component, PropTypes } from 'react';
import { Provider, connect } from 'react-redux';
import { Router } from 'react-router';
import ReduxToastr from 'react-redux-toastr';

import {
  fetchAttributeTypes
} from '../store/uiReducer';

class AppContainer extends Component {
  static propTypes = {
    fetchAttributeTypes: PropTypes.func,
    history: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  componentWillMount () {
    this.props.fetchAttributeTypes();
  }

  shouldComponentUpdate () {
    return false;
  }

  render () {
    const { routes, store, history } = this.props;
    return (
      <Provider store={store}>
        <div style={{ height: '100%' }}>
          <Router history={history}>
            {routes}
          </Router>
          <ReduxToastr
            timeOut={4000}
            newestOnTop={true}
            preventDuplicates={true}
            position='top-right'
            transitionIn='fadeIn'
            transitionOut='bounceOutUp'
            progressBar={true}
          />
        </div>
      </Provider>
    );
  }
}

const mapDispatchToProps = { fetchAttributeTypes };

export default connect(null, mapDispatchToProps)(AppContainer);
