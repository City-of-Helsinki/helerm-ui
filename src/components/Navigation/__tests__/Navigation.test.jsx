import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitFor } from '@testing-library/react';

import renderWithProviders, { storeDefaultState } from '../../../utils/renderWithProviders';
import Navigation from '../Navigation';
import api from '../../../utils/api';
import { classification } from '../../../utils/__mocks__/mockHelpers';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

const mockClassificationResponse = {
  count: classification.length,
  next: null,
  previous: null,
  results: classification,
};

const mockClassificationApiGet = vi
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true, json: () => mockClassificationResponse }));

vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('classification')) {
    return mockClassificationApiGet();
  }

  return Promise.resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
});

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? mockStore(storeDefaultState);

  return renderWithProviders(
    <BrowserRouter>
      <Navigation />
    </BrowserRouter>,
    { store },
  );
};

describe('<Navigation />', () => {
  it('renders correctly', async () => {
    renderComponent();
  });

  it('fetches navigation on mount', async () => {
    const store = mockStore(storeDefaultState);

    renderComponent(store);

    await waitFor(() =>
      expect(store.getActions()).toEqual([
        {
          type: 'navigation/fetchNavigation/pending',
          payload: undefined,
          meta: expect.anything(),
        },
        {
          type: 'navigation/receiveNavigation',
          payload: {
            includeRelated: false,
            items: classification,
            page: 1,
          },
        },
        {
          type: 'navigation/parseNavigation',
          payload: {
            items: [],
          },
        },
        {
          type: 'navigation/fetchNavigation/fulfilled',
          payload: {
            ...mockClassificationResponse,
          },
          meta: expect.anything(),
        },
      ]),
    );
  });
});
