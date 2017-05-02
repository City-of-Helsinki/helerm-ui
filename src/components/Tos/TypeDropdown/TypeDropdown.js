import React from 'react';
import Select from 'react-select';

export const TypeDropdown = ({ type, typeState, typeOptions, onChange, onInputChange, onSubmit }) => {
  const options = [];

  if (Object.keys(typeOptions).length === 0) {
    return (
      <div className='col-md-5'>
        <form onSubmit={onSubmit}>
          <input
            className='input-type form-control col-xs-11'
            value={typeState}
            onChange={onInputChange}
            onBlur={onSubmit}
            autoFocus={true}
          />
        </form>
      </div>
    );
  }

  for (const key in typeOptions) {
    if (typeOptions.hasOwnProperty(key)) {
      options.push({
        label: typeOptions[key].name,
        value: typeOptions[key].name
      });
    }
  }
  return (
    <div className='col-md-5'>
      <form onSubmit={onSubmit}>
        <Select
          autoBlur={false}
          openOnFocus={true}
          className={`form-control edit-${type}-type__input`}
          clearable={false}
          value={typeState}
          onChange={(option) => onChange(option ? option.value : null)}
          onBlur={onSubmit}
          autofocus={true}
          options={options}
        />
      </form>
    </div>
  );
};

TypeDropdown.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  onInputChange: React.PropTypes.func.isRequired,
  onSubmit: React.PropTypes.func.isRequired,
  type: React.PropTypes.string.isRequired,
  typeOptions: React.PropTypes.object.isRequired,
  typeState: React.PropTypes.string.isRequired
};

export default TypeDropdown;
