import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import DeleteView from '../DeleteView';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) DeleteView', () => {
  let _wrapper;

  beforeEach(() => {
    _wrapper = mount(
      <DeleteView
        type='action'
        target={''}
        action={() => null}
        cancel={() => null}
      />
    );
  });

  it('Passes type prop correctly', () => {
    expect(_wrapper.props().type).toBeDefined();
    expect(_wrapper.prop('type')).toEqual('action');
  });
});
