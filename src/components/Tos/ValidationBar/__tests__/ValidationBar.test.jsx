import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import renderWithProviders from '../../../../utils/renderWithProviders';
import { attributeTypes, errorsAndWarningsTOS } from '../../../../utils/__mocks__/mockHelpers';
import ValidationBar from '../ValidationBar';
import storeCreator from '../../../../store/createStore';

const baseMocks = {
  setValidationVisibility: vi.fn(),
  selectedTOS: errorsAndWarningsTOS,
};

const renderComponent = (mocks = baseMocks, mockStore) => {
  const store = mockStore ?? storeCreator({ selectedTOS: mocks.selectedTOS, ui: { attributeTypes } });

  return renderWithProviders(
    <BrowserRouter>
      <ValidationBar scrollToMetadata={vi.fn()} scrollToType={vi.fn()} top={0} />
    </BrowserRouter>,
    {
      store,
    },
  );
};

describe('<ValidationBar />', () => {
  it('should render correctly', () => {
    renderComponent();
  });

  it('should change filter', async () => {
    renderComponent();

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
    const mocks = { ...baseMocks };

    const middlewares = [thunk];
    const mockStore = configureMockStore(middlewares);

    const store = mockStore({ selectedTOS: mocks.selectedTOS, ui: { attributeTypes } });

    renderComponent(undefined, store);

    const closeButton = screen.getAllByRole('button')[0];

    const user = userEvent.setup();

    await user.click(closeButton);

    const expected = [{ type: 'validation/setValidationVisibility', payload: false }];

    expect(store.getActions()).toEqual(expected);
  });

  it('should render errors for invalid TOS', () => {
    renderComponent();
    // find error group
    expect(screen.getByText('Käsittelyprosessi')).toBeInTheDocument();
    // find correct errors
    expect(screen.getByText('Julkisuusluokka')).toBeInTheDocument();
  });
});
