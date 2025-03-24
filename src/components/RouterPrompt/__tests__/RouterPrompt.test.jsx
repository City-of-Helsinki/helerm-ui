import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { createMemoryHistory } from 'history';
import { Button } from 'hds-react';

import RouterPrompt from '../RouterPrompt';
import renderWithProviders from '../../../utils/renderWithProviders';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual('react-router-dom');

  return {
    ...mod,
    useBlocker: () => ({
      location: {
        pathname: '/somewhere',
      },
      proceed: vi.fn(),
      reset: vi.fn(),
    }),
  };
});

describe('<RouterPrompt />', () => {
  const mockOnOK = vi.fn().mockResolvedValue(true);
  const mockOnCancel = vi.fn().mockResolvedValue(true);

  const renderComponent = (when) => {
    const store = mockStore({});

    const history = createMemoryHistory({ initialEntries: ['/'] });

    const router = createBrowserRouter(
      [
        {
          path: '/',
          element: (
            <>
              <Button
                onClick={() => {
                  history.push('/somewhere');
                }}
              >
                Navigate
              </Button>
              <RouterPrompt when={when} onOK={mockOnOK} onCancel={mockOnCancel} />
            </>
          ),
        },
        {
          path: '/somewhere',
          element: <div>Hello</div>,
        },
      ],
      { basename: '/' },
    );

    return renderWithProviders(<RouterProvider router={router} />, { store, history });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render the dialog when `when` is false', () => {
    renderComponent(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render the dialog when `when` is true and navigation is attempted', async () => {
    renderComponent(true);

    fireEvent.click(screen.getByText('Navigate'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it('should call onOK and proceed when "Jatka" button is clicked', async () => {
    renderComponent(true);

    fireEvent.click(screen.getByText('Navigate'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Jatka'));

    await waitFor(() => expect(mockOnOK).toHaveBeenCalled());
  });

  it('should call onCancel and reset when "Peruuta" button is clicked', async () => {
    renderComponent(true);

    fireEvent.click(screen.getByText('Navigate'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Peruuta'));

    await waitFor(() => expect(mockOnCancel).toHaveBeenCalled());
  });
});
