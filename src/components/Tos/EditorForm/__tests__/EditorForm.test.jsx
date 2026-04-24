import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EditorForm from '../EditorForm';
import attributeRulesData from '../../../../utils/__mocks__/api/attributeRules.json';

// Derive expected attribute counts from mock data, mirroring the component's own logic.
const functionAllowedAttrs = Object.values(attributeRulesData).filter((attr) =>
  attr.allowedIn.includes('function'),
);

// Mirrors getAttributesToShow with empty attributes: only required=true attributes are shown.
const FUNCTION_REQUIRED_COUNT = functionAllowedAttrs.filter((attr) => attr.required).length;

// Mirrors getComplementAttributes with empty attributes: attributes with a non-empty requiredIf
// are excluded because their conditions aren't met when no attribute values are set.
const FUNCTION_ALL_COUNT = functionAllowedAttrs.filter((attr) => attr.requiredIf.length === 0).length;

const defaultProps = {
  additionalFields: [],
  attributeTypes: attributeRulesData,
  attributes: {},
  closeEditorForm: vi.fn(),
  complementRecordAdd: vi.fn(),
  displayMessage: vi.fn(),
  editMetaDataWithForm: vi.fn(),
  editorConfig: { type: 'function', action: 'edit' },
  elementConfig: { editWithForm: vi.fn(), elementTypes: {}, createRecord: vi.fn() },
  onShowMore: vi.fn(),
  onShowMoreForm: vi.fn(),
  targetId: 'targetid-123456789',
};

const renderComponent = (props = {}) => render(<EditorForm {...defaultProps} {...props} />);

describe('<EditorForm />', () => {
  it('should render correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
  });

  describe('Rendering variations', () => {
    it('renders the correct heading for function/edit', () => {
      renderComponent();

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
    });

    it('renders the correct heading for function/complement', () => {
      renderComponent({ editorConfig: { type: 'function', action: 'complement' } });

      expect(screen.getByText('Käsittelyprosessin tiedot')).toBeInTheDocument();
    });

    it('does not render the type specifier field for function type', () => {
      renderComponent();

      expect(screen.queryByTestId('editor-form-type-specifier')).not.toBeInTheDocument();
    });

    it('renders the type specifier field for phase type', () => {
      renderComponent({
        editorConfig: { type: 'phase', action: 'edit' },
        elementConfig: {
          editWithForm: vi.fn(),
          elementTypes: { test: { value: 'Neuvonta/Ohjaus', id: 'test-phase-type' } },
          createRecord: vi.fn(),
        },
      });

      expect(screen.getByTestId('editor-form-type-specifier')).toBeInTheDocument();
    });

    it('does not render the show-more button for version type', () => {
      renderComponent({ editorConfig: { type: 'version', action: 'edit' } });

      expect(screen.queryByTestId('editor-form-show-more')).not.toBeInTheDocument();
    });
  });

  describe('Show more / show less toggle', () => {
    it('initially shows only required attributes for function/edit', () => {
      const { container } = renderComponent();

      expect(container.querySelectorAll('.form-group')).toHaveLength(FUNCTION_REQUIRED_COUNT);
    });

    it('shows "Näytä lisää" label initially for function/edit', () => {
      renderComponent();

      expect(screen.getByTestId('editor-form-show-more')).toHaveTextContent('Näytä lisää');
    });

    it('reveals all allowed attributes after clicking show more', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent();

      await user.click(screen.getByTestId('editor-form-show-more'));

      expect(container.querySelectorAll('.form-group')).toHaveLength(FUNCTION_ALL_COUNT);
    });

    it('changes button label to "Näytä vähemmän" after clicking show more', async () => {
      const user = userEvent.setup();
      renderComponent();

      await user.click(screen.getByTestId('editor-form-show-more'));

      expect(screen.getByTestId('editor-form-show-more')).toHaveTextContent('Näytä vähemmän');
    });

    it('collapses back to required attributes on second click', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent();

      await user.click(screen.getByTestId('editor-form-show-more'));
      await user.click(screen.getByTestId('editor-form-show-more'));

      expect(container.querySelectorAll('.form-group')).toHaveLength(FUNCTION_REQUIRED_COUNT);
    });

    it('calls onShowMore when the show-more button is clicked', async () => {
      const onShowMore = vi.fn();
      const user = userEvent.setup();
      renderComponent({ onShowMore });

      await user.click(screen.getByTestId('editor-form-show-more'));

      expect(onShowMore).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form submission', () => {
    it('calls editMetaDataWithForm when the form is submitted', async () => {
      const editMetaDataWithForm = vi.fn();
      const user = userEvent.setup();
      renderComponent({ editMetaDataWithForm });

      await user.click(screen.getByTestId('editor-form-submit'));

      expect(editMetaDataWithForm).toHaveBeenCalledTimes(1);
    });

    it('passes attribute values as a plain key-value object to editMetaDataWithForm', async () => {
      const editMetaDataWithForm = vi.fn();
      const user = userEvent.setup();
      renderComponent({ editMetaDataWithForm });

      await user.click(screen.getByTestId('editor-form-submit'));

      const [passedAttributes] = editMetaDataWithForm.mock.calls[0];
      expect(typeof passedAttributes).toBe('object');
      // Values should be primitives (strings/null), not { value, checked } objects
      Object.values(passedAttributes).forEach((val) => {
        expect(val === null || typeof val === 'string').toBe(true);
      });
    });
  });

  describe('Cancel', () => {
    it('calls closeEditorForm when Peruuta is clicked', async () => {
      const closeEditorForm = vi.fn();
      const user = userEvent.setup();
      renderComponent({ closeEditorForm });

      await user.click(screen.getByTestId('editor-form-cancel'));

      expect(closeEditorForm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Checkbox interaction', () => {
    it('disables the associated textarea when its checkbox is unchecked', async () => {
      const user = userEvent.setup();
      // AdditionalInformation has no dropdown values so it renders a plain textarea,
      // and passing it as a pre-filled attribute makes it appear in edit mode.
      const { container } = renderComponent({
        attributes: { AdditionalInformation: 'some note' },
      });

      const textarea = container.querySelector('textarea.additional-information');
      expect(textarea).toBeInTheDocument();
      expect(textarea).not.toBeDisabled();

      const checkbox = textarea.closest('.form-group').querySelector('input[type="checkbox"]');
      await user.click(checkbox);

      expect(textarea).toBeDisabled();
    });
  });

  describe('Complement action', () => {
    it('shows all allowed attributes immediately without needing to click show more', () => {
      const { container } = renderComponent({
        editorConfig: { type: 'function', action: 'complement' },
      });

      expect(container.querySelectorAll('.form-group')).toHaveLength(FUNCTION_ALL_COUNT);
    });

    it('shows "Näytä vähemmän" label for complement action', () => {
      renderComponent({
        editorConfig: { type: 'function', action: 'complement' },
      });

      expect(screen.getByTestId('editor-form-show-more')).toHaveTextContent('Näytä vähemmän');
    });
  });
});
