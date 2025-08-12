import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Dropdown from '../Dropdown';
import renderWithProviders from '../../../utils/renderWithProviders';

const renderComponent = (itemsOverride) => {
  const dummyFunction = vi.fn();
  const dummyItems = [
    { action: dummyFunction, text: 'Dropdown Item 1' },
    { action: dummyFunction, text: 'Dropdown Item 2' },
  ];

  return renderWithProviders(
    <BrowserRouter>
      <Dropdown items={itemsOverride ?? dummyItems} />
    </BrowserRouter>,
  );
};

describe('<Dropdown />', () => {
  it('renders without crashing', () => {
    renderComponent();
  });

  it('opens the dropdown menu when the button is clicked', () => {
    renderComponent();
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Dropdown Item 1')).toBeInTheDocument();
  });

  it('closes the dropdown menu when clicking outside the menu', async () => {
    renderComponent();

    const user = userEvent.setup();

    const button = screen.getByRole('button');

    await user.click(button);
    await user.click(document.body);

    expect(screen.queryByText('Dropdown Item 1')).not.toBeInTheDocument();
  });

  it('calls the correct action when a dropdown item is clicked', () => {
    const dummyFunction = vi.fn();
    const dummyItems = [{ action: dummyFunction, text: 'Dropdown Item 1' }];

    renderComponent(dummyItems);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    const dropdownItem = screen.getByText('Dropdown Item 1');
    fireEvent.click(dropdownItem);
    expect(dummyFunction).toHaveBeenCalledTimes(1);
  });
});
