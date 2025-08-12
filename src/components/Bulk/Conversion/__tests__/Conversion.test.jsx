import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Conversion from '../Conversion';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <Conversion disabled={false} onConvert={dummyFunction} attributeTypes={{}} />
    </BrowserRouter>,
  );
};

describe('<Conversion />', () => {
  it('renders without crashing', () => {
    renderComponent();
  });
});
