import { createMemoryHistory } from 'history';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import storeCreator from '../../../store/createStore';
import ClassificationButton from '../ClassificationButton';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter history={history}>
      <ClassificationButton label='test' action={dummyFunction} />
    </BrowserRouter>,
    { history, store },
  );
};

describe('<ClassificationButton />', () => {
  it('renders without crashing', () => {
    renderComponent();

    const element = screen.getByRole('button', { name: /test/i });

    expect(element).toBeInTheDocument();
  });
});
