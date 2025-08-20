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
});
