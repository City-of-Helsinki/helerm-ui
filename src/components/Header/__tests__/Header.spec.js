import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';
import Header from '../Header';

// a quick fix before the official enzyme adapter for React 17 is out
// https://github.com/enzymejs/enzyme/issues/2429
Enzyme.configure({ adapter: new Adapter() });

describe('(Component) Header', () => {
  let _wrapper;

  beforeEach(() => {
    _wrapper = shallow(<Header isFetching={false} />);
  });

  it('Renders a nav bar with correct title', () => {
    const nav = _wrapper.find('nav');
    const title = nav.find('Link');
    expect(nav).toBeDefined();
    expect(title).toBeDefined();
    expect(title.children().at(1).text()).toMatch(/Tiedonohjaus/);
  });
});
