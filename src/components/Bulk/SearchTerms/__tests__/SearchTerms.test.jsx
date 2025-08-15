import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchTerms from '../SearchTerms';
import renderWithProviders from '../../../../utils/renderWithProviders';
import { attributeTypes } from '../../../../utils/__mocks__/mockHelpers';
import { BULK_UPDATE_SEARCH_TERM_DEFAULT } from '../../../../constants';

describe('<SearchTerms />', () => {
  const mockOnSearch = vi.fn();
  const mockResetSearchResults = vi.fn();

  const defaultProps = {
    attributeTypes,
    attributeValues: {
      function: ['Function A', 'Function B', 'Function C'],
      phase: ['Phase 1', 'Phase 2'],
      action: ['Action X', 'Action Y'],
    },
    onSearch: mockOnSearch,
    resetSearchResults: mockResetSearchResults,
    searchTerms: [{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: Date.now() }],
  };

  const renderComponent = (props = defaultProps) => {
    return renderWithProviders(
      <BrowserRouter>
        <SearchTerms {...props} />
      </BrowserRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
  });

  it('renders search terms and displays action buttons', () => {
    const searchTerms = [
      { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 1 },
      { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 2, attribute: 'PhaseType', value: 'test' },
    ];

    renderComponent({ ...defaultProps, searchTerms });

    // Verify search terms container is rendered
    const searchContainer = screen.getByText('Rajaa muutettavat kohteet').closest('.search-terms');
    expect(searchContainer).toBeInTheDocument();
    expect(searchContainer.querySelector('.search-terms-container')).toBeInTheDocument();

    // Verify action buttons are present
    expect(screen.getByRole('button', { name: 'Tyhjennä' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hae' })).toBeInTheDocument();
  });

  it('disables search button when terms are invalid', () => {
    const invalidSearchTerms = [{ ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 1, attribute: '', value: '' }];

    renderComponent({ ...defaultProps, searchTerms: invalidSearchTerms });

    const searchButton = screen.getByRole('button', { name: 'Hae' });
    expect(searchButton).toBeDisabled();
  });

  it('enables search button when all terms are valid', () => {
    const validSearchTerms = [
      { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 1, target: 'function', attribute: 'PhaseType', value: 'test' },
    ];

    renderComponent({ ...defaultProps, searchTerms: validSearchTerms });

    const searchButton = screen.getByRole('button', { name: 'Hae' });
    expect(searchButton).not.toBeDisabled();
  });

  describe('search term interactions', () => {
    it('calls onSearch when search button is clicked', async () => {
      const user = userEvent.setup();
      const validSearchTerms = [
        { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 1, target: 'function', attribute: 'PhaseType', value: 'test' },
      ];

      renderComponent({ ...defaultProps, searchTerms: validSearchTerms });

      const searchButton = screen.getByRole('button', { name: 'Hae' });
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledWith(validSearchTerms);
    });

    it('calls resetSearchResults when reset button is clicked', async () => {
      const user = userEvent.setup();
      const existingTerms = [
        { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 1, attribute: 'PhaseType', value: 'test' },
        { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 2, attribute: 'ActionType', value: 'another' },
      ];

      renderComponent({ ...defaultProps, searchTerms: existingTerms });

      const resetButton = screen.getByRole('button', { name: 'Tyhjennä' });
      await user.click(resetButton);

      expect(mockResetSearchResults).toHaveBeenCalled();
    });
  });

  describe('validation logic', () => {
    it('validates terms with empty fields as invalid', () => {
      // Test empty target
      const emptyTargetTerms = [
        { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 1, target: '', attribute: 'PhaseType', value: 'test' },
      ];
      renderComponent({ ...defaultProps, searchTerms: emptyTargetTerms });
      expect(screen.getByRole('button', { name: 'Hae' })).toBeDisabled();
    });

    it('validates mixed valid and invalid terms as invalid', () => {
      const mixedTerms = [
        { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 1, target: 'function', attribute: 'PhaseType', value: 'valid' },
        { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 2, target: '', attribute: 'ActionType', value: 'invalid' },
      ];

      renderComponent({ ...defaultProps, searchTerms: mixedTerms });

      const searchButton = screen.getByRole('button', { name: 'Hae' });
      expect(searchButton).toBeDisabled();
    });

    it('validates all complete terms as valid', () => {
      const validTerms = [
        { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 1, target: 'function', attribute: 'PhaseType', value: 'test1' },
        { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, id: 2, target: 'phase', attribute: 'ActionType', value: 'test2' },
      ];

      renderComponent({ ...defaultProps, searchTerms: validTerms });

      const searchButton = screen.getByRole('button', { name: 'Hae' });
      expect(searchButton).not.toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has proper button roles and heading structure', () => {
      renderComponent();

      // Button roles and types
      expect(screen.getByRole('button', { name: 'Tyhjennä' })).toHaveAttribute('type', 'button');
      expect(screen.getByRole('button', { name: 'Hae' })).toHaveAttribute('type', 'button');

      // Heading structure
      expect(screen.getByRole('heading', { name: 'Rajaa muutettavat kohteet', level: 3 })).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty searchTerms array and missing props', () => {
      // Empty searchTerms array
      renderComponent({ ...defaultProps, searchTerms: [] });
      expect(screen.getByRole('button', { name: 'Hae' })).not.toBeDisabled();
    });

    it('handles missing attributeTypes and empty attributeValues', () => {
      // Missing attributeTypes
      const propsWithoutAttributeTypes = {
        ...defaultProps,
        attributeTypes: undefined,
        attributeValues: {},
      };

      renderComponent(propsWithoutAttributeTypes);

      // Should still render basic structure
      expect(screen.getByText('Rajaa muutettavat kohteet')).toBeInTheDocument();
    });
  });
});
