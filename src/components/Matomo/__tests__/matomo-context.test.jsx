import { render } from '@testing-library/react';

import { MatomoProvider } from '../matomo-context';

describe('matomo-context', () => {
  it('renders children with provided value', () => {
    const value = { trackerUrl: 'https://matomo.example.com' };

    const { getByText } = render(
      <MatomoProvider value={value}>
        <div>Test Component</div>
      </MatomoProvider>,
    );

    expect(getByText('Test Component')).toBeInTheDocument();
  });
});
