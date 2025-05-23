import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import ViewTos from '../ViewTos';
import renderWithProviders from '../../../../utils/renderWithProviders';
import attributeRules from '../../../../utils/mocks/attributeRules.json';
import classification from '../../../../utils/mocks/classification.json';
import validTOS from '../../../../utils/mocks/validTOS.json';
import user from '../../../../utils/mocks/user.json';
import api from '../../../../utils/api';

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

const mockTosApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => validTOS }));
const mockClassificationApiGet = vi
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true, json: () => classification }));

vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('classification')) {
    return mockClassificationApiGet();
  }

  return mockTosApiGet();
});

const defaultState = {
  ui: {
    actionTypes: {},
    attributeTypes: attributeRules,
    isFetching: false,
    phaseTypes: {},
    recordTypes: {},
    templates: [],
  },
  classification,
  navigation: {
    items: [validTOS],
  },
  selectedTOS: {
    ...validTOS,
    documentState: 'view',
    isFetching: false,
    is_open: true,
    is_classification_open: true,
    classification,
  },
  validation: {
    is_open: false,
  },
  user: {
    data: user,
  },
};

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? mockStore(defaultState);

  const router = createBrowserRouter([{ path: '/', element: <ViewTos /> }]);

  return renderWithProviders(<RouterProvider router={router} />, { store });
};

describe('<ViewTos />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('should fetch TOS and classification data', async () => {
    const store = mockStore(defaultState);

    renderComponent(store);

    await waitFor(() => {
      const actions = store.getActions();

      const tosPendingAction = actions.find((action) => action.type === 'selectedTOS/fetchTOS/pending');
      const tosFulfilledAction = actions.find((action) => action.type === 'selectedTOS/fetchTOS/fulfilled');

      expect(tosPendingAction).toBeTruthy();
      expect(tosFulfilledAction).toBeTruthy();
      expect(tosFulfilledAction.payload).toEqual({ ...validTOS });

      const classificationPendingAction = actions.find(
        (action) => action.type === 'classification/fetchClassification/pending',
      );
      const classificationFulfilledAction = actions.find(
        (action) => action.type === 'classification/fetchClassification/fulfilled',
      );

      expect(classificationPendingAction).toBeTruthy();
      expect(classificationFulfilledAction).toBeTruthy();

      expect(mockTosApiGet).toHaveBeenCalled();
      expect(mockClassificationApiGet).toHaveBeenCalled();
    });
  });

  it('handles scroll event', async () => {
    renderComponent();

    fireEvent.scroll(window, { target: { scrollY: 100 } });

    expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
  });

  it('should handle fetch TOS error', async () => {
    mockTosApiGet.mockReset().mockImplementation(() => Promise.reject(new Error('Fetch error')));

    const store = mockStore(defaultState);
    renderComponent(store);

    await waitFor(() => {
      const actions = store.getActions();

      const pendingAction = actions.find((action) => action.type === 'selectedTOS/fetchTOS/pending');
      const rejectedAction = actions.find((action) => action.type === 'selectedTOS/fetchTOS/rejected');

      expect(pendingAction).toBeTruthy();
      expect(rejectedAction).toBeTruthy();
      expect(rejectedAction.error.message).toBe('Rejected');
    });

    mockTosApiGet.mockImplementation(() => Promise.resolve({ ok: true, json: () => validTOS }));
  });
});
