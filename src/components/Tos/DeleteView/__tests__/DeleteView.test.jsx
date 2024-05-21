import React from 'react';
import { render } from '@testing-library/react';

import DeleteView from '../DeleteView';

const renderComponent = () => render(<DeleteView type='action' target='' action={() => null} cancel={() => null} />);

describe('<DeleteView />', () => {
  it('Renders without crashing', () => {
    const { getByText } = renderComponent();

    expect(getByText('Poista')).toBeInTheDocument();
  });
});
