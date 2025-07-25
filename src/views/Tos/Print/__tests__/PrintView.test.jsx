import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import PrintView from '../PrintView';
import renderWithProviders from '../../../../utils/renderWithProviders';
import classification from '../../../../utils/mocks/api/classification.json';
import validTOS from '../../../../utils/mocks/validTOS.json';
import attributeTypes from '../../../../utils/mocks/attributeTypes.json';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useParams: () => ({
      id: 'test',
      version: '1',
    }),
  };
});

const renderComponent = (propOverrides) => {
  const history = createBrowserHistory();

  const store = mockStore({
    ui: {
      attributeTypes: attributeTypes,
    },
    navigation: {
      items: [validTOS],
    },
    selectedTOS: {
      ...validTOS,
      classification: classification[0],
    },
  });

  const props = {
    fetchTOS: vi.fn().mockImplementation(() => Promise.resolve(validTOS)),
    setNavigationVisibility: vi.fn(),
    ...propOverrides,
  };

  return renderWithProviders(
    <BrowserRouter>
      <PrintView {...props} />
    </BrowserRouter>,
    { history, store },
  );
};

describe('<PrintView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
