import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';
import { EditorForm } from '../EditorForm';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) EditorForm', () => {
  let _wrapper;

  beforeEach(() => {
    _wrapper = shallow(
      <EditorForm
        attributes={{ TypeSpecifier: 'Fooo' }}
        attributeTypes={{ TypeSpecifier: {} }}
        displayMessage={() => null}
        closeEditorForm={() => null}
        editorConfig={{
          type: '',
          action: ''
        }}
        elementConfig={{
          editWithForm: () => {},
          elementTypes: {},
          createRecord: () => {}
        }}
        recordConfig={{
          recordTypes: {}
        }}
      />
    );
  });

  it('Renders form correctly', () => {
    const form = _wrapper.find('form');
    expect(form).toBeDefined();
  });
});
