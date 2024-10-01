import { createMemoryHistory } from 'history';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import storeCreator from '../../../../store/createStore';
import SearchTerm from '../SearchTerm';
import renderWithProviders from '../../../../utils/renderWithProviders';

const renderComponent = () => {
  const history = createMemoryHistory();
  const store = storeCreator(history, {});
  const dummyFunction = vi.fn();

  return renderWithProviders(
    <BrowserRouter>
      <SearchTerm
        attributeValues={{}}
        onAddSearchTerm={dummyFunction}
        onChangeSearchTerm={dummyFunction}
        onRemoveSearchTerm={dummyFunction}
        searchTerm={{
          attribute: 'test',
          equals: false,
          target: 'test',
          value: 'test',
        }}
        showAdd={false}
      />
    </BrowserRouter>,
    { history, store },
  );
};

describe('<SearchTerm />', () => {
  it('renders without crashing', () => {
    const { getByText } = renderComponent();

    const element = getByText('test');

    expect(element).toBeInTheDocument();
  });
});
