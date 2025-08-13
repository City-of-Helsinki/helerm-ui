import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchTerm from '../SearchTerm';
import renderWithProviders from '../../../../utils/renderWithProviders';
import { attributeTypes } from '../../../../utils/__mocks__/mockHelpers';
import { BULK_UPDATE_SEARCH_TERM_DEFAULT } from '../../../../constants';

describe('<SearchTerm />', () => {
  const mockOnAddSearchTerm = vi.fn();
  const mockOnChangeSearchTerm = vi.fn();
  const mockOnRemoveSearchTerm = vi.fn();

  const defaultProps = {
    attributeTypes,
    attributeValues: {
      function: {
        PhaseType: ['Phase1', 'Phase2'],
        ActionType: ['Action1', 'Action2'],
      },
      phase: {
        PhaseType: ['PhaseA', 'PhaseB'],
        RecordType: ['Record1', 'Record2'],
      },
    },
    onAddSearchTerm: mockOnAddSearchTerm,
    onChangeSearchTerm: mockOnChangeSearchTerm,
    onRemoveSearchTerm: mockOnRemoveSearchTerm,
    searchTerm: {
      ...BULK_UPDATE_SEARCH_TERM_DEFAULT,
      id: 1,
    },
    showAdd: false,
  };

  const renderComponent = (props = defaultProps) => {
    return renderWithProviders(
      <BrowserRouter>
        <SearchTerm {...props} />
      </BrowserRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('search-term')).toBeInTheDocument();
  });

  describe('Basic Rendering', () => {
    it('renders all form fields and remove button', () => {
      renderComponent();

      // Check all form field labels
      expect(screen.getByText('Taso')).toBeInTheDocument();
      expect(screen.getByText('Kenttä')).toBeInTheDocument();
      expect(screen.getByText('Vertaus')).toBeInTheDocument();
      expect(screen.getByText('Arvo')).toBeInTheDocument();

      // Check remove button with minus icon
      const removeButton = screen.getByRole('button');
      expect(removeButton).toBeInTheDocument();
      const minusIcon = removeButton.querySelector('.fa-minus');
      expect(minusIcon).toBeInTheDocument();
    });

    it('conditionally renders add button based on showAdd prop', () => {
      // Test without add button
      const { rerender } = renderComponent({ ...defaultProps, showAdd: false });
      let plusIcon = screen.getByTestId('search-term').querySelector('.fa-plus');
      expect(plusIcon).not.toBeInTheDocument();

      // Test with add button - rerender with same component
      rerender(
        <BrowserRouter>
          <SearchTerm {...{ ...defaultProps, showAdd: true }} />
        </BrowserRouter>,
      );

      const searchTermActions = screen.getByTestId('search-term').querySelectorAll('.search-term-action');
      expect(searchTermActions).toHaveLength(2);

      plusIcon = screen.getByTestId('search-term').querySelector('.fa-plus');
      expect(plusIcon).toBeInTheDocument();
    });
  });

  describe('Field States and Validation', () => {
    it('disables attribute field when target is empty', () => {
      const propsWithEmptyTarget = {
        ...defaultProps,
        searchTerm: { ...defaultProps.searchTerm, target: '' },
      };

      renderComponent(propsWithEmptyTarget);

      // Find the Select component for "Kenttä" (attribute field) by looking for disabled input
      const attributeFieldInput = screen.getByText('Kenttä').parentNode.querySelector('input[disabled]');
      expect(attributeFieldInput).toBeInTheDocument();
    });

    it('disables value field when attribute is empty', () => {
      const propsWithEmptyAttribute = {
        ...defaultProps,
        searchTerm: { ...defaultProps.searchTerm, attribute: '' },
      };

      renderComponent(propsWithEmptyAttribute);

      // Find the CreatableSelect component for "Arvo" (value field) by looking for disabled input
      const valueFieldInput = screen.getByText('Arvo').parentNode.querySelector('input[disabled]');
      expect(valueFieldInput).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('calls onRemoveSearchTerm when remove button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Find the button with minus icon
      const removeButton = screen.getByTestId('search-term').querySelector('.fa-minus').closest('button');
      await user.click(removeButton);

      expect(mockOnRemoveSearchTerm).toHaveBeenCalledTimes(1);
    });

    it('calls onAddSearchTerm when add button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent({ ...defaultProps, showAdd: true });

      // Find the button with plus icon
      const addButton = screen.getByTestId('search-term').querySelector('.fa-plus').closest('button');
      await user.click(addButton);

      expect(mockOnAddSearchTerm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Handling and Rendering', () => {
    it('handles different search term configurations', () => {
      // Test multiple configurations in one test
      const configurations = [
        { target: 'function', attribute: 'PhaseType', value: 'Phase1', equals: true },
        { target: 'phase', attribute: 'RecordType', value: ['Record1', 'Record2'], equals: false },
        { target: '', attribute: '', value: '', equals: true },
      ];

      configurations.forEach((config) => {
        const searchTerm = { ...BULK_UPDATE_SEARCH_TERM_DEFAULT, ...config };
        const { unmount } = renderComponent({ ...defaultProps, searchTerm });

        expect(screen.getByTestId('search-term')).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Edge Cases and Component Structure', () => {
    it('handles missing or empty data gracefully', () => {
      const edgeCases = [
        { attributeTypes: undefined, description: 'missing attributeTypes' },
        { attributeValues: {}, description: 'empty attributeValues' },
        { searchTerm: { target: '', attribute: '', equals: true, value: '' }, description: 'incomplete search term' },
      ];

      edgeCases.forEach(({ ...props }) => {
        const testProps = { ...defaultProps, ...props };
        const { unmount } = renderComponent(testProps);

        expect(screen.getByTestId('search-term')).toBeInTheDocument();
        unmount();
      });
    });

    it('has correct component structure and CSS classes', () => {
      renderComponent({ ...defaultProps, showAdd: true });

      const searchTermContainer = screen.getByTestId('search-term');
      expect(searchTermContainer).toHaveClass('search-term');

      // Check form labels are present
      ['Taso', 'Kenttä', 'Vertaus', 'Arvo'].forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });

      // Check button structure
      const actionButtons = searchTermContainer.querySelectorAll('.search-term-action');
      expect(actionButtons).toHaveLength(2);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });
  });
});
