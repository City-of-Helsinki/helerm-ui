import React from 'react';
import Select from 'react-select';
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

function resolveTypePlaceHolder (type) {
  if (type === 'phase') {
    return 'Käsittelyvaiheen tyyppi';
  }
  if (type === 'action') {
    return 'Toimenpiteen tyyppi';
  }
}

function resolveSpecifierPlaceHolder (type) {
  if (type === 'phase') {
    return 'Muu käsittelyvaihe';
  }
  if (type === 'action') {
    return 'Toimenpide';
  }
}

function resolveSelectPlaceHolder (type) {
  if (type === 'phase') {
    return 'Valitse käsittelyvaihe...';
  }
  if (type === 'action') {
    return 'Valitse toimenpide...';
  }
}

export const AddElementInput = ({
  type,
  submit,
  typeOptions,
  newTypeSpecifier,
  newType,
  onTypeSpecifierChange,
  onTypeInputChange,
  onTypeChange,
  cancel
}) => (
  <form onSubmit={submit} className='row add-element'>
    <h5 className='col-xs-12'>{resolveHeader(type)}</h5>
    {/* ActionType disabled for now. */}
    { type !== 'action' &&
      <div className='col-xs-12 col-md-4'>
        { typeOptions.length !== 0
          ? <Select
            autoBlur={true}
            openOnFocus={true}
            className={`form-control edit-${type}-type__input`}
            clearable={false}
            value={newType}
            onChange={(option) => onTypeChange(option ? option.value : null)}
            onBlur={() => null}
            autofocus={false}
            options={typeOptions}
            placeholder={resolveSelectPlaceHolder(type)}
          />
          : <input
            type='text'
            className='form-control'
            value={newType}
            onChange={onTypeInputChange}
            onSubmit={submit}
            placeholder={resolveTypePlaceHolder(type)}
          />
        }
      </div>
    }
    <div className='col-xs-12 col-md-4'>
      <input
      type='text'
      className='form-control'
      value={newTypeSpecifier}
      onChange={onTypeSpecifierChange}
      onSubmit={submit}
      placeholder={resolveSpecifierPlaceHolder(type)}/>
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
  newType: React.PropTypes.string.isRequired,
  newTypeSpecifier: React.PropTypes.string.isRequired,
  onTypeChange: React.PropTypes.func.isRequired,
  onTypeInputChange: React.PropTypes.func.isRequired,
  onTypeSpecifierChange: React.PropTypes.func.isRequired,
  submit: React.PropTypes.func.isRequired,
  type: React.PropTypes.string.isRequired,
  typeOptions: React.PropTypes.array.isRequired
};

export default KeyStrokeSupport(AddElementInput);
