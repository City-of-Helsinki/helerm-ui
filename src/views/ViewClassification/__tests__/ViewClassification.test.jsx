import { BrowserRouter } from 'react-router-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithProviders, { createTestStore } from '../../../utils/renderWithProviders';
import { classification } from '../../../utils/__mocks__/mockHelpers';
import api from '../../../utils/api';
import * as useAuth from '../../../hooks/useAuth';
import ViewClassification from '../ViewClassification';
import { initialState } from '../../../store/reducers/classification';

// Mock API to return the first classification item from our array
const mockApiGet = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: () => classification[0] }));
vi.spyOn(api, 'get').mockImplementation(mockApiGet);

vi.spyOn(useAuth, 'default').mockImplementation(() => ({
  getApiToken: vi.fn(() => 'mock-token'),
  isAuthenticated: true,
  user: { name: 'Test User' },
}));

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({
      id: 'test',
      version: 1,
    })),
  };
});

// Classification state with no existing function, so "Luo kuvaus" button is shown
const classificationWithoutFunction = {
  ...initialState,
  id: 'test-classification-001',
  code: '00 00 00',
  title: 'Testitehtäväluokka',
  version: 1,
  version_history: [{ version: 1, state: 'approved', modified_at: '2024-01-01T00:00:00Z', modified_by: 'Test User' }],
  function: null,
  function_allowed: true,
};

// User state with edit permission so IsAllowed renders the button
const userWithEditPermission = {
  data: { permissions: ['can_edit'] },
  isFetching: false,
  status: 'AUTHORIZED',
  error: null,
};

const renderComponent = (storeOverride) => {
  const store = storeOverride ?? createTestStore({ classification: { ...initialState } });

  return renderWithProviders(
    <BrowserRouter>
      <ViewClassification />
    </BrowserRouter>,
    { store },
  );
};

describe('<ViewClassification />', () => {
  it('renders correctly', async () => {
    const { store } = renderComponent();

    // Wait for the API call to be made and the store to be updated
    await waitFor(() => {
      const actions = store.getActions();
      expect(actions.some((action) => action.type === 'classification/fetchClassification/fulfilled')).toBe(true);
      expect(actions.some((action) => action.type === 'navigation/setNavigationVisibility')).toBe(true);
    });
  });

  it('fetches classification on mount', async () => {
    const store = createTestStore({ classification: { ...initialState } });

    renderComponent(store);

    const expectedActions = [
      {
        type: 'classification/fetchClassification/pending',
        meta: expect.anything(),
        payload: undefined,
      },
      {
        type: 'classification/fetchClassification/fulfilled',
        meta: expect.anything(),
        payload: { ...classification[0], error: null, isFetching: false },
      },
      {
        payload: false,
        type: 'navigation/setNavigationVisibility',
      },
    ];

    await waitFor(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('should handle fetch classification error', async () => {
    const mockApiGet = vi.fn().mockImplementationOnce(() => Promise.reject(new Error('FETCH ERROR')));
    vi.spyOn(api, 'get').mockImplementationOnce(mockApiGet);

    const store = createTestStore({ classification: { ...initialState } });

    renderComponent(store);

    const expectedActions = [
      {
        type: 'classification/fetchClassification/pending',
        meta: expect.anything(),
        payload: undefined,
      },
      {
        type: 'classification/fetchClassification/rejected',
        meta: expect.anything(),
        payload: 'FETCH ERROR',
        error: {
          message: 'Rejected',
        },
      },
    ];

    await waitFor(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('createTos notifications', () => {
    beforeEach(() => {
      // Return classification without an existing function so "Luo kuvaus" button is shown
      vi.spyOn(api, 'get').mockResolvedValue({
        ok: true,
        json: () => ({
          ...classificationWithoutFunction,
          error: null,
          isFetching: false,
        }),
      });
    });

    it('shows success notification after creating a TOS', async () => {
      const user = userEvent.setup();
      vi.spyOn(api, 'post').mockResolvedValueOnce({
        ok: true,
        json: () => ({ id: 'new-tos-001', version: 1 }),
      });

      const store = createTestStore({
        classification: classificationWithoutFunction,
        user: userWithEditPermission,
      });

      renderComponent(store);

      await user.click(await screen.findByText('Luo kuvaus'));

      expect(await screen.findByRole('alert', { name: 'Luonnos' })).toBeInTheDocument();
    });

    it('shows error notification when creating a TOS fails', async () => {
      const user = userEvent.setup();
      vi.spyOn(api, 'post').mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const store = createTestStore({
        classification: classificationWithoutFunction,
        user: userWithEditPermission,
      });

      renderComponent(store);

      await user.click(await screen.findByText('Luo kuvaus'));

      expect(await screen.findByRole('alert', { name: 'Virhe' })).toBeInTheDocument();
    });
  });
});
