import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchResults from '../SearchResults';
import renderWithProviders from '../../../../utils/renderWithProviders';

describe('<SearchResults />', () => {
  const mockOnSelect = vi.fn();
  const mockOnSelectAll = vi.fn();

  const defaultHits = {
    phases: 5,
    actions: 3,
    records: 10,
  };

  const createMockSearchResult = (overrides = {}, index = 0) => {
    const baseItem = {
      function: `func-${index}-123`,
      function_state: 'draft',
      path: ['Parent', 'Child', 'Function'],
      name: 'Test Function Name',
    };

    return {
      selected: false,
      item: {
        ...baseItem,
        ...overrides.item,
      },
      paths: ['PersonalData: Sisältää henkilötietoja', 'RetentionPeriod: 10', ...(overrides.paths || [])],
      ...overrides,
    };
  };

  const defaultProps = {
    onSelect: mockOnSelect,
    onSelectAll: mockOnSelectAll,
    searchResults: [],
    hits: defaultHits,
  };

  const renderComponent = (props = defaultProps) => {
    return renderWithProviders(
      <BrowserRouter>
        <SearchResults {...props} />
      </BrowserRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Hakutulos:')).toBeInTheDocument();
  });

  describe('Header Display', () => {
    it('displays search result header with counts', () => {
      const searchResults = [createMockSearchResult({}, 0), createMockSearchResult({}, 1)];
      renderComponent({ ...defaultProps, searchResults });

      expect(screen.getByText('Hakutulos:')).toBeInTheDocument();
      expect(screen.getByText('Käsittelyprosessin kuvaus: 2')).toBeInTheDocument();
      expect(screen.getByText('Käsittelyvaihe: 5')).toBeInTheDocument();
      expect(screen.getByText('Toimenpide: 3')).toBeInTheDocument();
      expect(screen.getByText('Asiakirja: 10')).toBeInTheDocument();
    });

    it('hides zero hit counts from display', () => {
      const hitsWithZeros = { phases: 0, actions: 0, records: 5 };
      renderComponent({ ...defaultProps, hits: hitsWithZeros });

      expect(screen.queryByText('Käsittelyvaihe: 0')).not.toBeInTheDocument();
      expect(screen.queryByText('Toimenpide: 0')).not.toBeInTheDocument();
      expect(screen.getByText('Asiakirja: 5')).toBeInTheDocument();
    });
  });

  describe('Function State Management', () => {
    it('displays state counts and labels correctly for different states', () => {
      const searchResults = [
        createMockSearchResult({ item: { function_state: 'draft', name: 'Draft Function' } }, 0),
        createMockSearchResult({ item: { function_state: 'sent_for_review', name: 'Review Function' } }, 1),
        createMockSearchResult({ item: { function_state: 'waiting_for_approval', name: 'Waiting Function' } }, 2),
        createMockSearchResult({ item: { function_state: 'approved', name: 'Approved Function' } }, 3),
      ];

      renderComponent({ ...defaultProps, searchResults });

      // Verify state counts in header
      expect(screen.getByText('Luonnoksia: 1')).toBeInTheDocument();
      expect(screen.getByText('Tarkastettavana: 1')).toBeInTheDocument();
      expect(screen.getByText('Hyväksyttävänä: 1')).toBeInTheDocument();
      expect(screen.getByText('Hyväksyttyjä: 1')).toBeInTheDocument();

      // Verify individual status labels
      expect(screen.getByText('Luonnos')).toBeInTheDocument();
      expect(screen.getByText('Tarkastettavana')).toBeInTheDocument();
      expect(screen.getByText('Hyväksyttävänä')).toBeInTheDocument();
      expect(screen.getByText('Hyväksytty')).toBeInTheDocument();
    });

    it('hides zero state counts and handles missing states', () => {
      const searchResults = [
        createMockSearchResult({ item: { function_state: 'draft' } }, 0),
        createMockSearchResult({ item: { function_state: 'draft' } }, 1),
        createMockSearchResult({ item: { path: ['Root'], name: 'No State Function' } }, 2), // No function_state
      ];

      renderComponent({ ...defaultProps, searchResults });

      expect(screen.getByText('Luonnoksia: 2')).toBeInTheDocument();
      expect(screen.queryByText('Tarkastettavana:')).not.toBeInTheDocument();
      expect(screen.queryByText('Hyväksyttävänä:')).not.toBeInTheDocument();
      expect(screen.queryByText('Hyväksyttyjä:')).not.toBeInTheDocument();
    });

    it('handles unknown status gracefully', () => {
      const searchResults = [
        createMockSearchResult({ item: { function_state: 'unknown_status', name: 'Unknown Function' } }, 0),
      ];

      renderComponent({ ...defaultProps, searchResults });

      // Should not crash, getStatusLabel should handle unknown status
      expect(screen.getByText('Unknown Function')).toBeInTheDocument();
    });
  });

  describe('Selection Management', () => {
    it('manages select all state and interactions', async () => {
      const user = userEvent.setup();

      // Test unchecked state when no items selected
      const unselectedResults = [
        createMockSearchResult({ selected: false }, 0),
        createMockSearchResult({ selected: false }, 1),
      ];

      const { rerender } = renderComponent({ ...defaultProps, searchResults: unselectedResults });

      let searchResultHeader = screen.getByText('Hakutulos:').closest('.search-result-header');
      let selectAllCheckbox = searchResultHeader.querySelector('.search-result-item-check');
      expect(selectAllCheckbox).not.toHaveClass('search-result-item-checked');

      // Test click interaction
      await user.click(selectAllCheckbox);
      expect(mockOnSelectAll).toHaveBeenCalledWith(true);

      // Test checked state when all items selected
      const selectedResults = [
        createMockSearchResult({ selected: true }, 0),
        createMockSearchResult({ selected: true }, 1),
      ];

      rerender(
        <BrowserRouter>
          <SearchResults {...defaultProps} searchResults={selectedResults} />
        </BrowserRouter>,
      );

      searchResultHeader = screen.getByText('Hakutulos:').closest('.search-result-header');
      selectAllCheckbox = searchResultHeader.querySelector('.search-result-item-check');
      expect(selectAllCheckbox).toHaveClass('search-result-item-checked');

      // Test keyboard interaction
      await user.type(selectAllCheckbox, '{Enter}');
      expect(mockOnSelectAll).toHaveBeenCalledWith(false);
    });

    it('handles individual item selection and visual state', async () => {
      const user = userEvent.setup();
      const searchResults = [
        createMockSearchResult({ selected: true }, 0),
        createMockSearchResult({ selected: false, item: { name: 'Second Function' } }, 1),
      ];

      renderComponent({ ...defaultProps, searchResults });

      // Verify visual selection states
      const firstItem = screen.getByText('Test Function Name').closest('.search-result-item');
      const secondItem = screen.getByText('Second Function').closest('.search-result-item');

      const firstCheckbox = firstItem.querySelector('.search-result-item-check');
      const secondCheckbox = secondItem.querySelector('.search-result-item-check');

      expect(firstCheckbox).toHaveClass('search-result-item-checked');
      expect(secondCheckbox).not.toHaveClass('search-result-item-checked');

      // Test click interaction
      await user.click(secondCheckbox);
      expect(mockOnSelect).toHaveBeenCalledWith(1, true);

      // Test keyboard interaction
      await user.type(firstCheckbox, '{Enter}');
      expect(mockOnSelect).toHaveBeenCalledWith(0, false);
    });
  });

  describe('Content Display and Processing', () => {
    it('displays search result items with all content elements', () => {
      const searchResults = [
        createMockSearchResult({
          item: {
            function: 'func-123',
            function_state: 'draft',
            path: ['Root', 'Category', 'Function Name'],
            name: 'Test Function Display Name',
          },
          paths: ['PersonalData: Sisältää henkilötietoja', 'RetentionPeriod: 10'],
        }),
      ];

      renderComponent({ ...defaultProps, searchResults });

      expect(screen.getByText('Root > Category > Function Name')).toBeInTheDocument();
      expect(screen.getByText('Test Function Display Name')).toBeInTheDocument();
      expect(screen.getByText('PersonalData: Sisältää henkilötietoja')).toBeInTheDocument();
      expect(screen.getByText('RetentionPeriod: 10')).toBeInTheDocument();
      expect(screen.getByText('Luonnos')).toBeInTheDocument(); // Status label
    });
    it('processes and displays attribute paths with various formats', () => {
      const searchResults = [
        createMockSearchResult({
          paths: [
            'PersonalData: Sisältää henkilötietoja',
            'PublicityClass: Julkinen',
            'InformationSystem: Ahjo, Tietojärjestelmä, Another System',
            'Custom Path Without Mapping',
          ],
        }),
      ];

      renderComponent({ ...defaultProps, searchResults });

      expect(screen.getByText(/PersonalData:/)).toBeInTheDocument();
      expect(screen.getByText(/PublicityClass:/)).toBeInTheDocument();
      expect(screen.getByText(/InformationSystem:/)).toBeInTheDocument();
      expect(screen.getByText('Custom Path Without Mapping')).toBeInTheDocument();
    });

    it('handles empty paths gracefully', () => {
      const searchResults = [createMockSearchResult({ paths: [] })];

      renderComponent({ ...defaultProps, searchResults });

      expect(screen.getByText('Test Function Name')).toBeInTheDocument();
      // Should not crash with empty paths
    });
  });

  describe('Edge Cases and Component Structure', () => {
    it('renders correctly with empty search results and handles missing data', () => {
      renderComponent({ ...defaultProps, searchResults: [] });

      expect(screen.getByText('Hakutulos:')).toBeInTheDocument();
      expect(screen.getByText('Käsittelyprosessin kuvaus: 0')).toBeInTheDocument();
    });

    it('handles missing hits data and incomplete item properties', () => {
      const searchResults = [
        {
          selected: false,
          item: {
            function: 'func-incomplete',
            path: ['Root'], // Has path but minimal properties
            name: 'Incomplete Function',
          },
          paths: [],
        },
      ];

      renderComponent({ ...defaultProps, hits: { phases: 0, actions: 0, records: 0 }, searchResults });

      // Should not crash with incomplete item data or zero hits
      expect(screen.getByText('Incomplete Function')).toBeInTheDocument();
      expect(screen.getByText('Hakutulos:')).toBeInTheDocument();
    });

    it('has correct CSS classes, structure and accessibility features', () => {
      const searchResults = [createMockSearchResult({}, 0)];
      renderComponent({ ...defaultProps, searchResults });

      const searchResultsContainer = screen.getByText('Hakutulos:').closest('.search-results');
      expect(searchResultsContainer).toBeInTheDocument();

      expect(screen.getByText('Hakutulos:').closest('.row')).toHaveClass('search-result-header');
      expect(screen.getByText('Test Function Name').closest('.row')).toHaveClass('search-result-item');

      // Verify keyboard navigation support
      const checkboxes = searchResultsContainer.querySelectorAll('.search-result-item-check');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });
});
