import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FacetedSearch from '../FacetedSearch';
import renderWithProviders, { storeDefaultState } from '../../../utils/renderWithProviders';
import api from '../../../utils/api';
import { classification, attributeTypes, template } from '../../../utils/__mocks__/mockHelpers';
import { TYPE_CLASSIFICATION, TYPE_FUNCTION } from '../../../constants';

const mockClassificationResponse = {
  count: classification.length,
  next: null,
  previous: null,
  results: classification,
};

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

vi.spyOn(api, 'get').mockImplementation((url) => {
  if (url.includes('classification')) {
    return Promise.resolve({
      ok: true,
      json: () => mockClassificationResponse,
    });
  }
  if (url.includes('attribute/schemas')) {
    return Promise.resolve({
      ok: true,
      json: () => attributeTypes,
    });
  }
  if (url.includes('attribute') && !url.includes('schemas')) {
    return Promise.resolve({
      ok: true,
      json: () => ({ results: [] }),
    });
  }
  if (url.includes('templates')) {
    return Promise.resolve({
      ok: true,
      json: () => template,
    });
  }
  return Promise.resolve({ ok: true, json: () => ({}) });
});

const createMockData = () => {
  const mockSearchResults = classification.slice(0, 2).map((item) => ({
    id: item.id,
    type: TYPE_CLASSIFICATION,
    title: item.title,
    name: item.title,
    code: item.code,
    path: ['Root', 'Parent', item.title],
    attributes: {
      name: item.title,
      description: item.description || '',
      additional_information: item.additional_information || '',
    },
  }));

  const mockSuggestions = [
    {
      type: TYPE_CLASSIFICATION,
      count: classification.length,
      label: 'Tehtäväluokka',
    },
    {
      type: TYPE_FUNCTION,
      count: 3,
      label: 'Toiminto',
    },
  ];

  const retentionPeriodAttribute = {
    key: 'RetentionPeriod',
    name: 'Säilytysaika',
    type: TYPE_CLASSIFICATION,
    options: [
      { value: '-1', count: 1, hits: ['item1'] },
      { value: '5', count: 2, hits: ['item2', 'item3'] },
      { value: '10', count: 1, hits: ['item4'] },
    ],
    open: true,
    showAll: false,
  };

  const mockFilteredAttributes = {
    [TYPE_CLASSIFICATION]: [retentionPeriodAttribute],
  };

  const mockMetadata = {
    name: { name: 'Nimi' },
    description: { name: 'Kuvaus' },
    additional_information: { name: 'Lisätiedot' },
    RetentionPeriod: {
      name: 'Säilytysaika',
      values: [
        { value: '-1', name: 'Pysyvästi' },
        { value: '5', name: '5 vuotta' },
        { value: '10', name: '10 vuotta' },
      ],
    },
  };

  return {
    searchResults: mockSearchResults,
    suggestions: mockSuggestions,
    filteredAttributes: mockFilteredAttributes,
    metadata: mockMetadata,
    retentionPeriodAttribute,
  };
};

const mockData = createMockData();

const renderComponent = (initialState = {}) => {
  const state = {
    search: {
      ...storeDefaultState.search,
      ...initialState,
    },
    ui: {
      ...storeDefaultState.ui,
    },
  };

  const store = mockStore(state);
  const user = userEvent.setup();

  const component = renderWithProviders(
    <BrowserRouter>
      <FacetedSearch />
    </BrowserRouter>,
    { store },
  );

  return { ...component, user, store };
};

describe('<FacetedSearch />', () => {
  it('renders correctly', () => {
    renderComponent();
  });

  it('performs search when submitting the form', async () => {
    const searchTerm = 'Terv';

    const { user, store } = renderComponent();

    const searchInput = screen.getByPlaceholderText(/Vapaasanahaku/i);
    await user.type(searchInput, searchTerm);

    const searchButton = screen.getByRole('button', { name: /Hae/i });
    await user.click(searchButton);

    const searchAction = store.getActions().find((action) => action.type === 'search/searchItems/pending');

    expect(searchAction).toBeTruthy();
  });

  it('submits search when pressing enter in search field', async () => {
    const { user, store } = renderComponent();

    const searchInput = screen.getByPlaceholderText(/Vapaasanahaku/i);
    await user.type(searchInput, 'test{enter}');

    const searchAction = store.getActions().find((action) => action.type === 'search/searchItems/pending');
    expect(searchAction).toBeTruthy();
  });

  it('shows suggestions when typing in the search field', async () => {
    const { user } = renderComponent({
      suggestions: mockData.suggestions,
    });

    const searchInput = screen.getByPlaceholderText(/Vapaasanahaku/i);
    await user.type(searchInput, 'test');

    expect(screen.getByText('Rajaukset')).toBeInTheDocument();

    const suggestions = document.querySelectorAll('.faceted-search-suggestion');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('does not show suggestions for short search terms', async () => {
    const { user } = renderComponent();

    const searchInput = screen.getByPlaceholderText(/Vapaasanahaku/i);
    await user.type(searchInput, 't');

    const suggestions = document.querySelector('.faceted-search-suggestions.show');
    expect(suggestions).toBeFalsy();
  });

  it('displays search results and handles click interactions', async () => {
    const { user } = renderComponent({
      items: mockData.searchResults,
      metadata: mockData.metadata,
    });

    expect(screen.getByText(`Hakutulokset (${mockData.searchResults.length})`)).toBeInTheDocument();

    const resultItems = screen.getAllByText('Tehtäväluokka');
    expect(resultItems.length).toBe(mockData.searchResults.length);

    const resultItem = resultItems[0].closest('.faceted-search-results-item');
    await user.click(resultItem);

    expect(document.querySelector('.faceted-search-preview')).toBeInTheDocument();
    expect(document.querySelector('.faceted-search-preview-sticky')).toBeInTheDocument();
  });

  it('renders facet options correctly with filteredAttributes', () => {
    const { store } = renderComponent({
      filteredAttributes: mockData.filteredAttributes,
      metadata: mockData.metadata,
    });

    expect(screen.getByText(/Tehtäväluokka/)).toBeInTheDocument();

    const state = store.getState();
    expect(state.search.filteredAttributes).toEqual(mockData.filteredAttributes);
  });

  it('resets the search when reset button is clicked', async () => {
    const { user, store } = renderComponent({
      items: mockData.searchResults,
      searchTerm: 'test',
      selectedFacets: {
        classification: [{ key: 'RetentionPeriod', value: '-1', name: 'Säilytysaika', type: TYPE_CLASSIFICATION }],
        function: [],
        phase: [],
        action: [],
        record: [],
      },
      terms: ['test'],
    });

    const resetButton = screen.getByText('Poista rajaukset');
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);

    const actions = store.getActions();

    expect(actions).toContainEqual(
      expect.objectContaining({
        type: 'search/searchItems/pending',
      }),
    );

    const searchAction = actions.find((action) => action.type === 'search/searchItems/pending');

    expect(searchAction.meta.arg.searchTerm).toBe('');
  });

  it('handles empty results and loading state correctly', () => {
    const { unmount } = renderComponent({
      items: [],
      isFetching: false,
    });
    expect(screen.getByText('Hakutulokset (0)')).toBeInTheDocument();

    unmount();

    renderComponent({
      isFetching: true,
    });

    expect(document.querySelector('.faceted-search-loader')).toBeInTheDocument();
    expect(document.querySelector('.fa-spinner.fa-spin')).toBeInTheDocument();
  });

  it('handles preview item initialization and search with terms', () => {
    renderComponent({
      items: mockData.searchResults,
      filteredAttributes: mockData.filteredAttributes,
      terms: ['Test Search'],
      metadata: mockData.metadata,
      previewItem: {
        ...mockData.searchResults[0],
        attributes: {
          name: 'Test Item',
          description: 'Test description',
        },
        id: 'test-id',
        type: TYPE_CLASSIFICATION,
        path: ['Root', 'Parent', 'Test'],
      },
    });

    expect(screen.getByText('Hakutulokset (2)')).toBeInTheDocument();
    expect(document.querySelector('.faceted-search-results')).toBeInTheDocument();
    expect(document.querySelector('.faceted-search-preview')).toBeInTheDocument();
  });

  it('handles facet interactions and suggestions', async () => {
    const { user } = renderComponent({
      filteredAttributes: mockData.filteredAttributes,
      suggestions: mockData.suggestions,
      facetsOpen: [TYPE_CLASSIFICATION],
      metadata: mockData.metadata,
    });

    const facetTitle = document.querySelector('.faceted-search-facets-item-title');
    const facetButton = facetTitle.querySelector('button');

    const iconInitial = facetButton.querySelector('i');
    expect(iconInitial).toHaveClass('fa-angle-down');

    await user.click(facetButton);
    expect(facetButton.querySelector('i')).toHaveClass('fa-angle-up');

    const searchInput = screen.getByPlaceholderText(/Vapaasanahaku/i);
    await user.type(searchInput, 'test');

    expect(screen.getByText('Rajaukset')).toBeInTheDocument();
    const suggestions = document.querySelectorAll('.faceted-search-suggestion');
    expect(suggestions.length).toBeGreaterThan(0);

    await user.click(suggestions[0]);
    expect(suggestions[0]).toBeInTheDocument();
  });
});
