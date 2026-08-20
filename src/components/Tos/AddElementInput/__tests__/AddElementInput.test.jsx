import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AddElementInput from '../AddElementInput';
import renderWithProviders from '../../../../utils/renderWithProviders';

describe('<AddElementInput />', () => {
  const mockSubmit = vi.fn((e) => e?.preventDefault?.());
  const mockCancel = vi.fn();
  const mockOnDefaultAttributeChange = vi.fn();
  const mockOnTypeSpecifierChange = vi.fn();
  const mockOnTypeInputChange = vi.fn();
  const mockOnTypeChange = vi.fn();
  const mockOnAddFormShowMore = vi.fn();

  const defaultProps = {
    type: 'phase',
    submit: mockSubmit,
    defaultAttributes: {
      PhaseType: {
        name: 'PhaseType',
        values: [
          { id: 'phase-1', value: 'Value1' },
          { id: 'phase-2', value: 'Value2' },
        ],
        multiIn: ['phase'],
      },
      TypeSpecifier: {
        name: 'TypeSpecifier',
        values: [],
        multiIn: [],
      },
    },
    typeOptions: [
      { id: 'type-1', value: 'TypeOption1' },
      { id: 'type-2', value: 'TypeOption2' },
    ],
    newDefaultAttributes: {},
    newTypeSpecifier: '',
    newType: '',
    onDefaultAttributeChange: mockOnDefaultAttributeChange,
    onTypeSpecifierChange: mockOnTypeSpecifierChange,
    onTypeInputChange: mockOnTypeInputChange,
    onTypeChange: mockOnTypeChange,
    cancel: mockCancel,
    onAddFormShowMore: mockOnAddFormShowMore,
    showMoreOrLess: false,
  };

  const renderComponent = (props = {}) => renderWithProviders(<AddElementInput {...defaultProps} {...props} />);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders phase header and type select when typeOptions exist', () => {
    renderComponent();
    expect(screen.getByText('Uusi käsittelyvaihe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Muu käsittelyvaihe')).toBeInTheDocument();
  });

  it('renders action header and hides the type select for action type', () => {
    renderComponent({ type: 'action' });
    expect(screen.getByText('Uusi toimenpide')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Toimenpiteen tyyppi')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Toimenpide')).toBeInTheDocument();
  });

  it('renders a plain text input for the type when typeOptions is empty', () => {
    renderComponent({ typeOptions: [] });
    expect(screen.getByPlaceholderText('Käsittelyvaiheen tyyppi')).toBeInTheDocument();
  });

  it('calls onTypeInputChange when typing into the plain type input', async () => {
    const user = userEvent.setup();
    renderComponent({ typeOptions: [] });
    const input = screen.getByPlaceholderText('Käsittelyvaiheen tyyppi');
    await user.type(input, 'a');
    expect(mockOnTypeInputChange).toHaveBeenCalled();
  });

  it('calls onTypeSpecifierChange when typing into the specifier input', async () => {
    const user = userEvent.setup();
    renderComponent();
    const input = screen.getByPlaceholderText('Muu käsittelyvaihe');
    await user.type(input, 'a');
    expect(mockOnTypeSpecifierChange).toHaveBeenCalled();
  });

  it('renders a plain input for default attributes without values', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('TypeSpecifier')).toBeInTheDocument();
  });

  it('calls onDefaultAttributeChange when typing into a plain default attribute input', async () => {
    const user = userEvent.setup();
    renderComponent();
    const input = screen.getByPlaceholderText('TypeSpecifier');
    await user.type(input, 'x');
    expect(mockOnDefaultAttributeChange).toHaveBeenCalled();
  });

  it('does not render default attribute inputs when defaultAttributes is empty', () => {
    renderComponent({ defaultAttributes: {} });
    expect(screen.queryByPlaceholderText('TypeSpecifier')).not.toBeInTheDocument();
  });

  it('shows "Näytä lisää" when showMoreOrLess is false and "Näytä vähemmän" when true', () => {
    const { rerender } = renderComponent();
    expect(screen.getByText('Näytä lisää')).toBeInTheDocument();

    rerender(<AddElementInput {...defaultProps} showMoreOrLess />);
    expect(screen.getByText('Näytä vähemmän')).toBeInTheDocument();
  });

  it('calls onAddFormShowMore, cancel handlers on button clicks', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText('Näytä lisää'));
    expect(mockOnAddFormShowMore).toHaveBeenCalledTimes(1);

    await user.click(screen.getByText('Peruuta'));
    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('submits the form when the OK button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByText('OK'));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('preselects newType value in the type select when provided', () => {
    renderComponent({ newType: 'TypeOption1' });
    expect(screen.getByText('TypeOption1')).toBeInTheDocument();
  });

  it('calls onTypeChange when selecting an option in the type select', async () => {
    const user = userEvent.setup();
    const { container } = renderComponent();

    const typeSelectInput = container.querySelector('.edit-phase-type__input input');
    await user.click(typeSelectInput);
    await user.click(screen.getByText('TypeOption2'));

    expect(mockOnTypeChange).toHaveBeenCalledWith('TypeOption2');
  });

  it('calls onDefaultAttributeChange when selecting an option in a default attribute select', async () => {
    const user = userEvent.setup();
    const { container } = renderComponent();

    const attributeSelectContainer = container.querySelectorAll('.form-control.edit-phase-type__input')[1];
    const input = attributeSelectContainer.querySelector('input');
    await user.click(input);
    await user.click(screen.getByText('Value2'));

    expect(mockOnDefaultAttributeChange).toHaveBeenCalledWith('PhaseType', ['Value2']);
  });
});
