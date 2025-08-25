import React from 'react';
import { render } from '@testing-library/react';

import AccessibilityStatement from '../AccessibilityStatement';

describe('<AccessibilityStatement />', () => {
  it('renders correctly', () => {
    const { container } = render(<AccessibilityStatement />);

    expect(container).toMatchSnapshot();
  });
});
