import React from 'react';
import { CloneView } from 'components/Tos/CloneView/CloneView';
import { shallow } from 'enzyme';

describe('(Component) CloneView', () => {
  let _wrapper;

  beforeEach(() => {
    _wrapper = shallow(
      <CloneView
        templates={[]}
      />
    );
  });

  it('Renders an unordered list', () => {
    const ul = _wrapper.find('ul');
    expect(ul).to.exist;
  });
});
