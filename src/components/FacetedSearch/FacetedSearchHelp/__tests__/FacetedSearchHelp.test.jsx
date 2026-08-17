import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FacetedSearchHelp, {
  FACETED_SEARCH_HELP_TYPE_FACET,
  FACETED_SEARCH_HELP_TYPE_TERM,
} from '../FacetedSearchHelp';

const renderComponent = (type = FACETED_SEARCH_HELP_TYPE_FACET) => render(<FacetedSearchHelp type={type} />);

describe('<FacetedSearchHelp />', () => {
  it('renders the help toggle button', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /ohje/i })).toBeInTheDocument();
  });

  it('popover does not have show class initially', () => {
    const { container } = renderComponent();

    expect(container.querySelector('.popover')).not.toHaveClass('show');
  });

  it('clicking the button adds show class to the popover', async () => {
    const user = userEvent.setup();
    const { container } = renderComponent();

    await user.click(screen.getByRole('button', { name: /ohje/i }));

    expect(container.querySelector('.popover')).toHaveClass('show');
  });

  it('clicking the popover close button removes show class', async () => {
    const user = userEvent.setup();
    const { container } = renderComponent();

    await user.click(screen.getByRole('button', { name: /ohje/i }));
    await user.click(screen.getByRole('button', { name: /sulje/i }));

    expect(container.querySelector('.popover')).not.toHaveClass('show');
  });

  it('pressing Escape removes show class', async () => {
    const user = userEvent.setup();
    const { container } = renderComponent();

    await user.click(screen.getByRole('button', { name: /ohje/i }));
    expect(container.querySelector('.popover')).toHaveClass('show');

    await user.keyboard('{Escape}');

    expect(container.querySelector('.popover')).not.toHaveClass('show');
  });

  describe('markdown content', () => {
    it('renders facet markdown heading when type is facet', () => {
      renderComponent(FACETED_SEARCH_HELP_TYPE_FACET);

      // heading from facet_fi.md
      expect(screen.getByRole('heading', { name: /rajausohje/i })).toBeInTheDocument();
    });

    it('renders searchterm markdown heading when type is searchterm', () => {
      renderComponent(FACETED_SEARCH_HELP_TYPE_TERM);

      // heading from searchterm_fi.md
      expect(screen.getByRole('heading', { name: /hakuohje/i })).toBeInTheDocument();
    });

    it('does not render facet markdown when type is searchterm', () => {
      renderComponent(FACETED_SEARCH_HELP_TYPE_TERM);

      expect(screen.queryByRole('heading', { name: /rajausohje/i })).not.toBeInTheDocument();
    });

    it('does not render searchterm markdown when type is facet', () => {
      renderComponent(FACETED_SEARCH_HELP_TYPE_FACET);

      expect(screen.queryByRole('heading', { name: /hakuohje/i })).not.toBeInTheDocument();
    });
  });
});
