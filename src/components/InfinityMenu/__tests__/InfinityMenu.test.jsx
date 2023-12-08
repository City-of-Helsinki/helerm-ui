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
  onNodeMouseClick: vi.fn(),
  filters: navigationStateFilters,
  filter: vi.fn(),
};

const renderComponent = (history, mocks = baseMocks) =>
  renderWithProviders(
    <Router history={history}>
      <InfinityMenu
        addSearchInput={vi.fn()}
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
        onLeafMouseClick={vi.fn()}
        onLeafMouseDown={vi.fn()}
        onLeafMouseUp={vi.fn()}
        onNodeMouseClick={mocks.onNodeMouseClick}
        path={[]}
        removeSearchInput={vi.fn()}
        searchInputs={['']}
        setSearchInput={vi.fn()}
        toggleNavigationVisibility={vi.fn()}
        tree={[]}
        filters={baseMocks.filters}
        handleFilterChange={vi.fn()}
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
    const mockOnNodeMouseClick = vi.fn();
    const mockFilter = vi.fn();

    const mocks = { ...baseMocks, onNodeMouseClick: mockOnNodeMouseClick, filter: mockFilter };

    const history = createBrowserHistory();

    const { rerender } = renderComponent(history, mocks);

    rerender(
      <Router history={history}>
        <InfinityMenu
          addSearchInput={vi.fn()}
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
          onLeafMouseClick={vi.fn()}
          onLeafMouseDown={vi.fn()}
          onLeafMouseUp={vi.fn()}
          onNodeMouseClick={mocks.onNodeMouseClick}
          path={[]}
          removeSearchInput={vi.fn()}
          searchInputs={['Terveys']}
          setSearchInput={vi.fn()}
          toggleNavigationVisibility={vi.fn()}
          tree={[validTOSwithChildren]}
          filters={mocks.filters}
          handleFilterChange={vi.fn()}
        />
        ,
      </Router>,
    );

    expect(mockFilter).toHaveBeenCalled();
  });

  it('should filter tree by searchFilters', async () => {
    const mockOnNodeMouseClick = vi.fn();

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
          addSearchInput={vi.fn()}
          attributeTypes={attributeRules}
          customComponentMappings={{}}
          emptyTreeComponent={EmptyTree}
          emptyTreeComponentProps={{}}
          filter={vi.fn()}
          headerProps={{}}
          isDetailSearch={mocks.isDetailSearch}
          isFetching={false}
          isOpen
          isSearchChanged={false}
          isSearching={false}
          isUser
          items={[validTOSwithChildren]}
          maxLeaves={Infinity}
          onLeafMouseClick={vi.fn()}
          onLeafMouseDown={vi.fn()}
          onLeafMouseUp={vi.fn()}
          onNodeMouseClick={mocks.onNodeMouseClick}
          path={[]}
          removeSearchInput={vi.fn()}
          searchInputs={['']}
          setSearchInput={vi.fn()}
          toggleNavigationVisibility={vi.fn()}
          tree={[validTOSwithChildren]}
          filters={mocks.filters}
          handleFilterChange={vi.fn()}
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
