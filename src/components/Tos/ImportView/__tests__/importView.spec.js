import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import React from 'react';
import ImportView from '../ImportView';

Enzyme.configure({ adapter: new Adapter() });

describe('(Component) ImportView', () => {
  let _wrapper;

  beforeEach(() => {
    _wrapper = mount(
      <ImportView
        level='phase'
        title={''}
        targetText={''}
        itemsToImportText={''}
        phases={{}}
        phasesOrder={[]}
        actions={{}}
        records={{}}
        importItems={() => null}
        toggleImportView={() => null}
      />
    );
  });

  it('Passes level prop correctly', () => {
    expect(_wrapper.props().level).toBeDefined();
    expect(_wrapper.prop('level')).toEqual('phase');
  });
});
