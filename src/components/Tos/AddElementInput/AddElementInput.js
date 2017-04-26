import React from 'react';
import KeyStrokeSupport from '../../../decorators/key-stroke-support';
import './AddElementInput.scss';

function resolveHeader (type) {
  if (type === 'phase') {
    return 'Uusi käsittelyvaihe';
  }
  if (type === 'action') {
    return 'Uusi toimenpide';
  }
}

function resolvePlaceHolder (type) {
  if (type === 'phase') {
    return 'Käsittelyvaiheen nimi';
  }
  if (type === 'action') {
    return 'Toimenpiteen nimi';
  }
}

export const AddElementInput = ({ type, submit, newTypeSpecifier, onChange, cancel }) => (
  <form onSubmit={submit} className='row add-element'>
    <h5 className='col-xs-12'>{resolveHeader(type)}</h5>
    <div className='col-xs-12 col-md-6'>
      <input
        type='text'
        className='form-control'
        value={newTypeSpecifier}
        onChange={onChange}
        onSubmit={submit}
        placeholder={resolvePlaceHolder(type)}/>
    </div>
    <div className='col-xs-12 col-md-4 add-element-buttons'>
      <button
        className='btn btn-danger col-xs-6'
        onClick={cancel}>
        Peruuta
      </button>
      <button className='btn btn-primary col-xs-6' type='submit'>Lisää</button>
    </div>
  </form>
);

AddElementInput.propTypes = {
  cancel: React.PropTypes.func.isRequired,
  newTypeSpecifier: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired,
  submit: React.PropTypes.func.isRequired,
  type: React.PropTypes.string.isRequired
};

export default KeyStrokeSupport(AddElementInput);
