import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';

import CookieManagement from '../CookieManagement';
import renderWithProviders from '../../../utils/renderWithProviders';
import MatomoTracker from '../../../components/Matomo/MatomoTracker';
import MatomoContext from '../../../components/Matomo/matomo-context';

const renderComponent = () => {
  const history = createBrowserHistory();
  const mockMatomoTracker = new MatomoTracker({
    urlBase: 'https://www.test.fi/',
    siteId: 'test123',
    srcUrl: 'test.js',
    enabled: false,
  });

  return renderWithProviders(
    <MatomoContext.Provider value={mockMatomoTracker}>
      <BrowserRouter>
        <CookieManagement />
      </BrowserRouter>
    </MatomoContext.Provider>,
    { history },
  );
};

describe('<CookieManagement />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
