import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import BulkListView from '../BulkListView';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  return renderWithProviders(
    <BrowserRouter>
      <BulkListView />
    </BrowserRouter>,
  );
};

describe('<BulkListView />', () => {
  it('renders correctly', () => {
    renderComponent();
  });
});
