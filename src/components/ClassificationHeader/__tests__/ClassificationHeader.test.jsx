import { createMemoryHistory } from 'history';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import storeCreator from '../../../store/createStore';
import ClassificationHeader from '../ClassificationHeader';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <ClassificationHeader code='test' title='test' createTos={dummyFunction} />
    </BrowserRouter>,
    { history, store },
  );
};

describe('<ClassificationHeader />', () => {
  it('renders without crashing', () => {
    renderComponent();

    const element = screen.getByRole('heading', { name: /test/i });
    expect(element).toBeInTheDocument();
  });
});
