import React, { Component, PropTypes } from 'react';
import { Provider, connect } from 'react-redux';
import { Router } from 'react-router';

import {
  fetchRecordTypes,
  fetchAttributeTypes
} from '../routes/Home/modules/home';

class AppContainer extends Component {
  static propTypes = {
    routes: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  componentWillMount () {
    this.props.fetchAttributeTypes();
    this.props.fetchRecordTypes();
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
        </div>
      </Provider>
    );
  }
}

const mapDispatchToProps = {
  fetchRecordTypes,
  fetchAttributeTypes
};

export default connect(null, mapDispatchToProps)(AppContainer);
