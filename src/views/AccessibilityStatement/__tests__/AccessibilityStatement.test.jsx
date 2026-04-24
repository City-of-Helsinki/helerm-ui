import { render, screen } from '@testing-library/react';

import AccessibilityStatement from '../AccessibilityStatement';

describe('<AccessibilityStatement />', () => {
  it('renders correctly', () => {
    const { container } = render(<AccessibilityStatement />);

    expect(container).toMatchSnapshot();
  });

  it('renders the accessibility statement heading from markdown content', () => {
    render(<AccessibilityStatement />);

    // The title appears in the h1; use level:1 to avoid matching sub-headings that repeat the word
    expect(screen.getByRole('heading', { name: /saavutettavuusseloste/i, level: 1 })).toBeInTheDocument();
  });

  it('renders markdown content as HTML elements', () => {
    const { container } = render(<AccessibilityStatement />);

    // raw.macro (and the ?raw replacement) must inline the file content;
    // verify a non-trivial amount of text is rendered
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelector('h2')).toBeInTheDocument();
  });
});
