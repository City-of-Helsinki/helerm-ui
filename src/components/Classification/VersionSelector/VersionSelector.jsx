/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withRouter } from 'react-router-dom';

import { getStatusLabel, formatDateTime } from '../../../utils/helpers';

import './VersionSelector.scss';

const getVersionLabel = ({ state, version, modified_at: modifiedAt }) =>
  `${getStatusLabel(state)}, ${formatDateTime(modifiedAt)} (v${version})`;

const VersionSelector = ({ classificationId, currentVersion, versions, history }) => {
  const name = `helerm-classification-${classificationId}`;
  const selected = versions.find(({ version }) => version === currentVersion);
  return (
    <div>
      <label className='helerm-classification-label' htmlFor={name}>
        Versio:
      </label>
      <Select
        id={name}
        name={name}
        className='Select helerm-classification-selector'
        placeholder='Valitse versio...'
        noOptionsMessage={() => 'Hakua vastaavia versioita ei löytynyt'}
        onChange={(item) => {
          if (item) {
            history.push(`/view-classification/${classificationId}/version/${item.value}`);
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
  valid_from: PropTypes.string,
  valid_to: PropTypes.string,
});

VersionSelector.propTypes = {
  classificationId: PropTypes.string.isRequired,
  currentVersion: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired,
  versions: PropTypes.arrayOf(versionShape),
};

export default withRouter(VersionSelector);
