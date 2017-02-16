import React, { Component, PropTypes } from 'react';
import { Provider, connect } from 'react-redux';
import { Router } from 'react-router';

import {
  fetchRecordTypes,
  fetchAttributeTypes
} from '../store/uiReducer';

class AppContainer extends Component {
  static propTypes = {
    fetchAttributeTypes: PropTypes.func.isRequired,
    fetchRecordTypes: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
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
