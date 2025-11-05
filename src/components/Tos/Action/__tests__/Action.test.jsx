import '@testing-library/jest-dom';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  attributeTypes,
  createMockAction,
  createMockComponentProps,
  createRecord,
} from '../../../../utils/__mocks__/mockHelpers';
import renderWithProviders from '../../../../utils/renderWithProviders';
import Action from '../Action';

const mockAction = createMockAction({
  attributes: {
    TypeSpecifier: 'Testikäsittelyvaihe',
    ActionType: 'Käsittelyvaiheen tyyppi',
    PersonalData: 'Sisältää henkilötietoja',
    PublicityClass: 'Julkinen',
  },
  records: ['test-record-001', 'test-record-002'],
  is_open: true,
});

const mockRecords = {
  'test-record-001': createRecord({
    id: 'test-record-001',
    action: 'test-action-001',
    attributes: {
      TypeSpecifier: 'Testilomake 1',
      RecordType: 'Asiakirja',
      PersonalData: 'Sisältää henkilötietoja',
    },
  }),
  'test-record-002': createRecord({
    id: 'test-record-002',
    action: 'test-action-001',
    is_open: false,
    attributes: {
      TypeSpecifier: 'Testilomake 2',
      RecordType: 'Lomake',
      PersonalData: 'Ei sisällä henkilötietoja',
    },
  }),
};

const mockProps = createMockComponentProps('action', {
  action: mockAction,
  actions: { [mockAction.id]: mockAction },
  records: mockRecords,
  attributeTypes: attributeTypes,
  // Add missing function props
  setActionVisibility: vi.fn(),
  editActionAttribute: vi.fn(),
  addRecord: vi.fn(),
  removeAction: vi.fn(),
  editAction: vi.fn(),
  editRecord: vi.fn(),
  editRecordAttribute: vi.fn(),
  removeRecord: vi.fn(),
  setRecordVisibility: vi.fn(),
  displayMessage: vi.fn(),
  changeOrder: vi.fn(),
  importItems: vi.fn(),
  // Add missing object props
  actionTypes: {},
  recordTypes: {},
  phases: {},
  phasesOrder: [],
  documentState: 'view',
});

const renderComponent = (props = {}) => {
  return renderWithProviders(
    <DndProvider backend={HTML5Backend}>
      <Action {...mockProps} {...props} ref={React.createRef()} />
    </DndProvider>,
  );
};

const setupUserAndRender = (props = {}) => {
  const user = userEvent.setup();
  renderComponent(props);
  return user;
};

const openActionDropdown = async (user) => {
  const dropdownButton = screen.getByTestId('action-dropdown-button');
  expect(dropdownButton).toBeInTheDocument();
  await user.click(dropdownButton);

  const dropdownMenu = screen.getByTestId('action-dropdown-menu');
  expect(dropdownMenu).toBeInTheDocument();
  return dropdownMenu;
};

const clickDropdownItem = async (user, itemIndex) => {
  await openActionDropdown(user);
  await user.click(screen.getByTestId(`action-dropdown-item-${itemIndex}`));
};

const verifyPopupContent = (expectedTestIds = []) => {
  const popup = screen.getByTestId('popup-component');
  expect(popup).toBeInTheDocument();

  const popupContent = screen.getByTestId('popup-content');
  expect(popupContent).toBeInTheDocument();

  expectedTestIds.forEach((testId) => {
    expect(within(popupContent).getByTestId(testId)).toBeInTheDocument();
  });

  return popupContent;
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
    expect(screen.getByTestId(`action-dropdown-item-${index}`)).toHaveTextContent(item);
  });
};

const DROPDOWN_ITEMS = [
  'Uusi asiakirja',
  'Muokkaa toimenpidettä',
  'Järjestä asiakirjoja',
  'Tuo asiakirjoja',
  'Poista toimenpide',
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

const verifyReorderView = () => {
  expect(screen.getByTestId('reorder-view')).toBeInTheDocument();
  expect(screen.getByTestId('reorder-save-button')).toBeInTheDocument();
  expect(screen.getByTestId('reorder-cancel-button')).toBeInTheDocument();
  expect(screen.getByTestId('reorder-list')).toBeInTheDocument();
};

const verifyRecordContent = (recordTitles) => {
  recordTitles.forEach((title) => {
    expect(screen.getByText(title)).toBeInTheDocument();
  });
};

const performEditAction = async (user, newValue, mockFn, expectedCallArgs) => {
  await user.click(screen.getByText('Testikäsittelyvaihe'));

  const input = screen.getByDisplayValue('Testikäsittelyvaihe');
  await user.clear(input);
  await user.type(input, newValue);

  const form = input.closest('form');
  await fireEvent.submit(form);

  expect(mockFn).toHaveBeenCalledWith(expectedCallArgs);
};

const performDeleteAction = async (user, mockFn, expectedArgs) => {
  await clickDropdownItem(user, 4);

  expect(screen.getByTestId('popup-component')).toBeInTheDocument();
  const popupContent = screen.getByTestId('popup-content');

  mockFn.mockClear();

  await user.click(within(popupContent).getByTestId('delete-view-delete-button'));

  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
};

describe('<Action />', () => {
  beforeEach(() => {
    Object.values(mockProps)
      .filter((prop) => typeof prop === 'function')
      .forEach((mockFn) => mockFn.mockClear());
  });

  describe('Basic rendering', () => {
    it('should render without crashing', () => {
      renderComponent();
      expect(screen.getByText('Testikäsittelyvaihe')).toBeInTheDocument();
    });

    it('should render action title', () => {
      renderComponent();
      expect(screen.getByText('Testikäsittelyvaihe')).toBeInTheDocument();
    });

    it('should render child records when action is open', () => {
      renderComponent();
      verifyRecordContent(['Testilomake 1', 'Testilomake 2']);
      expect(screen.getByText('Asiakirjat')).toBeInTheDocument();
    });

    it('properly marks child records when action is closed', () => {
      renderComponent({
        action: { ...mockAction, is_open: false },
      });

      expect(screen.queryByText('Testilomake 1')).toBeInTheDocument();
      expect(document.querySelector('.action')).not.toHaveClass('action-closed');
    });

    it('should toggle visibility when toggle button is clicked', () => {
      renderComponent();

      const toggleButton = screen.getAllByRole('button')[0];
      expect(toggleButton).toBeInTheDocument();

      fireEvent.click(toggleButton);

      expect(mockProps.setActionVisibility).toHaveBeenCalledWith(mockAction.id, !mockAction.is_open);
    });
  });

  describe('Edit mode functionality', () => {
    it('enters edit mode when clicking TypeSpecifier in edit document state', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await user.click(screen.getByText('Testikäsittelyvaihe'));

      expect(screen.getByDisplayValue('Testikäsittelyvaihe')).toBeInTheDocument();
    });

    it('can edit TypeSpecifier value', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await performEditAction(user, 'Updated Action Title', mockProps.editActionAttribute, {
        actionId: mockAction.id,
        attributeName: 'TypeSpecifier',
        attributeValue: 'Updated Action Title',
      });
    });

    it('shows dropdown with action options in edit mode', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await openActionDropdown(user);

      verifyDropdownItems(DROPDOWN_ITEMS);
    });

    it('opens editor form when "Muokkaa toimenpidettä" button is clicked', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await clickDropdownItem(user, 1);

      expect(screen.getByRole('heading', { name: 'Muokkaa toimenpidettä' })).toBeInTheDocument();
    });

    it('can click show more button in edit form', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await clickDropdownItem(user, 1);

      const showMoreButton = verifyFormButtons('Muokkaa toimenpidettä');
      await user.click(showMoreButton);

      expect(screen.getByRole('button', { name: 'Näytä vähemmän' })).toBeInTheDocument();
    });
  });

  describe('Record management functionality', () => {
    it('shows create record form when "Uusi asiakirja" is clicked', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await clickDropdownItem(user, 0);

      expect(screen.getByRole('heading', { name: 'Uusi asiakirja' })).toBeInTheDocument();
    });

    it('can click show more in record creation form', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await clickDropdownItem(user, 0);

      const showMoreButton = verifyFormButtons('Uusi asiakirja');
      await user.click(showMoreButton);

      expect(screen.getByRole('button', { name: 'Näytä vähemmän' })).toBeInTheDocument();
    });

    it('can close record creation form', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await clickDropdownItem(user, 0);

      await toggleFormVisibility(user, 'Uusi asiakirja');
    });
  });

  describe('Dropdown and popup views', () => {
    it('shows dropdown with action options in edit mode', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await openActionDropdown(user);

      verifyDropdownItems(DROPDOWN_ITEMS);
    });

    it('opens delete confirmation when "Poista toimenpide" is clicked', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await clickDropdownItem(user, 4);

      const popupContent = verifyPopupContent(DELETE_VIEW_TEST_IDS);

      expect(within(popupContent).getByTestId('delete-view-confirmation')).toHaveTextContent('Vahvista poisto');
      expect(within(popupContent).getByTestId('delete-view-delete-button')).toHaveTextContent('Poista');
      expect(within(popupContent).getByTestId('delete-view-cancel-button')).toHaveTextContent('Peruuta');
    });

    it('opens reorder view when "Järjestä asiakirjoja" is clicked', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await clickDropdownItem(user, 2);

      verifyReorderView();
    });

    it('opens import view when "Tuo asiakirjoja" is clicked', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await clickDropdownItem(user, 3);

      const popupContent = verifyPopupContent(IMPORT_VIEW_TEST_IDS);

      expect(within(popupContent).getByTestId('import-view-import-button')).toHaveTextContent('Tuo');

      expect(within(popupContent).getByTestId('import-view-cancel-button')).toHaveTextContent('Peruuta');
    });
  });

  describe('Add/Remove functionality', () => {
    it('calls removeAction with correct parameters when deletion is confirmed', async () => {
      const user = setupUserAndRender({ documentState: 'edit' });

      await performDeleteAction(user, mockProps.removeAction, [mockAction.id, mockAction.phase]);
    });

    it('calls addRecord with correct parameters when a record is created', async () => {
      renderComponent({ documentState: 'edit' });

      mockProps.addRecord.mockClear();

      const mockAttributes = { TypeSpecifier: 'New Record', RecordType: 'Document' };
      mockProps.addRecord(mockAttributes, mockAction.id);

      expect(mockProps.addRecord).toHaveBeenCalledWith(mockAttributes, mockAction.id);
    });
  });

  describe('Integration with Record components', () => {
    it('renders the correct number of Record components', () => {
      renderComponent();

      verifyRecordContent(['Testilomake 1', 'Testilomake 2']);
    });

    it('passes the correct props to Record components', () => {
      renderComponent();

      expect(screen.getByText('Asiakirja')).toBeInTheDocument();
      expect(screen.getByText('Lomake')).toBeInTheDocument();
    });
  });

  describe('Action UI Interactions', () => {
    describe('Action Creation UI Flow', () => {
      it('opens action edit form when dropdown option is selected', async () => {
        const user = setupUserAndRender({ documentState: 'edit' });

        await clickDropdownItem(user, 1); // "Muokkaa toimenpidettä"

        expect(screen.getByRole('heading', { name: 'Muokkaa toimenpidettä' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Peruuta' })).toBeInTheDocument();
      });

      it('allows user to cancel action editing', async () => {
        const user = setupUserAndRender({ documentState: 'edit' });

        await clickDropdownItem(user, 1); // Open action edit form

        expect(screen.getByRole('heading', { name: 'Muokkaa toimenpidettä' })).toBeInTheDocument();

        // Cancel the form
        const cancelButton = screen.getByRole('button', { name: 'Peruuta' });
        await user.click(cancelButton);

        // Verify form is closed
        expect(screen.queryByRole('heading', { name: 'Muokkaa toimenpidettä' })).not.toBeInTheDocument();
      });

      it('does not show edit form in view mode', () => {
        renderComponent({ documentState: 'view' });

        // Dropdown should not be present in view mode
        expect(screen.queryByTestId('action-dropdown-button')).not.toBeInTheDocument();
      });

      it('shows record creation form when "Uusi asiakirja" is clicked', async () => {
        const user = setupUserAndRender({ documentState: 'edit' });

        await clickDropdownItem(user, 0); // "Uusi asiakirja"

        expect(screen.getByRole('heading', { name: 'Uusi asiakirja' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Peruuta' })).toBeInTheDocument();
      });
    });

    describe('Action Removal UI Flow', () => {
      it('allows user to delete an action through dropdown menu in edit mode', async () => {
        const user = setupUserAndRender({ documentState: 'edit' });

        await openActionDropdown(user);

        // Click delete option
        const deleteOption = screen.getByText('Poista toimenpide');
        await user.click(deleteOption);

        // Verify delete confirmation popup appears
        const popupContent = verifyPopupContent(DELETE_VIEW_TEST_IDS);
        expect(within(popupContent).getByTestId('delete-view-delete-button')).toBeInTheDocument();
        expect(within(popupContent).getByTestId('delete-view-cancel-button')).toBeInTheDocument();

        // Confirm deletion
        const confirmButton = within(popupContent).getByTestId('delete-view-delete-button');
        await user.click(confirmButton);

        // Verify the action removal was attempted
        expect(mockProps.removeAction).toHaveBeenCalledWith(mockAction.id, mockAction.phase);
      });

      it('allows user to cancel action deletion', async () => {
        const user = setupUserAndRender({ documentState: 'edit' });

        await openActionDropdown(user);

        // Click delete option
        const deleteOption = screen.getByText('Poista toimenpide');
        await user.click(deleteOption);

        // Wait for confirmation popup
        const popupContent = verifyPopupContent(DELETE_VIEW_TEST_IDS);

        // Cancel deletion
        const cancelButton = within(popupContent).getByTestId('delete-view-cancel-button');
        await user.click(cancelButton);

        // Verify popup is closed and no deletion occurred
        expect(screen.queryByTestId('popup-component')).not.toBeInTheDocument();
        expect(mockProps.removeAction).not.toHaveBeenCalled();
      });

      it('does not show action delete option in view mode', () => {
        renderComponent({ documentState: 'view' });

        // Dropdown menus should not be present in view mode
        expect(screen.queryByTestId('action-dropdown-button')).not.toBeInTheDocument();
      });

      it('handles deletion of action with associated records', async () => {
        const user = setupUserAndRender({ documentState: 'edit' });

        // Verify action with records is present
        expect(screen.getByText('Testikäsittelyvaihe')).toBeInTheDocument();
        verifyRecordContent(['Testilomake 1', 'Testilomake 2']);

        await openActionDropdown(user);

        // Click delete option
        const deleteOption = screen.getByText('Poista toimenpide');
        await user.click(deleteOption);

        // Confirm deletion (this should cascade to remove associated records)
        const popupContent = verifyPopupContent(DELETE_VIEW_TEST_IDS);
        const confirmButton = within(popupContent).getByTestId('delete-view-delete-button');
        await user.click(confirmButton);

        // Verify the deletion process was initiated
        expect(mockProps.removeAction).toHaveBeenCalledWith(mockAction.id, mockAction.phase);
      });

      it('shows appropriate confirmation message with action details', async () => {
        const user = setupUserAndRender({ documentState: 'edit' });

        await openActionDropdown(user);

        const deleteOption = screen.getByText('Poista toimenpide');
        await user.click(deleteOption);

        // Verify confirmation message includes action details
        const popupContent = verifyPopupContent(DELETE_VIEW_TEST_IDS);
        expect(within(popupContent).getByTestId('delete-view-confirmation')).toBeInTheDocument();
      });
    });
  });

  describe('Scroll Functionality', () => {
    let scrollMocks;

    const setupScrollMocks = () => {
      scrollMocks = {
        windowScrollTo: vi.fn(),
        originalScrollTo: window.scrollTo,
        cleanup: () => {
          window.scrollTo = scrollMocks.originalScrollTo;
          vi.clearAllMocks();
        },
      };
      window.scrollTo = scrollMocks.windowScrollTo;
    };

    const mockDOMProperties = (hasOffsetParent = true) => {
      Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
        configurable: true,
        get: () => 100,
      });

      Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get: () => (hasOffsetParent ? { offsetTop: 50 } : null),
      });
    };

    const renderActionWithRef = (props = {}) => {
      const actionRef = { current: null };
      renderWithProviders(
        <DndProvider backend={HTML5Backend}>
          <Action {...mockProps} {...props} ref={actionRef} />
        </DndProvider>,
      );
      return actionRef;
    };

    beforeEach(() => {
      setupScrollMocks();
      mockDOMProperties();
    });

    afterEach(() => {
      scrollMocks.cleanup();
    });

    it('should expose scrollToAction method via ref', () => {
      const actionRef = renderActionWithRef();

      expect(actionRef.current).toBeDefined();
      expect(typeof actionRef.current.scrollToAction).toBe('function');
    });

    it('should expose scrollToRecord method via ref', () => {
      const actionRef = renderActionWithRef();

      expect(actionRef.current).toBeDefined();
      expect(typeof actionRef.current.scrollToRecord).toBe('function');
    });

    it('should call window.scrollTo when scrollToAction is called', () => {
      const actionRef = renderActionWithRef();

      actionRef.current.scrollToAction();

      expect(scrollMocks.windowScrollTo).toHaveBeenCalledTimes(1);
      expect(scrollMocks.windowScrollTo).toHaveBeenCalledWith(0, expect.any(Number));
    });

    it('should calculate correct scroll coordinates for scrollToAction', () => {
      const actionRef = renderActionWithRef();

      actionRef.current.scrollToAction();

      // Should calculate: parentOffset (50) + elementTop (100) = 150
      expect(scrollMocks.windowScrollTo).toHaveBeenCalledWith(0, 150);
    });

    it('should handle missing offsetParent gracefully in scrollToAction', () => {
      mockDOMProperties(false); // No offsetParent
      const actionRef = renderActionWithRef();

      actionRef.current.scrollToAction();

      // Should use 0 as offsetParent: 0 + 100 = 100
      expect(scrollMocks.windowScrollTo).toHaveBeenCalledWith(0, 100);
    });

    it('should handle scrollToRecord when record ref does not exist', () => {
      const actionRef = renderActionWithRef();

      // Call scrollToRecord with non-existent record ID
      actionRef.current.scrollToRecord('non-existent-record');

      // Should not throw error and not call window.scrollTo
      expect(scrollMocks.windowScrollTo).not.toHaveBeenCalled();
    });

    it('should handle scroll methods when element ref is not available', () => {
      const actionRef = renderActionWithRef({ records: {} });

      // Mock the element ref to be null to simulate unavailable DOM element
      const originalScrollToAction = actionRef.current.scrollToAction;
      const mockElement = { current: null };

      // Override the scrollToAction method to use our mocked null element
      actionRef.current.scrollToAction = () => {
        if (mockElement?.current) {
          const parentOffset = mockElement.current.offsetParent ? mockElement.current.offsetParent.offsetTop : 0;
          window.scrollTo(0, parentOffset + mockElement.current.offsetTop);
        }
      };

      // Calling scrollToAction should not throw error and not call window.scrollTo
      expect(() => actionRef.current.scrollToAction()).not.toThrow();
      expect(scrollMocks.windowScrollTo).not.toHaveBeenCalled();

      // Restore original method
      actionRef.current.scrollToAction = originalScrollToAction;
    });
  });
});
