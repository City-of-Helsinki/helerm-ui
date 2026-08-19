import { screen, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Popup from '../Popup';

describe('<Popup />', () => {
  const renderPopup = (props = {}) => {
    const closePopup = vi.fn();
    render(<Popup content={<div>Popup content</div>} closePopup={closePopup} {...props} />);

    return { closePopup };
  };

  it('renders content and default label', () => {
    renderPopup();

    expect(screen.getByText('Popup content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Ponnahdusikkuna');
  });

  it('closes on Escape key press', () => {
    const { closePopup } = renderPopup();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(closePopup).toHaveBeenCalledTimes(1);
  });

  it('does not close on other key presses', () => {
    const { closePopup } = renderPopup();

    fireEvent.keyDown(document, { key: 'Enter' });

    expect(closePopup).not.toHaveBeenCalled();
  });

  it('closes when clicking the outer background', async () => {
    const { closePopup } = renderPopup();

    await userEvent.click(screen.getByTestId('popup-component'));

    expect(closePopup).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the popup content', async () => {
    const { closePopup } = renderPopup();

    await userEvent.click(screen.getByTestId('popup-content'));

    expect(closePopup).not.toHaveBeenCalled();
  });

  it('closes when clicking the close button', async () => {
    const { closePopup } = renderPopup();

    await userEvent.click(screen.getByTestId('popup-close-button'));

    expect(closePopup).toHaveBeenCalledTimes(1);
  });
});
