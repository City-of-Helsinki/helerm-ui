import React, { Component, PropTypes } from 'react';
import { Router } from 'react-router';
import { Provider } from 'react-redux';

class AppContainer extends Component {
  static propTypes = {
    routes : PropTypes.object.isRequired,
    store  : PropTypes.object.isRequired,
    history  : PropTypes.object.isRequired
  };

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
        </div>
      </Provider>
    );
  }
}

export default AppContainer;
