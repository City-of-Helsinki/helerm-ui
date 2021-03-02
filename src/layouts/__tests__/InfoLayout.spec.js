import { createBrowserHistory as mockHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import storeCreator from '../../store/createStore';
import InfoLayout from '../InfoLayout/InfoLayout';

describe('(Layout) Info', () => {
  const history = mockHistory();
  const store = storeCreator(history, {});
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}>
        <Router history={history}>
          <InfoLayout />
        </Router>
      </Provider>,
      div
    );
  });
});
