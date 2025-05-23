import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import storeCreator from '../../../store/createStore';
import ClassificationButton from '../ClassificationButton';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const store = storeCreator({});
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <ClassificationButton label='test' action={dummyFunction} />
    </BrowserRouter>,
    { store },
  );
};

describe('<ClassificationButton />', () => {
  it('renders without crashing', () => {
    renderComponent();

    const element = screen.getByRole('button', { name: /test/i });

    expect(element).toBeInTheDocument();
  });
});
