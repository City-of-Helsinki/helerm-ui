import { BrowserRouter } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithProviders, { createTestStore } from '../../../../utils/renderWithProviders';
import { attributeTypes, errorsAndWarningsTOS } from '../../../../utils/__mocks__/mockHelpers';
import ValidationBar from '../ValidationBar';
import storeCreator from '../../../../store/createStore';

const baseMocks = {
  setValidationVisibility: vi.fn(),
  selectedTOS: errorsAndWarningsTOS,
};

const renderComponent = (mocks = baseMocks, mockStore, props = {}) => {
  const store =
    mockStore ??
    storeCreator({ selectedTOS: mocks.selectedTOS, ui: { attributeTypes: mocks.attributeTypes ?? attributeTypes } });

  return renderWithProviders(
    <BrowserRouter>
      <ValidationBar scrollToMetadata={vi.fn()} scrollToType={vi.fn()} top={0} {...props} />
    </BrowserRouter>,
    {
      store,
    },
  );
};

// Custom, minimal attribute types with required/allowedIn/warning rules so we can
// deterministically exercise phase/action/record level validation branches.
const treeAttributeTypes = {
  PhaseType: {
    name: 'Käsittelyvaiheen tyyppi',
    values: [],
    allowedIn: ['phase'],
    requiredIn: ['phase'],
    required: true,
    requiredIf: [],
    allowValuesOutsideChoicesIn: [],
  },
  ActionType: {
    name: 'Toimenpiteen tyyppi',
    values: [],
    allowedIn: ['action'],
    requiredIn: ['action'],
    required: true,
    requiredIf: [],
    allowValuesOutsideChoicesIn: [],
  },
  RecordType: {
    name: 'Asiakirjatyyppi',
    values: [],
    allowedIn: ['record'],
    requiredIn: ['record'],
    required: true,
    requiredIf: [],
    allowValuesOutsideChoicesIn: [],
  },
  TypeSpecifier: {
    name: 'Tarkenne',
    values: [],
    allowedIn: ['phase', 'action', 'record'],
    requiredIn: [],
    required: false,
    requiredIf: [],
    allowValuesOutsideChoicesIn: [],
  },
  InformationSystem: {
    name: 'Tietojärjestelmä',
    values: [{ value: 'Ahjo' }],
    allowedIn: ['function'],
    requiredIn: [],
    required: false,
    requiredIf: [],
    allowValuesOutsideChoicesIn: ['function'],
  },
};

const treeTOS = {
  id: 'tos-with-tree',
  attributes: { InformationSystem: ['Ahjo', 'Tietojärjestelmä'] },
  phases: {
    phase1: {
      id: 'phase1',
      attributes: { TypeSpecifier: 'Phase One' },
      actions: ['action1'],
    },
    phaseWithoutErrors: {
      id: 'phaseWithoutErrors',
      attributes: { PhaseType: 'set', TypeSpecifier: 'Phase Two' },
      actions: [],
    },
  },
  actions: {
    action1: {
      id: 'action1',
      attributes: { TypeSpecifier: 'Action One' },
      records: ['record1'],
    },
  },
  records: {
    record1: {
      id: 'record1',
      attributes: { TypeSpecifier: 'Record One' },
    },
  },
};

const validTreeTOS = {
  id: 'valid-tos',
  attributes: {},
  phases: {},
  actions: {},
  records: {},
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

    const store = createTestStore({ selectedTOS: mocks.selectedTOS, ui: { attributeTypes } });

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

  it('should render the TOS-level warning attribute in addition to errors', () => {
    renderComponent({ selectedTOS: treeTOS, attributeTypes: treeAttributeTypes });

    expect(screen.getByText('Tietojärjestelmä')).toBeInTheDocument();
  });

  it('should render nested phase/action/record errors and allow scrolling to a section', async () => {
    const scrollToType = vi.fn();
    const store = storeCreator({ selectedTOS: treeTOS, ui: { attributeTypes: treeAttributeTypes } });

    renderComponent(undefined, store, { scrollToType });

    // Phase, action and record names should be visible since each is missing its type attribute.
    expect(screen.getByText('Phase One')).toBeInTheDocument();
    expect(screen.getByText('Action One')).toBeInTheDocument();
    expect(screen.getByText('Record One')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Phase One'));

    expect(scrollToType).toHaveBeenCalledWith('phase', 'phase1');
  });

  it('should scroll to a section when Enter is pressed on the section name', async () => {
    const scrollToType = vi.fn();
    const store = storeCreator({ selectedTOS: treeTOS, ui: { attributeTypes: treeAttributeTypes } });

    renderComponent(undefined, store, { scrollToType });

    const user = userEvent.setup();
    const phaseButton = screen.getByText('Phase One');
    phaseButton.focus();
    await user.keyboard('{Enter}');

    expect(scrollToType).toHaveBeenCalledWith('phase', 'phase1');
  });

  it('should scroll to metadata when Enter is pressed on the "Käsittelyprosessi" button', async () => {
    const scrollToMetadata = vi.fn();
    renderComponent(baseMocks, undefined, { scrollToMetadata });

    const user = userEvent.setup();
    const metadataButton = screen.getByText('Käsittelyprosessi');
    metadataButton.focus();
    await user.keyboard('{Enter}');

    expect(scrollToMetadata).toHaveBeenCalled();
  });

  it('should render the all-clear icon when there are no validation issues', () => {
    renderComponent({ selectedTOS: validTreeTOS, attributeTypes: treeAttributeTypes });

    expect(document.querySelector('.no-missing-attributes .fa-circle-check')).toBeInTheDocument();
  });

  it('should not render sidebar content when selectedTOS has no id', () => {
    renderComponent({ selectedTOS: { ...validTreeTOS, id: undefined }, attributeTypes: treeAttributeTypes });

    expect(document.querySelector('.sidebar-content')).not.toBeInTheDocument();
  });
});
