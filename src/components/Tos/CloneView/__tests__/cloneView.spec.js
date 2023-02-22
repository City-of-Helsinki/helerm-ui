import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';
import CloneView from '../CloneView';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) CloneView', () => {
  let _wrapper;

  beforeEach(() => {
    const props = {
      templates: [],
      setNavigationVisibility: () => { }
    };
    _wrapper = shallow(<CloneView {...props} />);
  });

  it('Renders an unordered list', () => {
    const ul = _wrapper.find('ul');
    expect(ul).toBeDefined();
  });
});
