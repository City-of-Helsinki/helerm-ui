import { createBrowserHistory } from 'history';
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import BulkCreateView from '../BulkCreateView';
import renderWithProviders from '../../../../utils/renderWithProviders';
import attributeRules from '../../../../utils/mocks/attributeRules.json';
import validTOS from '../../../../utils/mocks/validTOS.json';
import user from '../../../../utils/mocks/user.json';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const renderComponent = () => {
  const history = createBrowserHistory();

  const props = {
    displayMessage: vi.fn(),
    getAttributeName: vi.fn(),
    fetchNavigation: vi.fn(),
    saveBulkUpdate: vi.fn(),
    attributeTypes: attributeRules,
    isFetching: false,
    items: [validTOS],
  };

  const router = createBrowserRouter([{ path: '/', element: <BulkCreateView {...props} /> }]);

  const store = mockStore({
    ui: {
      actionTypes: {},
      attributeTypes: attributeRules,
      phaseTypes: {},
      recordTypes: {},
      templates: [],
    },
    navigation: {
      isFetching: false,
      items: [validTOS],
    },
    user: {
      data: user,
    },
  });

  return renderWithProviders(<RouterProvider router={router} />, { history, store });
};

describe('<BulkCreateView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
