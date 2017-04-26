import React from 'react';
import KeyStrokeSupport from '../../../decorators/key-stroke-support';

export const CreateActionForm = ({ submit, newTypeSpecifier, onChange, cancel }) => (
  <form onSubmit={submit} className='row add-action'>
    <h5 className='col-xs-12'>Uusi toimenpide</h5>
    <div className='col-xs-12 col-md-6'>
      <input
        type='text'
        className='form-control'
        value={newTypeSpecifier}
        onChange={onChange}
        onSubmit={submit}
        placeholder='Toimenpiteen nimi'/>
    </div>
    <div className='col-xs-12 col-md-4 add-action-buttons'>
      <button
        className='btn btn-danger col-xs-6'
        onClick={cancel}>
        Peruuta
      </button>
      <button className='btn btn-primary col-xs-6' type='submit'>Lisää</button>
    </div>
  </form>
);

CreateActionForm.propTypes = {
  cancel: React.PropTypes.func.isRequired,
  newTypeSpecifier: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired,
  submit: React.PropTypes.func.isRequired
};

export default KeyStrokeSupport(CreateActionForm);
