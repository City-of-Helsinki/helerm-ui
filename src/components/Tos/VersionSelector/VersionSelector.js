import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withRouter, routerShape } from 'react-router';

import { getStatusLabel, formatDateTime } from 'utils/helpers';

import './VersionSelector.scss';

const getVersionLabel = ({
  state,
  modified_at: modifiedAt,
  modified_by: modifiedBy
}) => {
  return `${getStatusLabel(state)}, ${formatDateTime(modifiedAt)}${
    typeof modifiedBy === 'string' ? `, ${modifiedBy}` : ''
  }`;
};

const VersionSelector = ({ tosId, currentVersion, versions, router }) => {
  const name = `helerm-version-${tosId}`;

  return (
    <div>
      <label className='helerm-version-label' htmlFor={name}>Versio:</label>
      <Select
        id={name}
        name={name}
        className='helerm-version-selector'
        placeholder='Valitse versio...'
        noResultsText='Hakua vastaavia versioita ei löytynyt'
        onChange={({ value }) => {
          router.push(`/view-tos/${tosId}/version/${value}`);
        }}
        options={versions.map(version => ({
          value: version.version,
          label: getVersionLabel(version)
        }))}
        value={currentVersion}
        clearable={false}
        backspaceRemoves={false}
        deleteRemoves={false}
      />
    </div>
  );
};

export const versionShape = PropTypes.shape({
  version: PropTypes.number.isRequired,
  state: PropTypes.string.isRequired,
  modified_at: PropTypes.string.isRequired,
  modified_by: PropTypes.string
});

VersionSelector.propTypes = {
  currentVersion: PropTypes.number.isRequired,
  router: routerShape,
  tosId: PropTypes.string.isRequired,
  versions: PropTypes.arrayOf(versionShape)
};

export default withRouter(VersionSelector);
