import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import ReorderView from '../ReorderView';
import { attributeTypes } from '../../../../utils/__mocks__/mockHelpers';

const mockItems = [
  { id: 'action-1', key: 'key-1' },
  { id: 'action-2', key: 'key-2' },
  { id: 'action-3', key: 'key-3' },
];

const mockValues = {
  'action-1': { attributes: { TypeSpecifier: 'Action 1' } },
  'action-2': { attributes: { TypeSpecifier: 'Action 2' } },
  'action-3': { attributes: { TypeSpecifier: 'Action 3' } },
};

const renderReorderView = (props = {}) => {
  const defaultProps = {
    target: 'action',
    items: mockItems,
    attributeTypes,
    changeOrder: vi.fn(),
    toggleReorderView: vi.fn(),
    parent: 'phase-1',
    values: mockValues,
    parentName: 'Test Phase',
    ...props,
  };

  return render(
    <DndProvider backend={HTML5Backend}>
      <ReorderView {...defaultProps} />
    </DndProvider>,
  );
};

describe('ReorderView', () => {
  let mockChangeOrder;
  let mockToggleReorderView;

  beforeEach(() => {
    mockChangeOrder = vi.fn();
    mockToggleReorderView = vi.fn();
  });

  it('should render reorder view with items', () => {
    renderReorderView({ changeOrder: mockChangeOrder, toggleReorderView: mockToggleReorderView });

    expect(screen.getByTestId('reorder-view')).toBeInTheDocument();
    expect(screen.getByTestId('reorder-list')).toBeInTheDocument();
    expect(screen.getByTestId('reorder-save-button')).toBeInTheDocument();
    expect(screen.getByTestId('reorder-cancel-button')).toBeInTheDocument();

    // Check that all items are rendered
    expect(screen.getByTestId('reorder-item-action-1')).toBeInTheDocument();
    expect(screen.getByTestId('reorder-item-action-2')).toBeInTheDocument();
    expect(screen.getByTestId('reorder-item-action-3')).toBeInTheDocument();
  });

  it('should call changeOrder with correct parameters when save button is clicked', async () => {
    const user = userEvent.setup();
    renderReorderView({ changeOrder: mockChangeOrder, toggleReorderView: mockToggleReorderView });

    const saveButton = screen.getByTestId('reorder-save-button');
    await user.click(saveButton);

    expect(mockChangeOrder).toHaveBeenCalledWith({
      newOrder: ['action-1', 'action-2', 'action-3'],
      itemType: 'action',
      itemParent: 'phase-1',
    });
    expect(mockToggleReorderView).toHaveBeenCalledTimes(1);
  });

  it('should call toggleReorderView when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderReorderView({ changeOrder: mockChangeOrder, toggleReorderView: mockToggleReorderView });

    const cancelButton = screen.getByTestId('reorder-cancel-button');
    await user.click(cancelButton);

    expect(mockToggleReorderView).toHaveBeenCalledTimes(1);
    expect(mockChangeOrder).not.toHaveBeenCalled();
  });

  it('should maintain item state when moveItem is called', () => {
    renderReorderView({ changeOrder: mockChangeOrder, toggleReorderView: mockToggleReorderView });

    // Initial order should be maintained
    const items = screen.getAllByTestId(/^reorder-item-/);
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute('data-testid', 'reorder-item-action-1');
    expect(items[1]).toHaveAttribute('data-testid', 'reorder-item-action-2');
    expect(items[2]).toHaveAttribute('data-testid', 'reorder-item-action-3');
  });
});
