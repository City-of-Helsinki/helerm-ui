import React from 'react';
import { DeleteView } from 'components/Tos/DeleteView/DeleteView';
import { shallow } from 'enzyme';

describe('(Component) DeleteView', () => {
  let _wrapper;

  beforeEach(() => {
    _wrapper = shallow(
      <DeleteView
        type='action'
        target={''}
        action={() => null}
        cancel={() => null}
      />
    );
  });

  it('Passes type prop correctly', () => {
    expect(_wrapper.props().type).to.be.defined;
  });
});
