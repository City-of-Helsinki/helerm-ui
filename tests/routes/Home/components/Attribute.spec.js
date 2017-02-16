import React from 'react';
import { Attribute } from 'routes/Home/components/Attribute';
import { shallow } from 'enzyme';

describe('(Component) Attribute', () => {
  let _component;

  beforeEach(() => {
    _component = shallow(<Attribute
      attribute='100'
      attributeIndex='SecurityPeriod'
      attributeKey='Salassapitoaika'
      attributeTypes={{}}
      documentState='view'
      showAttributes={true}
      mode='view'
      editable={true}
      type='attribute' />);
  });

  it('Renders an attribute element', () => {
    expect(_component).to.have.length(1);
  });
});
