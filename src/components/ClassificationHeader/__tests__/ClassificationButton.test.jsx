import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import ClassificationButton from '../ClassificationButton';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <ClassificationButton label='test' action={dummyFunction} />
    </BrowserRouter>,
  );
};

describe('<ClassificationButton />', () => {
  it('renders without crashing', () => {
    renderComponent();
  });
});
