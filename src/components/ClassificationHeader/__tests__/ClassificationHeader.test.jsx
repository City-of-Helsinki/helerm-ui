import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import ClassificationHeader from '../ClassificationHeader';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <ClassificationHeader code='test' title='test' createTos={dummyFunction} />
    </BrowserRouter>,
  );
};

describe('<ClassificationHeader />', () => {
  it('renders without crashing', () => {
    renderComponent();
  });
});
