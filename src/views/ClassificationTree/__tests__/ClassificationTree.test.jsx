import { BrowserRouter } from 'react-router-dom';
import { waitFor } from '@testing-library/react';

import ClassificationTree from '../ClassificationTree';
import renderWithProviders, { storeDefaultState, createTestStore } from '../../../utils/renderWithProviders';
import { classification } from '../../../utils/__mocks__/mockHelpers';
import api from '../../../utils/api';

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
  const store = storeOverride ?? createTestStore(storeDefaultState);

  return renderWithProviders(
    <BrowserRouter>
      <ClassificationTree />
    </BrowserRouter>,
    { store },
  );
};

describe('<ClassificationTree />', () => {
  it('renders correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockClassificationApiGet).toHaveBeenCalled();
    });
  });

  it('fetches classifications', async () => {
    const store = createTestStore(storeDefaultState);

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
            items: expect.any(Array),
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
