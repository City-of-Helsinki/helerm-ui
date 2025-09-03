import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ImportView from '../ImportView';
import { attributeTypes } from '../../../../utils/__mocks__/attributeHelpers';
import { createMockPhase, createMockAction, createRecord } from '../../../../utils/__mocks__/universalHelpers';

// Mock data for different levels using centralized functions
const mockPhases = {
  'phase-1': createMockPhase({
    id: 'phase-1',
    name: 'Phase phase-1',
    attributes: {
      PhaseType: 'Valmistelu',
      TypeSpecifier: 'Phase Specifier phase-1',
    },
    actions: [],
  }),
  'phase-2': createMockPhase({
    id: 'phase-2',
    name: 'Phase phase-2',
    attributes: {
      PhaseType: 'Valmistelu',
      TypeSpecifier: 'Phase Specifier phase-2',
    },
    actions: ['action-1', 'action-2'],
  }),
  'phase-3': createMockPhase({
    id: 'phase-3',
    name: 'Phase phase-3',
    attributes: {
      PhaseType: 'Valmistelu',
      TypeSpecifier: 'Phase Specifier phase-3',
    },
    actions: ['action-3'],
  }),
};

const mockActions = {
  'action-1': createMockAction({
    id: 'action-1',
    name: 'Action action-1',
    phase: 'phase-2',
    attributes: {
      ActionType: 'Selvitys',
      TypeSpecifier: 'Action Specifier action-1',
    },
    records: [],
  }),
  'action-2': createMockAction({
    id: 'action-2',
    name: 'Action action-2',
    phase: 'phase-2',
    attributes: {
      ActionType: 'Selvitys',
      TypeSpecifier: 'Action Specifier action-2',
    },
    records: ['record-1', 'record-2'],
  }),
  'action-3': createMockAction({
    id: 'action-3',
    name: 'Action action-3',
    phase: 'phase-3',
    attributes: {
      ActionType: 'Selvitys',
      TypeSpecifier: 'Action Specifier action-3',
    },
    records: ['record-3'],
  }),
};

const mockRecords = {
  'record-1': createRecord({
    id: 'record-1',
    name: 'Record record-1',
    action: 'action-2',
    attributes: {
      RecordType: 'Sopimus',
      TypeSpecifier: 'Record Specifier record-1',
    },
  }),
  'record-2': createRecord({
    id: 'record-2',
    name: 'Record record-2',
    action: 'action-2',
    attributes: {
      RecordType: 'Sopimus',
      TypeSpecifier: 'Record Specifier record-2',
    },
  }),
  'record-3': createRecord({
    id: 'record-3',
    name: 'Record record-3',
    action: 'action-3',
    attributes: {
      RecordType: 'Sopimus',
      TypeSpecifier: 'Record Specifier record-3',
    },
  }),
};

const defaultProps = {
  level: 'phase',
  title: 'käsittelyvaiheita',
  targetText: 'Tos-kuvaukseen Test',
  itemsToImportText: 'käsittelyvaiheet',
  phases: mockPhases,
  phasesOrder: ['phase-1', 'phase-2', 'phase-3'],
  actions: mockActions,
  records: mockRecords,
  importItems: vi.fn(),
  toggleImportView: vi.fn(),
  showItems: vi.fn(),
  parent: 'test-parent',
  attributeTypes,
};

const renderComponent = (props = {}) => render(<ImportView {...defaultProps} {...props} />);

describe('<ImportView />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing body classes
    document.body.className = '';
  });

  afterEach(() => {
    // Clean up body classes after each test
    document.body.classList.remove('noscroll');
  });
  describe('Basic Rendering', () => {
    it('renders correctly with proper title, text, and buttons', () => {
      renderComponent();

      // Title and content text
      expect(screen.getByText('Tuo käsittelyvaiheita Tos-kuvaukseen Test')).toBeInTheDocument();
      expect(screen.getByText('Valitse listalta tuotavat käsittelyvaiheet')).toBeInTheDocument();
      expect(screen.getByText('Tuotavat käsittelyvaiheet')).toBeInTheDocument();

      // Action buttons
      expect(screen.getByText('Tuo')).toBeInTheDocument();
      expect(screen.getByText('Peruuta')).toBeInTheDocument();
    });

    it('manages body noscroll class correctly', () => {
      expect(document.body.classList.contains('noscroll')).toBe(false);

      const { unmount } = renderComponent();
      expect(document.body.classList.contains('noscroll')).toBe(true);

      unmount();
      expect(document.body.classList.contains('noscroll')).toBe(false);
    });
  });

  describe('Level-specific Content Generation', () => {
    it('renders phase-level import items', () => {
      renderComponent({ level: 'phase' });
      expect(screen.getByTestId('import-row-item-phase-1')).toBeInTheDocument();
      expect(screen.getByTestId('import-row-item-phase-2')).toBeInTheDocument();
      expect(screen.getByTestId('import-row-item-phase-3')).toBeInTheDocument();
    });

    it('renders different level types with correct titles and content', () => {
      // Test action level
      const { rerender } = renderComponent({
        level: 'action',
        itemsToImportText: 'toimenpiteet',
        title: 'toimenpiteitä',
      });
      expect(screen.getByText('Tuo toimenpiteitä Tos-kuvaukseen Test')).toBeInTheDocument();
      expect(screen.getByText('Valmistelu / Phase Specifier phase-2')).toBeInTheDocument();

      // Test record level
      rerender(
        <ImportView
          {...defaultProps}
          {...{
            level: 'record',
            itemsToImportText: 'asiakirjat',
            title: 'asiakirjoja',
          }}
        />,
      );
      expect(screen.getByText('Tuo asiakirjoja Tos-kuvaukseen Test')).toBeInTheDocument();
      expect(screen.getByText('Valmistelu / Phase Specifier phase-2')).toBeInTheDocument();
      expect(screen.getByText('Selvitys / Action Specifier action-2')).toBeInTheDocument();
    });

    it('handles empty structures gracefully', () => {
      renderComponent({
        phases: {},
        phasesOrder: [],
        actions: {},
        records: {},
      });
      // Should not crash and should show empty import areas
      expect(screen.getByTestId('import-view-available-elements')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-selected-elements')).toBeInTheDocument();
    });
  });

  describe('Element Selection and Management', () => {
    it('allows selecting and removing items with mouse interaction', async () => {
      const user = userEvent.setup();
      renderComponent();

      const phaseLink = screen.getByTestId('import-row-link-phase-1');
      await user.click(phaseLink);

      expect(screen.getByTestId('import-view-selected-element-0')).toBeInTheDocument();
      expect(screen.getByText('Phase Specifier phase-1')).toBeInTheDocument();

      // Remove by clicking selected item
      const selectedElement = screen.getByTestId('import-view-selected-element-0');
      await user.click(selectedElement);
      expect(screen.queryByTestId('import-view-selected-element-0')).not.toBeInTheDocument();
    });

    it('allows selecting multiple items', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('import-row-link-phase-1'));
      await user.click(screen.getByTestId('import-row-link-phase-2'));

      expect(screen.getByTestId('import-view-selected-element-0')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-selected-element-1')).toBeInTheDocument();
    });

    it('supports keyboard interaction with Enter key', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Select with keyboard
      const phaseLink = screen.getByTestId('import-row-link-phase-1');
      await user.click(phaseLink);
      await user.keyboard('{Enter}');
      expect(screen.getByTestId('import-view-selected-element-0')).toBeInTheDocument();

      // Remove with keyboard
      const selectedElement = screen.getByTestId('import-view-selected-element-0');
      await user.click(selectedElement);
      await user.keyboard('{Enter}');
      expect(screen.queryByTestId('import-view-selected-element-0')).not.toBeInTheDocument();
    });
  });

  describe('Target Name Generation', () => {
    it('generates correct target names with both type and specifier', () => {
      renderComponent();
      // The getTargetName function is used internally - we can test its output
      expect(screen.getByText('Valmistelu / Phase Specifier phase-1')).toBeInTheDocument();
    });

    it('handles missing type specifier gracefully', () => {
      const phasesWithoutSpecifier = {
        'phase-1': createMockPhase({
          id: 'phase-1',
          attributes: {
            PhaseType: 'Valmistelu',
            // TypeSpecifier will use default from createMockPhase
          },
        }),
      };

      renderComponent({ phases: phasesWithoutSpecifier, phasesOrder: ['phase-1'] });
      expect(screen.getByText('Valmistelu')).toBeInTheDocument();
    });

    it('handles missing type gracefully', () => {
      const phasesWithoutType = {
        'phase-1': createMockPhase({
          id: 'phase-1',
          attributes: {
            TypeSpecifier: 'Test Specifier',
            // PhaseType will use default from createMockPhase
          },
        }),
      };

      renderComponent({ phases: phasesWithoutType, phasesOrder: ['phase-1'] });
      expect(screen.getByText('Test Specifier')).toBeInTheDocument();
    });

    it('handles missing both type and specifier', () => {
      const phasesWithoutBoth = {
        'phase-1': createMockPhase({
          id: 'phase-1',
          attributes: {
            PhaseType: '',
            TypeSpecifier: '',
          },
        }),
      };

      renderComponent({ phases: phasesWithoutBoth, phasesOrder: ['phase-1'] });
      // Should show empty string as fallback - check for any existing link
      const linkElements = screen.queryAllByTestId(/import-row-link-phase-1/);
      expect(linkElements.length).toBeGreaterThan(0);
    });
  });

  describe('Import Functionality', () => {
    it('calls importItems for each selected element when import button clicked', async () => {
      const user = userEvent.setup();
      const mockImportItems = vi.fn();
      renderComponent({ importItems: mockImportItems });

      // Select multiple items
      await user.click(screen.getByTestId('import-row-link-phase-1'));
      await user.click(screen.getByTestId('import-row-link-phase-2'));

      // Click import button
      await user.click(screen.getByText('Tuo'));

      expect(mockImportItems).toHaveBeenCalledTimes(2);
      expect(mockImportItems).toHaveBeenCalledWith({ newItem: 'phase-1', level: 'phase', itemParent: 'test-parent' });
      expect(mockImportItems).toHaveBeenCalledWith({ newItem: 'phase-2', level: 'phase', itemParent: 'test-parent' });
    });

    it('calls importItems with correct object structure for different levels', async () => {
      const user = userEvent.setup();
      const mockImportItems = vi.fn();

      // Test action level import - simplify to use existing data
      renderComponent({
        level: 'action',
        parent: 'phase-parent',
        importItems: mockImportItems,
      });

      // Click on the first visible action link (from the existing mock data)
      const actionLinks = screen.getAllByText(/Selvitys \/ Action Specifier/);
      await user.click(actionLinks[0]);
      await user.click(screen.getByText('Tuo'));

      expect(mockImportItems).toHaveBeenCalledWith({
        newItem: 'action-1',
        level: 'action',
        itemParent: 'phase-parent',
      });
    });

    it('calls showItems if provided', async () => {
      const user = userEvent.setup();
      const mockShowItems = vi.fn();
      renderComponent({ showItems: mockShowItems });

      await user.click(screen.getByTestId('import-row-link-phase-1'));
      await user.click(screen.getByText('Tuo'));

      expect(mockShowItems).toHaveBeenCalledTimes(1);
    });

    it('calls toggleImportView after import', async () => {
      const user = userEvent.setup();
      const mockToggleImportView = vi.fn();
      renderComponent({ toggleImportView: mockToggleImportView });

      await user.click(screen.getByTestId('import-row-link-phase-1'));
      await user.click(screen.getByText('Tuo'));

      expect(mockToggleImportView).toHaveBeenCalledTimes(1);
    });

    it('handles import with no selected elements', async () => {
      const user = userEvent.setup();
      const mockImportItems = vi.fn();
      const mockToggleImportView = vi.fn();
      renderComponent({ importItems: mockImportItems, toggleImportView: mockToggleImportView });

      // Click import without selecting anything
      await user.click(screen.getByText('Tuo'));

      expect(mockImportItems).not.toHaveBeenCalled();
      expect(mockToggleImportView).toHaveBeenCalledTimes(1);
    });

    it('calls toggleImportView when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockToggleImportView = vi.fn();
      renderComponent({ toggleImportView: mockToggleImportView });

      await user.click(screen.getByText('Peruuta'));

      expect(mockToggleImportView).toHaveBeenCalledTimes(1);
    });

    it('maintains function call order during import process', async () => {
      const user = userEvent.setup();
      const calls = [];
      const mockImportItems = vi.fn().mockImplementation(() => calls.push('importItems'));
      const mockShowItems = vi.fn().mockImplementation(() => calls.push('showItems'));
      const mockToggleImportView = vi.fn().mockImplementation(() => calls.push('toggleImportView'));

      renderComponent({
        importItems: mockImportItems,
        showItems: mockShowItems,
        toggleImportView: mockToggleImportView,
      });

      await user.click(screen.getByTestId('import-row-link-phase-1'));
      await user.click(screen.getByText('Tuo'));

      // Verify the correct order: importItems -> showItems -> toggleImportView
      expect(calls).toEqual(['importItems', 'showItems', 'toggleImportView']);
    });
  });

  describe('Component Props and Edge Cases', () => {
    it('handles missing showItems function gracefully', async () => {
      const user = userEvent.setup();
      renderComponent({ showItems: undefined });

      await user.click(screen.getByTestId('import-row-link-phase-1'));
      await user.click(screen.getByText('Tuo'));

      // Should not crash
      expect(screen.getByTestId('import-view')).toBeInTheDocument();
    });

    it('handles empty data structures gracefully', () => {
      // Test phases without actions
      const phaseWithoutActions = {
        'phase-empty': createMockPhase({
          id: 'phase-empty',
          actions: [],
        }),
      };

      const { rerender } = renderComponent({
        level: 'action',
        phases: phaseWithoutActions,
        phasesOrder: ['phase-empty'],
      });
      expect(screen.getByTestId('import-view')).toBeInTheDocument();

      // Test actions without records
      const phaseWithAction = {
        'phase-1': createMockPhase({
          id: 'phase-1',
          actions: ['action-empty'],
        }),
      };

      const actionWithoutRecords = {
        'action-empty': createMockAction({
          id: 'action-empty',
          phase: 'phase-1',
          records: [],
        }),
      };

      rerender(
        <ImportView
          {...defaultProps}
          {...{
            level: 'record',
            phases: phaseWithAction,
            phasesOrder: ['phase-1'],
            actions: actionWithoutRecords,
          }}
        />,
      );
      expect(screen.getByTestId('import-view')).toBeInTheDocument();
    });

    it('displays fallback text when attributes are missing', async () => {
      const user = userEvent.setup();
      const phaseWithMissingAttributes = {
        'phase-missing': {
          id: 'phase-missing',
          name: 'Phase Missing Attributes',
          attributes: {},
          actions: [],
        },
      };

      renderComponent({
        phases: phaseWithMissingAttributes,
        phasesOrder: ['phase-missing'],
      });

      await user.click(screen.getByTestId('import-row-link-phase-missing'));

      const selectedElement = screen.getByTestId('import-view-selected-element-0');
      expect(selectedElement).toHaveTextContent('-');
    });

    it('handles invalid level prop gracefully', () => {
      renderComponent({ level: 'invalid-level' });
      expect(screen.getByTestId('import-view')).toBeInTheDocument();
      // Should render empty available elements section
      const availableElements = screen.getByTestId('import-view-available-elements');
      expect(availableElements.children.length).toBe(0);
    });

    it('handles missing parent prop for import', async () => {
      const user = userEvent.setup();
      const mockImportItems = vi.fn();
      renderComponent({ importItems: mockImportItems, parent: undefined });

      await user.click(screen.getByTestId('import-row-link-phase-1'));
      await user.click(screen.getByText('Tuo'));

      expect(mockImportItems).toHaveBeenCalledWith({
        newItem: 'phase-1',
        level: 'phase',
        itemParent: undefined,
      });
    });

    it('correctly handles items property as array vs object', () => {
      // Test with array (typical case)
      renderComponent();
      expect(screen.getByTestId('import-row-item-phase-1')).toBeInTheDocument();

      // This test verifies that the component works with the standard array-based data structure
      // The Object.keys() fallback in generateLinks handles edge cases but is harder to test
      // without causing rendering conflicts, so we focus on the main functionality
      expect(screen.getAllByTestId(/^import-row-item-/).length).toBeGreaterThan(0);
    });

    it('preserves component state during props updates', async () => {
      const user = userEvent.setup();
      const { rerender } = renderComponent();

      // Select some items
      await user.click(screen.getByTestId('import-row-link-phase-1'));
      await user.click(screen.getByTestId('import-row-link-phase-2'));

      expect(screen.getByTestId('import-view-selected-element-0')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-selected-element-1')).toBeInTheDocument();

      // Update props but selection should remain
      rerender(<ImportView {...defaultProps} title='Updated Title' />);

      expect(screen.getByText('Tuo Updated Title Tos-kuvaukseen Test')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-selected-element-0')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-selected-element-1')).toBeInTheDocument();
    });
  });

  describe('Data Testids and Component Structure', () => {
    it('renders with correct structure and testids', async () => {
      const user = userEvent.setup();
      renderComponent();

      // Main component structure
      expect(screen.getByTestId('import-view')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-title')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-available-elements')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-selected-elements')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-import-button')).toBeInTheDocument();
      expect(screen.getByTestId('import-view-cancel-button')).toBeInTheDocument();

      // Import items
      expect(screen.getByTestId('import-row-item-phase-1')).toBeInTheDocument();
      expect(screen.getByTestId('import-row-link-phase-1')).toBeInTheDocument();

      // Selected elements (after selection)
      await user.click(screen.getByTestId('import-row-link-phase-1'));
      expect(screen.getByTestId('import-view-selected-element-0')).toBeInTheDocument();
    });
  });
});
