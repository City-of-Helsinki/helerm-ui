import React from 'react';
import { render } from '@testing-library/react';

import EditorForm from '../EditorForm';
import { attributeTypes } from '../../../../utils/__mocks__/mockHelpers';

const baseMocks = {
  attributeTypes: attributeTypes,
  editorConfig: { type: 'function', action: 'edit' },
  targetId: 'c38e1b3dacd145ef905baf2fbd79918c',
  elementConfig: { editWithForm: vi.fn(), elementTypes: {}, createRecord: vi.fn() },
};

const renderComponent = () =>
  render(
    <EditorForm
      additionalFields={[]}
      attributeTypes={baseMocks.attributeTypes}
      attributes={{}}
      closeEditorForm={vi.fn()}
      complementRecordAdd={vi.fn()}
      displayMessage={vi.fn()}
      editMetaDataWithForm={vi.fn()}
      editorConfig={baseMocks.editorConfig}
      elementConfig={baseMocks.elementConfig}
      onShowMore={vi.fn()}
      onShowMoreForm={vi.fn()}
      targetId={baseMocks.targetId}
    />,
  );

describe('<EditorForm />', () => {
  it('should render correctly', () => {
    const { container } = renderComponent();

    expect(container).toMatchSnapshot();
  });
});
