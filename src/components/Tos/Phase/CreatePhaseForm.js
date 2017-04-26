import React from 'react';
import KeyStrokeSupport from '../../../decorators/key-stroke-support';

export const CreatePhaseForm = ({ submit, newTypeSpecifier, onChange, cancel }) => (
  <form onSubmit={submit} className='col-xs-12 phase-form'>
    <h5>Uusi käsittelyvaihe</h5>
    <div className='col-xs-12 col-md-6'>
      <input
        type='text'
        className='form-control'
        value={newTypeSpecifier}
        onChange={onChange}
        onSubmit={submit}
        placeholder='Käsittelyvaiheen nimi'/>
    </div>
    <div className='col-xs-12 col-md-4'>
      <button
        className='btn btn-danger pull-left'
        onClick={cancel}>
        Peruuta
      </button>
      <button className='btn btn-primary pull-left' type='submit'>Lisää</button>
    </div>
  </form>
);

CreatePhaseForm.propTypes = {
  cancel: React.PropTypes.func.isRequired,
  newTypeSpecifier: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired,
  submit: React.PropTypes.func.isRequired
};

export default KeyStrokeSupport(CreatePhaseForm);
