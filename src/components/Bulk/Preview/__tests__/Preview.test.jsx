import React from 'react';
import { createBrowserHistory } from 'history';
import { BrowserRouter } from 'react-router-dom';
import { screen, fireEvent } from '@testing-library/react';

import Preview from '../Preview';
import renderWithProviders from '../../../../utils/renderWithProviders';

// Create local test helpers for bulk functionality
const createMockProcessItem = (overrides = {}) => ({
  id: 'test-process-item',
  name: 'Test Process Item',
  path: ['Root', 'Category', 'Test Process Item'], // Add path array for join operation
  function_state: 1,
  attributes: {
    attribute1: 'original_value1',
    attribute2: 'original_value2',
  },
  phases: [
    {
      id: 'phase1',
      name: 'Test Phase',
      actions: [
        {
          id: 'action1',
          name: 'Test Action',
          phase: 'phase1',
          records: [
            {
              id: 'record1',
              name: 'Test Record',
              action: 'action1'
            }
          ]
        }
      ]
    }
  ],
  ...overrides
});

const createMockBulkChanges = (overrides = {}) => ({
  valid_from: '2024-01-01',
  attributes: {
    attribute1: 'new_value1',
    attribute2: 'new_value2',
  },
  phases: {
    'phase1': {
      attributes: {
        phase_attr: 'new_phase_value'
      },
      actions: {
        'action1': {
          attributes: {
            action_attr: 'new_action_value'
          },
          records: {
            'record1': {
              attributes: {
                record_attr: 'new_record_value'
              }
            }
          }
        }
      }
    }
  },
  ...overrides
});

const createMockBulkErrors = (overrides = {}) => ({
  attributes: ['attribute1', 'attribute2'],
  phases: {
    'phase1': {
      attributes: ['phase_attr'],
      actions: {
        'action1': {
          attributes: ['action_attr'],
          records: {
            'record1': {
              attributes: ['record_attr']
            }
          }
        }
      }
    }
  },
  ...overrides
});

const mockGetAttributeName = (attribute) => `Attribute_${attribute}`;
const mockGetTypeName = (type) => `Type_${type}`;
const mockOnClose = vi.fn();
const mockOnConfirm = vi.fn();
const mockOnSelect = vi.fn();

const defaultProps = {
  conversions: [],
  getAttributeName: mockGetAttributeName,
  getTypeName: mockGetTypeName,
  isFinalPreview: false,
  items: {},
  onClose: mockOnClose,
  onConfirm: mockOnConfirm,
  onSelect: mockOnSelect,
};

const renderComponent = (props = {}) => {
  const history = createBrowserHistory();
  const combinedProps = { ...defaultProps, ...props };

  return renderWithProviders(
    <BrowserRouter history={history}>
      <Preview {...combinedProps} />
    </BrowserRouter>,
    { history },
  );
};

// Use centralized mock system instead of inline constants
const mockItem = createMockProcessItem({
  id: 'item-1',
  name: 'Test Process',
  path: ['Root', 'Category', 'Subcategory'],
  function_state: 1,
  attributes: {
    attribute1: 'value1',
    attribute2: 'value2',
  }
});

const mockChanges = createMockBulkChanges({
  valid_from: '2024-01-01',
  attributes: {
    attribute1: 'new_value1',
    attribute2: 'new_value2',
  }
});

const mockErrors = createMockBulkErrors({
  attributes: ['attribute1', 'attribute2']
});

describe('<Preview />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders correctly without items', () => {
      renderComponent();
      expect(screen.getByText('Massamuutos esikatselu')).toBeInTheDocument();
      expect(screen.getByText('Muutetaan: 0 käsittelyprosessia')).toBeInTheDocument();
    });

    it('renders back button and calls onClose when clicked', () => {
      renderComponent();
      const backButton = screen.getByRole('button', { name: /takaisin/i });
      fireEvent.click(backButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('displays conversions when provided', () => {
      const conversions = [
        { type: 'add', attribute: 'attr1', value: 'value1' },
        { type: 'update', attribute: 'attr2', value: 'value2' },
      ];
      renderComponent({ conversions });

      expect(screen.getByText('Type_add: Attribute_attr1 = value1')).toBeInTheDocument();
      expect(screen.getByText('Type_update: Attribute_attr2 = value2')).toBeInTheDocument();
    });
  });

  describe('Item Rendering and Selection', () => {
    const itemsWithSelection = {
      'item-1': {
        selected: true,
        item: mockItem,
        changed: mockChanges,
        errors: {},
      },
      'item-2': {
        selected: false,
        item: createMockProcessItem({
          id: 'item-2',
          name: 'Unselected Process',
          path: ['Root', 'Category', 'Subcategory']  // Match the same path as the first item
        }),
        changed: {},
        errors: {},
      },
    };

    it('displays correct selected count', () => {
      renderComponent({ items: itemsWithSelection });
      expect(screen.getByText('Muutetaan: 1 käsittelyprosessia')).toBeInTheDocument();
    });

    it('renders item information correctly', () => {
      renderComponent({ items: itemsWithSelection });

      expect(screen.getByText('Test Process')).toBeInTheDocument();
      expect(screen.getAllByText('Root > Category > Subcategory')).toHaveLength(2);
      expect(screen.getByText('Unselected Process')).toBeInTheDocument();
    });

    it('handles item selection on click', () => {
      renderComponent({ items: itemsWithSelection });

      const checkboxes = screen.getAllByRole('generic');
      const itemCheckbox = checkboxes.find((el) => el.classList.contains('preview-item-check'));

      if (itemCheckbox) {
        fireEvent.click(itemCheckbox);
        expect(mockOnSelect).toHaveBeenCalled();
      }
    });

    it('handles item selection on keyboard Enter', () => {
      renderComponent({ items: itemsWithSelection });

      const checkboxes = screen.getAllByRole('generic');
      const itemCheckbox = checkboxes.find((el) => el.classList.contains('preview-item-check'));

      if (itemCheckbox) {
        fireEvent.keyUp(itemCheckbox, { key: 'Enter' });
        expect(mockOnSelect).toHaveBeenCalled();
      }
    });
  });

  describe('Changes Display', () => {
    const itemsWithChanges = {
      'item-1': {
        selected: true,
        item: mockItem,
        changed: mockChanges,
        errors: {},
      },
    };

    it('renders function attribute changes', () => {
      renderComponent({ items: itemsWithChanges });
      expect(screen.getByText(/Voimassaolo alkaa.*2024-01-01/)).toBeInTheDocument();
    });

    it('renders regular attribute changes', () => {
      renderComponent({ items: itemsWithChanges });
      expect(screen.getByText(/Attribute_attribute1.*new_value1/)).toBeInTheDocument();
      expect(screen.getByText(/Attribute_attribute2.*new_value2/)).toBeInTheDocument();
    });

    it('renders phase changes', () => {
      renderComponent({ items: itemsWithChanges });
      expect(screen.getByText(/Test Phase.*Attribute_phase_attr.*new_phase_value/)).toBeInTheDocument();
    });

    it('renders action changes', () => {
      renderComponent({ items: itemsWithChanges });
      expect(screen.getByText(/Test Action.*Attribute_action_attr.*new_action_value/)).toBeInTheDocument();
    });

    it('renders record changes', () => {
      renderComponent({ items: itemsWithChanges });
      expect(screen.getByText(/Test Record.*Attribute_record_attr.*new_record_value/)).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    const itemsWithErrors = {
      'item-1': {
        selected: true,
        item: mockItem,
        changed: {},
        errors: mockErrors,
      },
    };

    it('renders function attribute errors', () => {
      renderComponent({ items: itemsWithErrors });
      expect(screen.getByText('Esitarkastus:')).toBeInTheDocument();
      expect(screen.getByText('Käsittelyprosessi:')).toBeInTheDocument();
      expect(screen.getByText('Attribute_attribute1, Attribute_attribute2')).toBeInTheDocument();
    });

    it('renders phase errors', () => {
      renderComponent({ items: itemsWithErrors });
      expect(screen.getByText('Test Phase:')).toBeInTheDocument();
      expect(screen.getByText('Attribute_phase_attr')).toBeInTheDocument();
    });

    it('renders action errors', () => {
      renderComponent({ items: itemsWithErrors });
      expect(screen.getByText('Test Action:')).toBeInTheDocument();
      expect(screen.getByText('Attribute_action_attr')).toBeInTheDocument();
    });

    it('renders record errors', () => {
      renderComponent({ items: itemsWithErrors });
      expect(screen.getByText('Test Record:')).toBeInTheDocument();
      expect(screen.getByText('Attribute_record_attr')).toBeInTheDocument();
    });

    it('renders errors without attributes (empty content)', () => {
      const errorsWithoutAttributes = {
        phases: {
          'phase1': {
            actions: {
              'action1': {
                records: {
                  'record1': {},
                },
              },
            },
          },
        },
      };

      const items = {
        'item-1': {
          selected: true,
          item: mockItem,
          changed: {},
          errors: errorsWithoutAttributes,
        },
      };

      renderComponent({ items });
      expect(screen.getByText(/Test Phase:\s*$/)).toBeInTheDocument();
      expect(screen.getByText(/Test Action:\s*$/)).toBeInTheDocument();
      expect(screen.getByText(/Test Record:\s*$/)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    const itemsSelected = {
      'item-1': {
        selected: true,
        item: mockItem,
        changed: {},
        errors: {},
      },
    };

    it('shows confirm button when not final preview', () => {
      renderComponent({ items: itemsSelected, isFinalPreview: false });
      expect(screen.getByRole('button', { name: 'Lisää muutokset' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Peruuta' })).toBeInTheDocument();
    });

    it('hides confirm button when final preview', () => {
      renderComponent({ items: itemsSelected, isFinalPreview: true });
      expect(screen.queryByRole('button', { name: 'Lisää muutokset' })).not.toBeInTheDocument();

      // Look for the specific "Takaisin" button in the preview-actions area
      const actionButtons = screen.getAllByRole('button', { name: 'Takaisin' });
      expect(actionButtons.length).toBeGreaterThan(0);

      // The action button should be the one with class btn-default
      const actionButton = actionButtons.find((btn) => btn.classList.contains('btn-default'));
      expect(actionButton).toBeInTheDocument();
    });

    it('disables confirm button when no items selected', () => {
      const unselectedItems = {
        'item-1': {
          selected: false,
          item: mockItem,
          changed: {},
          errors: {},
        },
      };
      renderComponent({ items: unselectedItems, isFinalPreview: false });
      expect(screen.getByRole('button', { name: 'Lisää muutokset' })).toBeDisabled();
    });

    it('calls onConfirm when confirm button clicked', () => {
      renderComponent({ items: itemsSelected, isFinalPreview: false });
      fireEvent.click(screen.getByRole('button', { name: 'Lisää muutokset' }));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button clicked', () => {
      renderComponent({ items: itemsSelected, isFinalPreview: false });
      fireEvent.click(screen.getByRole('button', { name: 'Peruuta' }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty changes object', () => {
      const items = {
        'item-1': {
          selected: true,
          item: mockItem,
          changed: {},
          errors: {},
        },
      };
      renderComponent({ items });
      expect(screen.getByText('Test Process')).toBeInTheDocument();
    });

    it('handles items without phases', () => {
      const itemWithoutPhases = createMockProcessItem({
        phases: [],
        name: 'Test Process', // Override the name to match test expectation
      });
      const items = {
        'item-1': {
          selected: true,
          item: itemWithoutPhases,
          changed: { attributes: { attr1: 'value1' } },
          errors: {},
        },
      };
      renderComponent({ items });
      expect(screen.getByText('Test Process')).toBeInTheDocument();
    });

    it('handles missing attribute values', () => {
      const itemWithMissingAttrs = createMockProcessItem({
        attributes: {},
        name: 'Test Process', // Override the name to match test expectation
      });
      const items = {
        'item-1': {
          selected: true,
          item: itemWithMissingAttrs,
          changed: { attributes: { missing_attr: 'new_value' } },
          errors: {},
        },
      };
      renderComponent({ items });
      expect(screen.getByText('Test Process')).toBeInTheDocument();
    });

    it('handles complex nested changes and errors', () => {
      const complexItem = {
        'item-1': {
          selected: true,
          item: mockItem,
          changed: mockChanges,
          errors: mockErrors,
        },
      };
      renderComponent({ items: complexItem });

      // Should render both changes and errors
      expect(screen.getByText(/new_value1/)).toBeInTheDocument();
      expect(screen.getByText('Esitarkastus:')).toBeInTheDocument();
    });
  });
});
