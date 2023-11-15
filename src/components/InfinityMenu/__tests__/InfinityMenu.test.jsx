import { createBrowserHistory } from 'history';
import React from 'react';
import { Router } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import attributeRules from '../../../utils/mocks/attributeRules.json';
import validTOSwithChildren from '../../../utils/mocks/validTOSwithChildren.json';
import InfinityMenu from '../InfinityMenu';
import EmptyTree from '../EmptyTree';
import { navigationStateFilters, statusFilters } from '../../../constants';
import renderWithProviders from '../../../utils/renderWithProviders';

const baseMocks = {
  isDetailSearch: false,
  onNodeMouseClick: jest.fn(),
  filters: navigationStateFilters,
  filter: jest.fn(),
};

const renderComponent = (history, mocks = baseMocks) =>
  renderWithProviders(
    <Router history={history}>
      <InfinityMenu
        addSearchInput={jest.fn()}
        attributeTypes={attributeRules}
        customComponentMappings={{}}
        emptyTreeComponent={EmptyTree}
        emptyTreeComponentProps={{}}
        filter={mocks.filter}
        headerProps={{}}
        isDetailSearch={mocks.isDetailSearch}
        isFetching={false}
        isOpen
        isSearchChanged={false}
        isSearching={false}
        isUser
        items={[]}
        maxLeaves={Infinity}
        onLeafMouseClick={jest.fn()}
        onLeafMouseDown={jest.fn()}
        onLeafMouseUp={jest.fn()}
        onNodeMouseClick={mocks.onNodeMouseClick}
        path={[]}
        removeSearchInput={jest.fn()}
        searchInputs={['']}
        setSearchInput={jest.fn()}
        toggleNavigationVisibility={jest.fn()}
        tree={[]}
        filters={baseMocks.filters}
        handleFilterChange={jest.fn()}
      />
    </Router>,
    { history, preloadedState: { navigation: { items: [validTOSwithChildren] } } },
  );

describe('<InfinityMenu />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    const { container } = renderComponent(history);

    expect(container).toMatchSnapshot();
  });

  it('should filter tree by searchInputs', async () => {
    const mockOnNodeMouseClick = jest.fn();
    const mockFilter = jest.fn();

    const mocks = { ...baseMocks, onNodeMouseClick: mockOnNodeMouseClick, filter: mockFilter };

    const history = createBrowserHistory();

    const { rerender } = renderComponent(history, mocks);

    rerender(
      <Router history={history}>
        <InfinityMenu
          addSearchInput={jest.fn()}
          attributeTypes={attributeRules}
          customComponentMappings={{}}
          emptyTreeComponent={EmptyTree}
          emptyTreeComponentProps={{}}
          filter={mocks.filter}
          headerProps={{}}
          isDetailSearch={mocks.isDetailSearch}
          isFetching={false}
          isOpen
          isSearchChanged
          isSearching={false}
          isUser
          items={[validTOSwithChildren]}
          maxLeaves={Infinity}
          onLeafMouseClick={jest.fn()}
          onLeafMouseDown={jest.fn()}
          onLeafMouseUp={jest.fn()}
          onNodeMouseClick={mocks.onNodeMouseClick}
          path={[]}
          removeSearchInput={jest.fn()}
          searchInputs={['Terveys']}
          setSearchInput={jest.fn()}
          toggleNavigationVisibility={jest.fn()}
          tree={[validTOSwithChildren]}
          filters={mocks.filters}
          handleFilterChange={jest.fn()}
        />
        ,
      </Router>,
    );

    expect(mockFilter).toHaveBeenCalled();
  });

  it('should filter tree by searchFilters', async () => {
    const mockOnNodeMouseClick = jest.fn();

    const mocks = {
      ...baseMocks,
      onNodeMouseClick: mockOnNodeMouseClick,
      filters: {
        ...baseMocks.filters,
        statusFilters: { ...baseMocks.filters.statusFilters, values: [statusFilters[3].value] },
      },
    };

    const history = createBrowserHistory();

    const { rerender } = renderComponent(history, mocks);

    rerender(
      <Router history={history}>
        <InfinityMenu
          addSearchInput={jest.fn()}
          attributeTypes={attributeRules}
          customComponentMappings={{}}
          emptyTreeComponent={EmptyTree}
          emptyTreeComponentProps={{}}
          filter={jest.fn()}
          headerProps={{}}
          isDetailSearch={mocks.isDetailSearch}
          isFetching={false}
          isOpen
          isSearchChanged={false}
          isSearching={false}
          isUser
          items={[validTOSwithChildren]}
          maxLeaves={Infinity}
          onLeafMouseClick={jest.fn()}
          onLeafMouseDown={jest.fn()}
          onLeafMouseUp={jest.fn()}
          onNodeMouseClick={mocks.onNodeMouseClick}
          path={[]}
          removeSearchInput={jest.fn()}
          searchInputs={['']}
          setSearchInput={jest.fn()}
          toggleNavigationVisibility={jest.fn()}
          tree={[validTOSwithChildren]}
          filters={mocks.filters}
          handleFilterChange={jest.fn()}
        />
        ,
      </Router>,
    );

    const infinityMenuItem = screen.getByRole('button', { name: '00 Hallintoasiat' });

    expect(infinityMenuItem).toBeInTheDocument();

    const user = userEvent.setup();

    await user.click(infinityMenuItem);

    expect(mockOnNodeMouseClick).toHaveBeenCalled();
  });
});
