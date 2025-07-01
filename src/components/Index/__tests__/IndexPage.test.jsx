import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import renderWithProviders from '../../../utils/renderWithProviders';
import IndexPage from '../IndexPage';
import { setNavigationVisibility } from '../../../store/reducers/navigation';

// Mock the navigation reducer
vi.mock('../../../store/reducers/navigation', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    setNavigationVisibility: vi.fn(() => ({
      type: 'navigation/setNavigationVisibility',
      payload: true,
    })),
  };
});

const renderComponent = (preloadedState = {}) => {
  const history = createBrowserHistory();

  return renderWithProviders(
    <BrowserRouter history={history}>
      <IndexPage />
    </BrowserRouter>,
    { history, preloadedState },
  );
};

describe('<IndexPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing and dispatches setNavigationVisibility', () => {
    const { container } = renderComponent();

    // Verify component renders
    expect(container).toBeInTheDocument();

    // Verify it dispatches the correct action
    expect(setNavigationVisibility).toHaveBeenCalledWith(true);
  });
});
