import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import SearchTerms from '../SearchTerms';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <SearchTerms attributeValues={{}} onSearch={dummyFunction} resetSearchResults={dummyFunction} searchTerms={[]} />
    </BrowserRouter>,
  );
};

describe('<SearchTerms />', () => {
  it('renders without crashing', () => {
    renderComponent();
  });
});
