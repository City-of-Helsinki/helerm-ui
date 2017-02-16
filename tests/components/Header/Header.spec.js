import React from 'react';
import { Header } from 'components/Header/Header';
import { shallow } from 'enzyme';

describe('(Component) Header', () => {
  let _wrapper;

  beforeEach(() => {
    _wrapper = shallow(<Header isFetching={false}/>);
  });

  it('Renders a nav bar with correct title', () => {
    const nav = _wrapper.find('nav');
    const title = nav.find('Link');
    expect(nav).to.exist;
    expect(title).to.exist;
    expect(title.children().text()).to.match(/Tiedonohjausjärjestelmä/);
  });
});
