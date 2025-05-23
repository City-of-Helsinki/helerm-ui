import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import storeCreator from '../../../../store/createStore';
import SearchTerms from '../SearchTerms';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const store = storeCreator({});
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <SearchTerms attributeValues={{}} onSearch={dummyFunction} resetSearchResults={dummyFunction} searchTerms={[]} />
    </BrowserRouter>,
    { store },
  );
};

describe('<SearchTerms />', () => {
  it('renders without crashing', () => {
    renderComponent();

    expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
  });
});
