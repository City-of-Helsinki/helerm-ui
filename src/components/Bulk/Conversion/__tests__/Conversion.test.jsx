import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import storeCreator from '../../../../store/createStore';
import Conversion from '../Conversion';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const store = storeCreator({});
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <Conversion disabled={false} onConvert={dummyFunction} attributeTypes={{}} />
    </BrowserRouter>,
    { store },
  );
};

describe('<Conversion />', () => {
  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByText('Kohdistus')).toBeInTheDocument();
  });
});
