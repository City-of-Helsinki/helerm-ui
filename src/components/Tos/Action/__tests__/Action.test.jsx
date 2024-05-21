import React from 'react';
import { render } from '@testing-library/react';

import Action from '../Action';

const renderComponent = () => {
  const attributeTypes = { TypeSpecifier: { defaultIn: [] } };
  const records = {
    testi1: {},
    testi2: {},
  };
  const testFunc = vi.fn();

  return render(
    <Action
      action={{ attributes: { showAttributes: false }, is_open: true, records: [] }}
      actionTypes={{}}
      actions={{ records }}
      addRecord={testFunc}
      attributeTypes={attributeTypes}
      changeOrder={testFunc}
      displayMessage={testFunc}
      documentState='test'
      editAction={testFunc}
      editActionAttribute={testFunc}
      editRecord={testFunc}
      editRecordAttribute={testFunc}
      importItems={testFunc}
      phases={{}}
      phasesOrder={[]}
      recordTypes={{}}
      records={records}
      removeAction={testFunc}
      removeRecord={testFunc}
      setActionVisibility={testFunc}
      setRecordVisibility={testFunc}
    />,
  );
};

describe('<Action />', () => {
  it('should render without crashing', () => {
    const { container } = renderComponent();

    expect(container).toBeDefined();
  });
});
