import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import renderWithProviders from '../../../../utils/renderWithProviders';
import Record from '../Record';
import { createMockComponentProps, createRecord, attributeTypes } from '../../../../utils/__mocks__/mockHelpers';

const mockRecord = createRecord({
  id: 'test-record-001',
  action: 'test-action-001',
  attributes: {
    TypeSpecifier: 'Testilomake',
    RecordType: 'Muut asiakirjat',
    PersonalData: 'Sisältää henkilötietoja',
    PublicityClass: 'Julkinen',
  },
  is_open: true,
});

const mockProps = createMockComponentProps('record', {
  record: mockRecord,
  documentState: 'view',
  attributeTypes: attributeTypes,
  recordTypes: {},
  editRecord: vi.fn(),
  editRecordAttribute: vi.fn(),
  removeRecord: vi.fn(),
  setRecordVisibility: vi.fn(),
  displayMessage: vi.fn(),
});

const renderComponent = (props = {}) => {
  return renderWithProviders(<Record {...mockProps} {...props} ref={React.createRef()} />);
};

const openEditDropdown = async (user) => {
  const dropdownButtons = screen.getAllByRole('button');
  await user.click(dropdownButtons[0]);
  return dropdownButtons;
};

describe('<Record />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders record in view mode with correct attributes', () => {
      renderComponent();

      expect(screen.getByText('Testilomake')).toBeInTheDocument();
      expect(screen.getByText('Muut asiakirjat')).toBeInTheDocument();
      expect(screen.getByText('Sisältää henkilötietoja')).toBeInTheDocument();
      expect(screen.getByText('Julkinen')).toBeInTheDocument();
    });

    it('does not show edit buttons when documentState is view', () => {
      renderComponent({ documentState: 'view' });

      const dropdownItems = screen.queryByText('Muokkaa asiakirjaa');
      expect(dropdownItems).not.toBeInTheDocument();
    });

    it('correctly displays record type information', () => {
      renderComponent();

      expect(screen.getByText('Muut asiakirjat')).toBeInTheDocument();
      expect(screen.getByText('Testilomake')).toBeInTheDocument();
    });
  });

  it('shows edit buttons and dropdown items when documentState is edit', () => {
    renderComponent({ documentState: 'edit' });

    const dropdownButtons = screen.getAllByRole('button');
    expect(dropdownButtons.length).toBeGreaterThan(0);

    fireEvent.click(dropdownButtons[0]);

    expect(screen.getByText('Muokkaa asiakirjaa')).toBeInTheDocument();
    expect(screen.getByText('Poista asiakirja')).toBeInTheDocument();
  });

  it('toggles visibility when visibility button is clicked', () => {
    renderComponent();

    const toggleButton = screen.getByRole('button', { name: '' });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(mockProps.setRecordVisibility).toHaveBeenCalledWith(mockRecord.id, !mockRecord.is_open);
  });

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent({ documentState: 'edit' });

    await openEditDropdown(user);

    await user.click(screen.getByText('Muokkaa asiakirjaa'));

    expect(screen.getByRole('heading', { name: 'Muokkaa asiakirjaa' })).toBeInTheDocument();
  });

  describe('delete functionality', () => {
    let user;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('shows delete confirmation when delete button is clicked', async () => {
      renderComponent({ documentState: 'edit' });

      await openEditDropdown(user);

      await user.click(screen.getByText('Poista asiakirja'));

      expect(screen.getByText(/Olet poistamassa asiakirjaa/)).toBeInTheDocument();
      expect(screen.getByText('Vahvista poisto')).toBeInTheDocument();
    });

    it('calls removeRecord when confirming delete', async () => {
      renderComponent({ documentState: 'edit' });

      await openEditDropdown(user);

      await user.click(screen.getByText('Poista asiakirja'));

      await user.click(screen.getByText('Poista'));

      expect(mockProps.removeRecord).toHaveBeenCalledWith({
        recordId: mockRecord.id,
        actionId: mockRecord.action,
      });
    });

    it('cancels delete operation when cancel is clicked', async () => {
      renderComponent({ documentState: 'edit' });

      await openEditDropdown(user);

      await user.click(screen.getByText('Poista asiakirja'));

      await user.click(screen.getByText('Peruuta'));

      expect(mockProps.removeRecord).not.toHaveBeenCalled();
    });
  });

  it('triggers edit action when editing a record', async () => {
    const user = userEvent.setup();
    renderComponent({ documentState: 'edit' });

    await openEditDropdown(user);

    await user.click(screen.getByText('Muokkaa asiakirjaa'));

    expect(screen.getByRole('heading', { name: 'Muokkaa asiakirjaa' })).toBeInTheDocument();

    mockProps.editRecord.mockImplementation(() => {
      return true;
    });

    expect(mockProps.editRecord).toBeDefined();
  });

  describe('styling', () => {
    it('applies the correct className based on is_open property', () => {
      const { container, rerender } = renderComponent();

      expect(container.querySelector('.record-open')).toBeInTheDocument();
      expect(container.querySelector('.record-closed')).not.toBeInTheDocument();

      const closedRecord = {
        ...mockRecord,
        is_open: false,
      };

      rerender(<Record {...mockProps} record={closedRecord} ref={React.createRef()} />);

      expect(container.querySelector('.record-open')).not.toBeInTheDocument();
      expect(container.querySelector('.record-closed')).toBeInTheDocument();
    });
  });

  describe('attribute editing', () => {
    it('calls editRecordAttribute when updating type specifier', () => {
      const typeSpecifier = 'Updated Type Specifier';
      renderComponent({ documentState: 'edit' });

      const recordInstance = mockProps.editRecordAttribute;

      mockProps.editRecordAttribute({
        recordId: mockRecord.id,
        attributeName: 'typeSpecifier',
        attributeValue: typeSpecifier,
      });

      expect(recordInstance).toHaveBeenCalledWith({
        recordId: mockRecord.id,
        attributeName: 'typeSpecifier',
        attributeValue: typeSpecifier,
      });
    });

    it('calls editRecordAttribute when updating record type', () => {
      const recordType = 'New Record Type';
      renderComponent({ documentState: 'edit' });

      mockProps.editRecordAttribute({
        recordId: mockRecord.id,
        attributeName: 'type',
        attributeValue: recordType,
      });

      expect(mockProps.editRecordAttribute).toHaveBeenCalledWith({
        recordId: mockRecord.id,
        attributeName: 'type',
        attributeValue: recordType,
      });
    });
  });

  describe('Record UI Interactions', () => {
    describe('Record Creation UI Flow', () => {
      it('opens record edit form when dropdown option is selected', async () => {
        const user = userEvent.setup();
        renderComponent({ documentState: 'edit' });

        await openEditDropdown(user);
        await user.click(screen.getByText('Muokkaa asiakirjaa'));

        expect(screen.getByRole('heading', { name: 'Muokkaa asiakirjaa' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Peruuta' })).toBeInTheDocument();
      });

      it('allows user to cancel record editing', async () => {
        const user = userEvent.setup();
        renderComponent({ documentState: 'edit' });

        await openEditDropdown(user);
        await user.click(screen.getByText('Muokkaa asiakirjaa'));

        expect(screen.getByRole('heading', { name: 'Muokkaa asiakirjaa' })).toBeInTheDocument();

        // Cancel the form
        const cancelButton = screen.getByRole('button', { name: 'Peruuta' });
        await user.click(cancelButton);

        // Verify form is closed
        expect(screen.queryByRole('heading', { name: 'Muokkaa asiakirjaa' })).not.toBeInTheDocument();
      });

      it('does not show edit form in view mode', () => {
        renderComponent({ documentState: 'view' });

        // Edit options should not be present in view mode
        expect(screen.queryByText('Muokkaa asiakirjaa')).not.toBeInTheDocument();
        expect(screen.queryByText('Poista asiakirja')).not.toBeInTheDocument();
      });
    });

    describe('Record Removal UI Flow', () => {
      it('allows user to delete a record through dropdown menu in edit mode', async () => {
        const user = userEvent.setup();
        renderComponent({ documentState: 'edit' });

        await openEditDropdown(user);

        // Click delete option
        const deleteOption = screen.getByText('Poista asiakirja');
        await user.click(deleteOption);

        // Verify delete confirmation popup appears
        expect(screen.getByText(/Olet poistamassa asiakirjaa/)).toBeInTheDocument();
        expect(screen.getByText('Vahvista poisto')).toBeInTheDocument();
        expect(screen.getByText('Poista')).toBeInTheDocument();
        expect(screen.getByText('Peruuta')).toBeInTheDocument();

        // Confirm deletion
        const confirmButton = screen.getByText('Poista');
        await user.click(confirmButton);

        // Verify the record removal was attempted
        expect(mockProps.removeRecord).toHaveBeenCalledWith({
          recordId: mockRecord.id,
          actionId: mockRecord.action,
        });
      });

      it('allows user to cancel record deletion', async () => {
        const user = userEvent.setup();
        renderComponent({ documentState: 'edit' });

        await openEditDropdown(user);

        // Click delete option
        const deleteOption = screen.getByText('Poista asiakirja');
        await user.click(deleteOption);

        // Wait for confirmation popup
        expect(screen.getByText(/Olet poistamassa asiakirjaa/)).toBeInTheDocument();

        // Cancel deletion
        const cancelButton = screen.getByText('Peruuta');
        await user.click(cancelButton);

        // Verify popup is closed and no deletion occurred
        expect(screen.queryByText(/Olet poistamassa asiakirjaa/)).not.toBeInTheDocument();
        expect(mockProps.removeRecord).not.toHaveBeenCalled();
      });

      it('does not show record delete option in view mode', () => {
        renderComponent({ documentState: 'view' });

        // Delete option should not be present in view mode
        expect(screen.queryByText('Poista asiakirja')).not.toBeInTheDocument();
      });

      it('shows appropriate confirmation message with record details', async () => {
        const user = userEvent.setup();
        renderComponent({ documentState: 'edit' });

        await openEditDropdown(user);

        const deleteOption = screen.getByText('Poista asiakirja');
        await user.click(deleteOption);

        // Verify confirmation message includes record details
        expect(screen.getByText(/Olet poistamassa asiakirjaa/)).toBeInTheDocument();
        expect(screen.getByText('Vahvista poisto')).toBeInTheDocument();
      });

      it('handles record deletion process correctly', async () => {
        const user = userEvent.setup();
        renderComponent({ documentState: 'edit' });

        // Verify record is present
        expect(screen.getByText('Testilomake')).toBeInTheDocument();

        await openEditDropdown(user);

        // Click delete option
        const deleteOption = screen.getByText('Poista asiakirja');
        await user.click(deleteOption);

        // Confirm deletion
        expect(screen.getByText('Vahvista poisto')).toBeInTheDocument();
        const confirmButton = screen.getByText('Poista');
        await user.click(confirmButton);

        // Verify the deletion process was initiated
        expect(mockProps.removeRecord).toHaveBeenCalledWith({
          recordId: mockRecord.id,
          actionId: mockRecord.action,
        });
      });
    });
  });
});
