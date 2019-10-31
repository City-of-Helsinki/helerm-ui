import React from 'react';
import Select from 'react-select';
import { find, forEach, includes, isEmpty, map } from 'lodash';
import KeyStrokeSupport from '../../../decorators/key-stroke-support';
import './AddElementInput.scss';

function onPromptCreate (label) {
  return `Lisää "${label}"`;
}

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

function resolvePlaceHolder (fieldName) {
  return `Valitse ${fieldName.toLowerCase()}...`;
}

function resolveSelectOptions (values, fieldValue) {
  const options = [];
  Object.keys(values).forEach(key => {
    options.push({
      label: values[key].value,
      value: values[key].value
    });
  });
  if (fieldValue) {
    const valueArray =
      fieldValue instanceof Array
        ? fieldValue
        : [fieldValue];
    forEach(valueArray, function (value) {
      if (
        !find(options, function (option) {
          return option.value === value;
        })
      ) {
        options.push({
          label: value,
          value: value
        });
      }
    });
  }
  return options;
}

function resolveSelectedOption (option) {
  if (option instanceof Array) {
    return option.length ? map(option, 'value') : null;
  }
  return option && option.value ? option.value : option;
}

export const AddElementInput = ({
  type,
  submit,
  defaultAttributes,
  typeOptions,
  newDefaultAttributes,
  newTypeSpecifier,
  newType,
  onDefaultAttributeChange,
  onTypeSpecifierChange,
  onTypeInputChange,
  onTypeChange,
  cancel,
  onAddFormShowMore,
  showMoreOrLess
}) => {
  return (
    <form onSubmit={submit} className='row add-element'>
      <h5 className='col-xs-12'>{resolveHeader(type)}</h5>
      {/* ActionType disabled for now. */}
      {type !== 'action' && (
        <div className='col-xs-12 col-md-6 add-element-col'>
          {typeOptions.length !== 0
            ? <Select.Creatable
              autoBlur={true}
              openOnFocus={true}
              className={`form-control edit-${type}-type__input`}
              clearable={true}
              value={newType}
              onChange={(option) => onTypeChange(option ? option.value : null)}
              onBlur={() => null}
              autoFocus={false}
              options={resolveSelectOptions(typeOptions, newType)}
              placeholder={resolveSelectPlaceHolder(type)}
              promptTextCreator={onPromptCreate}
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
      )}
      <div className='col-xs-12 col-md-6 add-element-col'>
        <input
          type='text'
          className='form-control'
          value={newTypeSpecifier}
          onChange={onTypeSpecifierChange}
          onSubmit={submit}
          placeholder={resolveSpecifierPlaceHolder(type)}
        />
      </div>
      {!isEmpty(defaultAttributes) &&
      Object.keys(defaultAttributes).map(key => (
        <div className='col-xs-12 col-md-6' key={`${type}_${key}`}>
          { defaultAttributes[key].values.length !== 0
            ? <Select.Creatable
              autoBlur={true}
              key={key}
              openOnFocus={true}
              className={`form-control edit-${type}-type__input`}
              clearable={true}
              value={newDefaultAttributes[key] || ''}
              onChange={(option) => onDefaultAttributeChange(key, resolveSelectedOption(option))}
              onBlur={() => null}
              autoFocus={false}
              multi={includes(defaultAttributes[key].multiIn, type)}
              options={resolveSelectOptions(defaultAttributes[key].values, newDefaultAttributes[key])}
              placeholder={resolvePlaceHolder(defaultAttributes[key].name)}
              promptTextCreator={onPromptCreate}
              delimiter=';'
            />
            : <input
              type='text'
              className='form-control'
              key={key}
              value={newDefaultAttributes[key] || ''}
              onChange={(e) => onDefaultAttributeChange(key, e.target.value)}
              onSubmit={submit}
              placeholder={defaultAttributes[key].name}
            />
          }
        </div>
      ))}
      <div className='add-element-buttons'>
        <button className='btn btn-success' onClick={onAddFormShowMore}>{showMoreOrLess ? 'Näytä vähemmän' : 'Näytä lisää'}</button>
        <button className='btn btn-danger' onClick={cancel}>Peruuta</button>
        <button className='btn btn-primary' type='submit'>OK</button>
      </div>
    </form>
  );
};

AddElementInput.propTypes = {
  cancel: React.PropTypes.func.isRequired,
  defaultAttributes: React.PropTypes.object.isRequired,
  newDefaultAttributes: React.PropTypes.object.isRequired,
  newType: React.PropTypes.string.isRequired,
  newTypeSpecifier: React.PropTypes.string.isRequired,
  onAddFormShowMore: React.PropTypes.func.isRequired,
  onDefaultAttributeChange: React.PropTypes.func.isRequired,
  onTypeChange: React.PropTypes.func.isRequired,
  onTypeInputChange: React.PropTypes.func.isRequired,
  onTypeSpecifierChange: React.PropTypes.func.isRequired,
  showMoreOrLess: React.PropTypes.bool,
  submit: React.PropTypes.func.isRequired,
  type: React.PropTypes.string.isRequired,
  typeOptions: React.PropTypes.array.isRequired
};

export default KeyStrokeSupport(AddElementInput);
