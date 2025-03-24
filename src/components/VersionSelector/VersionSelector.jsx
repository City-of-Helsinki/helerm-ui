import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { getStatusLabel, formatDateTime } from '../../utils/helpers';

import './VersionSelector.scss';

const getVersionLabel = ({ state, version, modified_at: modifiedAt, modified_by: modifiedBy }) => {
  const modifiedByString = modifiedBy ? `, ${modifiedBy}` : '';

  return `${getStatusLabel(state)}, ${formatDateTime(modifiedAt)}${modifiedByString} (v${version})`;
};

const VersionSelector = ({ versionId, currentVersion, versions, onChange, label }) => {
  const name = `helerm-version-${versionId}`;
  const selected = versions.find(({ version }) => version === currentVersion);
  return (
    <div>
      <label className='helerm-version-label' htmlFor={name}>
        {label}
      </label>
      <Select
        id={name}
        name={name}
        className='Select helerm-version-selector'
        placeholder='Valitse versio...'
        noOptionsMessage={() => 'Hakua vastaavia versioita ei löytynyt'}
        onChange={(item) => {
          if (item) {
            onChange(item);
          }
        }}
        options={versions.map((version) => ({
          value: version.version,
          label: getVersionLabel(version),
        }))}
        value={{
          value: selected.version,
          label: getVersionLabel(selected),
        }}
        captureMenuScroll={false}
        backspaceRemovesValue
        escapeClearsValue
        isSearchable
      />
    </div>
  );
};

export const versionShape = PropTypes.shape({
  version: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired,
  modified_at: PropTypes.string.isRequired,
  modified_by: PropTypes.string,
  valid_from: PropTypes.string,
  valid_to: PropTypes.string,
});

VersionSelector.propTypes = {
  versionId: PropTypes.string.isRequired,
  currentVersion: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  versions: PropTypes.arrayOf(versionShape),
};

export default VersionSelector;
