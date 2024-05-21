import React from 'react';
import { render } from '@testing-library/react';

import ImportView from '../ImportView';

const renderComponent = () =>
  render(
    <ImportView
      level='phase'
      title=''
      targetText=''
      itemsToImportText=''
      phases={{}}
      phasesOrder={[]}
      actions={{}}
      records={{}}
      importItems={() => null}
      toggleImportView={() => null}
    />,
  );

describe('<ImportView />', () => {
  it('renders without crashing', () => {
    const { getByText } = renderComponent();

    expect(getByText('Valitse listalta tuotavat')).toBeInTheDocument();
  });
});
