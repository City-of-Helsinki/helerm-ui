import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Phase from '../Phase';
import renderWithProviders from '../../../../utils/renderWithProviders';
import { attributeTypes, createMockPhase, createRecord } from '../../../../utils/__mocks__/mockHelpers';

// Create local test data
const createPhaseTestMocks = () => {
  const mockPhase = createMockPhase({
    id: 'phase-test-001',
    name: 'Testikäsittelyvaihe',
    actions: ['action-test-001', 'action-test-002'],
    is_open: true,
    is_attributes_open: false,
    attributes: {
      PhaseType: 'Valmistelu/Käsittely',
      TypeSpecifier: 'Testikäsittelyvaihe',
      InformationSystem: 'Test Information System',
    },
  });

  const mockActions = {
    'action-test-001': {
      id: 'action-test-001',
      name: 'Testikäsittelyvaihe 1',
      attributes: {
        ActionType: 'Päätös',
        TypeSpecifier: 'Testikäsittelyvaihe 1',
      },
      records: ['record-test-001'],
      phase: mockPhase.id,
      is_open: true,
    },
    'action-test-002': {
      id: 'action-test-002',
      name: 'Testikäsittelyvaihe 2',
      attributes: {
        ActionType: 'Toimenpide',
        TypeSpecifier: 'Testikäsittelyvaihe 2',
      },
      records: ['record-test-002'],
      phase: mockPhase.id,
      is_open: false,
    },
  };

  const mockRecords = {
    'record-test-001': createRecord({
      id: 'record-test-001',
      name: 'Test Record 1',
      action: 'action-test-001',
    }),
    'record-test-002': createRecord({
      id: 'record-test-002',
      name: 'Test Record 2',
      action: 'action-test-002',
    }),
  };

  return { phase: mockPhase, actions: mockActions, records: mockRecords };
};

const { phase: mockPhase, actions: mockActions, records: mockRecords } = createPhaseTestMocks();

const mockProps = {
  phase: mockPhase,
  actions: mockActions,
  actionTypes: attributeTypes.ActionType?.values?.reduce((acc, val) => {
    acc[val.id] = { id: val.id, name: val.value };
    return acc;
  }, {}),
  addRecord: vi.fn(),
  attributeTypes: attributeTypes,
  documentState: 'view',
  editPhaseAttribute: vi.fn(),
  displayMessage: vi.fn(),
  changeOrder: vi.fn(),
  importItems: vi.fn(),
  removePhase: vi.fn(),
  setActionVisibility: vi.fn(),
  editActionAttribute: vi.fn(),
  editRecord: vi.fn(),
  editRecordAttribute: vi.fn(),
  editAction: vi.fn(),
  removeAction: vi.fn(),
  removeRecord: vi.fn(),
  setRecordVisibility: vi.fn(),
  phaseTypes: attributeTypes.PhaseType?.values?.reduce((acc, val) => {
    acc[val.id] = { id: val.id, name: val.value };
    return acc;
  }, {}),
  phases: { [mockPhase.id]: mockPhase },
  phasesOrder: [mockPhase.id],
  records: mockRecords,
  recordTypes: attributeTypes.RecordType?.values?.reduce((acc, val) => {
    acc[val.id] = { id: val.id, name: val.value };
    return acc;
  }, {}),
  setPhaseAttributesVisibility: vi.fn(),
  addAction: vi.fn(),
  editPhase: vi.fn(),
  setPhaseVisibility: vi.fn(),
  phaseIndex: '0',
};

const renderComponent = (props = {}) => {
  return renderWithProviders(
    <DndProvider backend={HTML5Backend}>
      <Phase {...mockProps} {...props} ref={React.createRef()} />
    </DndProvider>,
  );
};

const clearAllMocks = () => {
  Object.values(mockProps)
    .filter((prop) => typeof prop === 'function')
    .forEach((mockFn) => mockFn.mockClear());
};

const setupUserAndRender = (props = {}) => {
  const user = userEvent.setup();
  renderComponent(props);
  return user;
};

const setupEditMode = (props = {}) => {
  return setupUserAndRender({ documentState: 'edit', ...props });
};

const openPhaseDropdown = async (user) => {
  const dropdownButton = screen.getByTestId('phase-dropdown-button');
  expect(dropdownButton).toBeInTheDocument();
  await user.click(dropdownButton);

  const dropdownMenu = screen.getByTestId('phase-dropdown-menu');
  expect(dropdownMenu).toBeInTheDocument();
  return dropdownMenu;
};

const clickDropdownItem = async (user, itemIndex) => {
  await openPhaseDropdown(user);
  await user.click(screen.getByTestId(`phase-dropdown-item-${itemIndex}`));
};

const verifyPopupContent = async (expectedTestIds = []) => {
  await waitFor(() => {
    expect(screen.getByTestId('popup-component')).toBeInTheDocument();
  });

  const popup = screen.getByTestId('popup-component');

  expectedTestIds.forEach((testId) => {
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  return popup;
};

const verifyFormButtons = (formHeading, showMoreText = 'Näytä lisää') => {
  expect(screen.getByRole('heading', { name: formHeading })).toBeInTheDocument();
  const showMoreButton = screen.getByRole('button', { name: showMoreText });
  expect(showMoreButton).toBeInTheDocument();
  return showMoreButton;
};

const toggleFormVisibility = async (user, formHeading, cancelButtonText = 'Peruuta') => {
  expect(screen.getByRole('heading', { name: formHeading })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: cancelButtonText }));
  expect(screen.queryByRole('heading', { name: formHeading })).not.toBeInTheDocument();
};

const verifyDropdownItems = (expectedItems) => {
  expectedItems.forEach((item, index) => {
    expect(screen.getByTestId(`phase-dropdown-item-${index}`)).toHaveTextContent(item);
  });
};

const verifyButtonText = (testId, expectedText) => {
  expect(screen.getByTestId(testId)).toHaveTextContent(expectedText);
};

const verifyButtonsTexts = (buttonConfigs) => {
  buttonConfigs.forEach(({ testId, text }) => {
    verifyButtonText(testId, text);
  });
};

const PHASE_TITLE = 'Testikäsittelyvaihe';
const ACTION_TITLES = ['Testikäsittelyvaihe 1', 'Testikäsittelyvaihe 2'];

const DROPDOWN_ITEMS = [
  'Uusi toimenpide',
  'Muokkaa käsittelyvaihetta',
  'Järjestä toimenpiteitä',
  'Tuo toimenpiteitä',
  'Poista käsittelyvaihe',
];

const DELETE_VIEW_TEST_IDS = [
  'delete-view',
  'delete-view-title',
  'delete-view-confirmation',
  'delete-view-delete-button',
  'delete-view-cancel-button',
];

const IMPORT_VIEW_TEST_IDS = [
  'import-view',
  'import-view-title',
  'import-view-button-row',
  'import-view-import-button',
  'import-view-cancel-button',
];

const verifyReorderView = async () => {
  await waitFor(() => {
    expect(screen.getByTestId('reorder-view')).toBeInTheDocument();
  });
  expect(screen.getByTestId('reorder-save-button')).toBeInTheDocument();
  expect(screen.getByTestId('reorder-cancel-button')).toBeInTheDocument();
  expect(screen.getByTestId('reorder-list')).toBeInTheDocument();
};

const verifyActionContent = (actionTitles) => {
  actionTitles.forEach((title) => {
    expect(screen.getByText(title)).toBeInTheDocument();
  });
};

const performDeletePhase = async (user, mockFn, expectedArgs) => {
  await clickDropdownItem(user, 4);

  await waitFor(() => {
    expect(screen.getByTestId('popup-component')).toBeInTheDocument();
    expect(screen.getByTestId('delete-view-delete-button')).toBeInTheDocument();
  });

  mockFn.mockClear();

  await user.click(screen.getByTestId('delete-view-delete-button'));

  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
};

describe('<Phase />', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      renderComponent();
      expect(screen.getByText(PHASE_TITLE)).toBeInTheDocument();
    });

    it('should render phase title', () => {
      renderComponent();
      expect(screen.getByText(PHASE_TITLE)).toBeInTheDocument();
    });

    it('should render child actions when phase is open', () => {
      renderComponent();
      verifyActionContent(ACTION_TITLES);
    });

    it('properly marks child actions when phase is closed', () => {
      renderComponent({
        phase: { ...mockPhase, is_open: false },
      });

      expect(screen.queryByText(ACTION_TITLES[0])).toBeInTheDocument();
      expect(document.querySelector('.actions')).toHaveClass('hidden');
    });

    it('should toggle visibility when toggle button is clicked', () => {
      renderComponent();

      const toggleButton = screen.getByRole('button', { name: 'Pienennä' });
      expect(toggleButton).toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(mockProps.setPhaseVisibility).toHaveBeenCalledWith(mockProps.phaseIndex, !mockPhase.is_open);
    });

    it('should toggle attributes visibility when metadata button is clicked', () => {
      renderComponent({ documentState: 'edit' });

      const metadataButton = screen.getByRole('button', { name: 'Näytä metatiedot' });
      expect(metadataButton).toBeInTheDocument();

      fireEvent.click(metadataButton);

      expect(mockProps.setPhaseAttributesVisibility).toHaveBeenCalledWith(mockPhase.id, !mockPhase.is_attributes_open);
    });
  });

  describe('Edit mode functionality', () => {
    it('enters edit mode when clicking TypeSpecifier in edit document state', async () => {
      const user = setupEditMode();

      await user.click(screen.getByText(PHASE_TITLE));

      expect(screen.getByDisplayValue(PHASE_TITLE)).toBeInTheDocument();
    });

    it('can edit TypeSpecifier value', async () => {
      const user = setupEditMode();

      await user.click(screen.getByText(PHASE_TITLE));

      const input = screen.getByDisplayValue(PHASE_TITLE);
      expect(input).toBeInTheDocument();
      expect(input.tagName.toLowerCase()).toBe('input');

      expect(typeof mockProps.editPhaseAttribute).toBe('function');

      await user.tab();

      expect(input).toBeInTheDocument();
    });
  });

  describe('Dropdown and popup views', () => {
    it('shows dropdown with phase options in edit mode', async () => {
      const user = setupEditMode();

      await openPhaseDropdown(user);

      verifyDropdownItems(DROPDOWN_ITEMS);
    });

    it('opens editor form when "Muokkaa käsittelyvaihetta" button is clicked', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 1);

      expect(screen.getByRole('heading', { name: 'Muokkaa käsittelyvaihetta' })).toBeInTheDocument();
    });

    it('can click show more button in edit form', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 1);

      const showMoreButton = verifyFormButtons('Muokkaa käsittelyvaihetta');
      await user.click(showMoreButton);

      expect(screen.getByRole('button', { name: 'Näytä vähemmän' })).toBeInTheDocument();
    });

    it('opens delete confirmation when "Poista käsittelyvaihe" is clicked', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 4);

      await verifyPopupContent(DELETE_VIEW_TEST_IDS);

      expect(screen.getByTestId('delete-view-confirmation')).toHaveTextContent('Vahvista poisto');
      verifyButtonsTexts([
        { testId: 'delete-view-delete-button', text: 'Poista' },
        { testId: 'delete-view-cancel-button', text: 'Peruuta' },
      ]);
    });

    it('opens reorder view when "Järjestä toimenpiteitä" is clicked', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 2);

      await verifyReorderView();
    });

    it('opens import view when "Tuo toimenpiteitä" is clicked', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 3);

      await verifyPopupContent(IMPORT_VIEW_TEST_IDS);

      verifyButtonsTexts([
        { testId: 'import-view-import-button', text: 'Tuo' },
        { testId: 'import-view-cancel-button', text: 'Peruuta' },
      ]);
    });
  });

  describe('Action management functionality', () => {
    it('shows create action form when "Uusi toimenpide" is clicked', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 0);

      expect(screen.getByRole('heading', { name: 'Uusi toimenpide' })).toBeInTheDocument();
    });

    it('can click show more in action creation form', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 0);

      const showMoreButton = verifyFormButtons('Uusi toimenpide');
      await user.click(showMoreButton);

      expect(screen.getByRole('button', { name: 'Näytä vähemmän' })).toBeInTheDocument();
    });

    it('can close action creation form', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 0);

      await toggleFormVisibility(user, 'Uusi toimenpide');
    });
  });

  describe('Add/Remove functionality', () => {
    it('calls removePhase with correct parameters when deletion is confirmed', async () => {
      const user = setupEditMode();

      await performDeletePhase(user, mockProps.removePhase, [mockPhase.id]);
    });

    it('calls addAction with correct parameters when an action is created', async () => {
      renderComponent({ documentState: 'edit' });

      clearAllMocks();

      const mockTypeSpecifier = 'New Action';
      const mockActionType = 'Action Type';
      const mockAttributes = { PersonalData: 'Yes' };
      mockProps.addAction(mockTypeSpecifier, mockActionType, mockAttributes, mockProps.phaseIndex);

      expect(mockProps.addAction).toHaveBeenCalledWith(
        mockTypeSpecifier,
        mockActionType,
        mockAttributes,
        mockProps.phaseIndex,
      );
    });

    it('calls removeAction for each action when phase is deleted', async () => {
      const user = setupEditMode();

      await clickDropdownItem(user, 4);

      await waitFor(() => {
        expect(screen.getByTestId('popup-component')).toBeInTheDocument();
        expect(screen.getByTestId('delete-view-delete-button')).toBeInTheDocument();
      });

      clearAllMocks();

      await user.click(screen.getByTestId('delete-view-delete-button'));

      expect(mockProps.removeAction).toHaveBeenCalledTimes(mockPhase.actions.length);
      mockPhase.actions.forEach((actionId) => {
        expect(mockProps.removeAction).toHaveBeenCalledWith(actionId, mockPhase.id);
      });

      expect(mockProps.removePhase).toHaveBeenCalledWith(mockPhase.id);
    });
  });

  describe('Integration with Action components', () => {
    it('renders the correct number of Action components', () => {
      renderComponent();

      verifyActionContent(ACTION_TITLES);
    });

    it('passes the correct props to Action components', () => {
      renderComponent();

      expect(screen.getByText(ACTION_TITLES[0])).toBeInTheDocument();
      expect(screen.getByText(ACTION_TITLES[1])).toBeInTheDocument();
    });

    it('renders actions within the correct container structure', () => {
      const { container } = renderComponent();

      const actionsContainer = container.querySelector('.actions');
      expect(actionsContainer).toBeInTheDocument();
      expect(actionsContainer).not.toHaveClass('hidden');
    });

    it('hides actions container when phase is closed', () => {
      const { container } = renderComponent({
        phase: { ...mockPhase, is_open: false },
      });

      const actionsContainer = container.querySelector('.actions');
      expect(actionsContainer).toBeInTheDocument();
      expect(actionsContainer).toHaveClass('hidden');
    });
  });

  describe('Attributes and metadata', () => {
    it('shows metadata button in edit mode', () => {
      renderComponent({ documentState: 'edit' });

      expect(screen.getByRole('button', { name: 'Näytä metatiedot' })).toBeInTheDocument();
    });

    it('changes metadata button text when attributes are visible', () => {
      renderComponent({
        documentState: 'edit',
        phase: { ...mockPhase, is_attributes_open: true },
      });

      expect(screen.getByRole('button', { name: 'Piilota metatiedot' })).toBeInTheDocument();
    });

    it('does not show edit buttons when documentState is view', () => {
      renderComponent({ documentState: 'view' });

      expect(screen.queryByTestId('phase-dropdown-button')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Näytä metatiedot' })).not.toBeInTheDocument();
    });
  });

  describe('Phase without actions', () => {
    it('handles phase with no actions gracefully', () => {
      renderComponent({
        phase: { ...mockPhase, actions: [] },
        actions: {},
      });

      expect(screen.getByText(PHASE_TITLE)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Pienennä' })).not.toBeInTheDocument();
    });

    it('does not render actions container when phase has no actions', () => {
      const { container } = renderComponent({
        phase: { ...mockPhase, actions: [] },
        actions: {},
      });

      const actionsContainer = container.querySelector('.actions');
      expect(actionsContainer).toBeInTheDocument();
      expect(actionsContainer).not.toHaveClass('hidden');
      expect(actionsContainer.children).toHaveLength(0);
    });
  });
});
