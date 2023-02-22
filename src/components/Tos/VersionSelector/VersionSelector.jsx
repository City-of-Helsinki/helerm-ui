/* eslint-disable react/forbid-prop-types */
/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';

import { getStatusLabel, formatDateTime } from '../../../utils/helpers';

import './VersionSelector.scss';

const getVersionLabel = ({ state, version, modified_at: modifiedAt, modified_by: modifiedBy }) =>
  `${getStatusLabel(state)}, ${formatDateTime(modifiedAt)}${
    typeof modifiedBy === 'string' ? `, ${modifiedBy}` : ''
  } (v${version})`;

const VersionSelector = ({ tosId, currentVersion, versions, history }) => {
  const name = `helerm-version-${tosId}`;
  const selected = versions.find(({ version }) => version === currentVersion);
  return (
    <div>
      <label className='helerm-version-label' htmlFor={name}>
        Käsittelyprosessin versio:
      </label>
      <Select
        id={name}
        name={name}
        className='Select helerm-version-selector'
        placeholder='Valitse versio...'
        noOptionsMessage={() => 'Hakua vastaavia versioita ei löytynyt'}
        onChange={(item) => {
          if (item) {
            history.push(`/view-tos/${tosId}/version/${item.value}`);
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
});

VersionSelector.propTypes = {
  currentVersion: PropTypes.number.isRequired,
  history: PropTypes.object,
  tosId: PropTypes.string.isRequired,
  versions: PropTypes.arrayOf(versionShape),
};

export default withRouter(VersionSelector);
