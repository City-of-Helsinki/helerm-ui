import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';

import Conversion from '../Conversion';
import renderWithProviders from '../../../../utils/renderWithProviders';
import { attributeTypes } from '../../../../utils/__mocks__/attributeHelpers';

describe('<Conversion />', () => {
  const mockOnConvert = vi.fn();

  const defaultProps = {
    disabled: false,
    onConvert: mockOnConvert,
    attributeTypes,
  };

  const renderComponent = (props = defaultProps) => {
    return renderWithProviders(
      <BrowserRouter>
        <Conversion {...props} />
      </BrowserRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with proper form structure and default state', () => {
    renderComponent();

    // Check form sections are rendered
    expect(screen.getByText('Kohdistus')).toBeInTheDocument();
    expect(screen.getByText('Kenttä')).toBeInTheDocument();
    expect(screen.getByText('Uusi arvo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Muuta' })).toBeInTheDocument();

    // Check default conversion type is function
    expect(screen.getByText('Käsittelyprosessi')).toBeInTheDocument();

    // Check form structure with proper columns
    expect(screen.getByText('Kohdistus').closest('.col-xs-3')).toBeInTheDocument();
    expect(screen.getByText('Kenttä').closest('.col-xs-3')).toBeInTheDocument();
    expect(screen.getByText('Uusi arvo').closest('.col-xs-3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Muuta' }).closest('.col-xs-3')).toBeInTheDocument();
  });

  it('handles empty state when no attribute is selected', () => {
    renderComponent();

    // Should show placeholder for attribute field
    expect(screen.getByText('Select...')).toBeInTheDocument();
    // Should show disabled text input for value and convert button
    const textInput = document.querySelector('.form-control');
    expect(textInput).toBeDisabled();
    expect(textInput).toHaveValue('');

    const convertButton = screen.getByRole('button', { name: 'Muuta' });
    expect(convertButton).toBeDisabled();
  });

  it('disables convert button when disabled prop is true', () => {
    renderComponent({ ...defaultProps, disabled: true });

    const convertButton = screen.getByRole('button', { name: 'Muuta' });
    expect(convertButton).toBeDisabled();
  });

  it('renders with initial conversion data when provided', () => {
    const conversion = {
      attribute: 'PublicityClass',
      type: 'phase',
      value: 'public',
    };

    renderComponent({ ...defaultProps, conversion });

    expect(screen.getByText('Vaihe')).toBeInTheDocument();
  });

  it('enables convert button when attribute is provided via props', () => {
    const conversion = {
      attribute: 'PublicityClass',
      type: 'function',
      value: 'public',
    };

    renderComponent({ ...defaultProps, conversion });

    const convertButton = screen.getByRole('button', { name: 'Muuta' });
    expect(convertButton).not.toBeDisabled();
  });

  it('calls onConvert with correct parameters when convert button is clicked', () => {
    const conversion = {
      attribute: 'PublicityClass',
      type: 'function',
      value: 'public',
    };

    renderComponent({ ...defaultProps, conversion });

    const convertButton = screen.getByRole('button', { name: 'Muuta' });
    convertButton.click();

    expect(mockOnConvert).toHaveBeenCalledWith({
      attribute: 'PublicityClass',
      type: 'function',
      value: 'public',
    });
  });

  it('renders date picker for date attributes', () => {
    const testCases = [
      { attribute: 'valid_from', value: '2024-01-01' },
      { attribute: 'valid_to', value: '2024-12-31' },
    ];

    testCases.forEach(({ attribute, value }) => {
      const conversion = { attribute, type: 'function', value };
      const { unmount } = renderComponent({ ...defaultProps, conversion });

      expect(screen.getByPlaceholderText('PP.KK.VVVV')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders correct field types based on attribute configuration', () => {
    // Test with different attribute types
    const testCases = [
      {
        conversion: { attribute: 'Keywords', type: 'function', value: 'test keyword' },
        expectedFieldClass: 'form-control',
        expectedValue: 'test keyword',
        description: 'text input for attributes without predefined values',
      },
      {
        conversion: { attribute: 'valid_from', type: 'function', value: '2024-01-01' },
        expectedPlaceholder: 'PP.KK.VVVV',
        description: 'date picker for date attributes',
      },
      {
        conversion: { attribute: 'PublicityClass', type: 'function', value: 'public' },
        expectedValue: 'public',
        description: 'select dropdown for attributes with predefined values',
      },
    ];

    testCases.forEach(({ conversion, expectedFieldClass, expectedPlaceholder, expectedValue }) => {
      const { unmount } = renderComponent({ ...defaultProps, conversion });

      if (expectedFieldClass) {
        const field = document.querySelector(`.${expectedFieldClass}`);
        expect(field).toBeInTheDocument();
        if (expectedValue) {
          expect(field).toHaveValue(expectedValue);
        }
      }
      if (expectedPlaceholder) {
        expect(screen.getByPlaceholderText(expectedPlaceholder)).toBeInTheDocument();
      }
      if (expectedValue && !expectedFieldClass) {
        expect(screen.getByText(expectedValue)).toBeInTheDocument();
      }

      unmount();
    });
  });

  it('correctly sets default values from conversion prop', () => {
    const conversion = {
      attribute: 'PublicityClass',
      type: 'phase',
      value: 'restricted',
    };

    renderComponent({ ...defaultProps, conversion });

    expect(screen.getByText('Vaihe')).toBeInTheDocument();
    expect(screen.getByText('restricted')).toBeInTheDocument();
  });

  it('handles multi-value attribute correctly', () => {
    const attributeTypesWithMultiTags = {
      ...attributeTypes,
      MultiTags: {
        name: 'Multi Tags',
        values: [
          { value: 'tag1', label: 'Tag 1' },
          { value: 'tag2', label: 'Tag 2' },
        ],
        allowedIn: ['function'],
        multiIn: ['function'],
        allowValuesOutsideChoicesIn: [],
      },
    };

    const conversion = {
      attribute: 'MultiTags',
      type: 'function',
      value: ['tag1', 'tag2'],
    };

    renderComponent({ ...defaultProps, attributeTypes: attributeTypesWithMultiTags, conversion });

    // Component should render without errors with multi-value
    expect(screen.getByRole('button', { name: 'Muuta' })).toBeInTheDocument();
  });

  it('handles creatable select for attributes that allow custom values', () => {
    const conversion = {
      attribute: 'PhaseType',
      type: 'phase',
      value: 'custom_phase',
    };

    renderComponent({ ...defaultProps, conversion });

    // Component should render the custom value
    expect(screen.getByText('custom_phase')).toBeInTheDocument();
  });
});
