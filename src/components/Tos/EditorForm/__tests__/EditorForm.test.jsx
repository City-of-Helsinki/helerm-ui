import React from 'react';
import { render } from '@testing-library/react';

import EditorForm from '../EditorForm';
import attributeRules from '../../../../utils/mocks/attributeRules.json';

const baseMocks = {
  attributeTypes: attributeRules,
  editorConfig: { type: 'function', action: 'edit' },
  targetId: 'c38e1b3dacd145ef905baf2fbd79918c',
  elementConfig: { editWithForm: jest.fn(), elementTypes: {}, createRecord: jest.fn() },
};

const renderComponent = () =>
  render(
    <EditorForm
      additionalFields={[]}
      attributeTypes={baseMocks.attributeTypes}
      attributes={{}}
      closeEditorForm={jest.fn()}
      complementRecordAdd={jest.fn()}
      displayMessage={jest.fn()}
      editMetaDataWithForm={jest.fn()}
      editorConfig={baseMocks.editorConfig}
      elementConfig={baseMocks.elementConfig}
      onShowMore={jest.fn()}
      onShowMoreForm={jest.fn()}
      targetId={baseMocks.targetId}
    />,
  );

describe('<EditorForm />', () => {
  it('should render correctly', () => {});
  const { container } = renderComponent();

  expect(container).toMatchSnapshot();
});
