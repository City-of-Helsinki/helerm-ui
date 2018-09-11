import React from 'react';
import { EditorForm } from 'components/Tos/EditorForm/EditorForm';
import { shallow } from 'enzyme';

describe('(Component) EditorForm', () => {
  let _wrapper;

  beforeEach(() => {
    _wrapper = shallow(
      <EditorForm
        attributes={{}}
        attributeTypes={{ TypeSpecifier: 'foo' }}
        displayMessage={() => null}
        closeEditorForm={() => null}
        elementConfig={{
          elementTypes: {},
          editWithForm: () => null,
          createRecord: () => null
        }}
        editorConfig={{
          type: '',
          action: ''
        }}
        recordConfig={{
          recordTypes: {}
        }}
        targetId=''
      />
    );
  });

  it('Renders form correctly', () => {
    const form = _wrapper.find('form');
    expect(form).to.exist;
  });
});
