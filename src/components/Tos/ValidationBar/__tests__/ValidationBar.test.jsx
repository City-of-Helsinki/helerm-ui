import React from 'react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithProviders from '../../../../utils/renderWithProviders';
import attributeRules from '../../../../utils/mocks/attributeRules.json';
import errorsAndWarningsTOS from '../../../../utils/mocks/errorsAndWarningsTOS.json';
import validTOS from '../../../../utils/mocks/validTOS.json';
import ValidationBar from '../ValidationBar';

const baseMocks = {
  setValidationVisibility: vi.fn(),
  selectedTOS: errorsAndWarningsTOS,
};

const renderComponent = (history, mocks = baseMocks) =>
  renderWithProviders(
    <Router history={history}>
      <ValidationBar
        selectedTOS={mocks.selectedTOS}
        attributeTypes={attributeRules}
        scrollToMetadata={vi.fn()}
        scrollToType={vi.fn()}
        top={0}
        setValidationVisibility={mocks.setValidationVisibility}
      />
    </Router>,
    {
      history,
    },
  );

describe('<Navigation />', () => {
  it('should render correctly', () => {
    const history = createBrowserHistory();

    const { container } = renderComponent(history);

    expect(container).toMatchSnapshot();
  });

  it('should change filter', async () => {
    const history = createBrowserHistory();

    renderComponent(history);

    const allFilter = screen.getByRole('button', { name: 'Kaikki' });
    const warningsFilter = screen.getByRole('button', { name: 'Huomautukset' });
    const errorsFilter = screen.getByRole('button', { name: 'Virheet' });

    const user = userEvent.setup();

    await user.click(warningsFilter);

    const activeClassName = 'btn-default';

    expect(warningsFilter).toHaveClass(activeClassName);
    expect(allFilter).not.toHaveClass(activeClassName);
    expect(errorsFilter).not.toHaveClass(activeClassName);

    await user.click(allFilter);

    expect(allFilter).toHaveClass(activeClassName);
    expect(warningsFilter).not.toHaveClass(activeClassName);
    expect(errorsFilter).not.toHaveClass(activeClassName);

    await user.click(errorsFilter);

    expect(errorsFilter).toHaveClass(activeClassName);
    expect(allFilter).not.toHaveClass(activeClassName);
    expect(warningsFilter).not.toHaveClass(activeClassName);

    await user.click(allFilter);

    expect(allFilter).toHaveClass(activeClassName);
    expect(warningsFilter).not.toHaveClass(activeClassName);
    expect(errorsFilter).not.toHaveClass(activeClassName);
  });

  it('should close validation bar', async () => {
    const history = createBrowserHistory();

    const mockSetValidationVisibility = vi.fn();
    const mocks = { ...baseMocks, setValidationVisibility: mockSetValidationVisibility };

    renderComponent(history, mocks);

    const closeButton = screen.getAllByRole('button')[0];

    const user = userEvent.setup();

    await user.click(closeButton);

    expect(mockSetValidationVisibility).toHaveBeenCalled();
  });

  it('should render errors for invalid TOS', () => {
    const history = createBrowserHistory();

    renderComponent(history);
    // find error group
    expect(screen.getByRole('heading', { name: 'Käsittelyprosessi' })).toBeInTheDocument();
    // find correct errors
    expect(screen.getByText('Julkisuusluokka')).toBeInTheDocument();
    expect(screen.getByText('Säilytysajan laskentaperuste')).toBeInTheDocument();
    expect(screen.getByText('Rekisteröinti/ Tietojärjestelmä')).toBeInTheDocument();
  });

  it('should not render errors for valid TOS', () => {
    const history = createBrowserHistory();

    const mocks = { ...baseMocks, selectedTOS: validTOS };

    renderComponent(history, mocks);

    expect(screen.queryByRole('heading', { name: 'Käsittelyprosessi' })).not.toBeInTheDocument();
  });
});
