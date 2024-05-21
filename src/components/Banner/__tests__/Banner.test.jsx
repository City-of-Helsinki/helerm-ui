import { render } from '@testing-library/react';
import React from 'react';

import Banner from '../Banner';

describe('<Banner />', () => {
  it('renders correctly', () => {
    render(<Banner />);
  });
});
