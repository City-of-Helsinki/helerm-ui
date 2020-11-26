import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { withRouter, routerShape } from 'react-router';

import { getStatusLabel, formatDateTime } from 'utils/helpers';

import './VersionSelector.scss';

const getVersionLabel = ({
  state,
  version,
  modified_at: modifiedAt
}) => {
  return `${getStatusLabel(state)}, ${formatDateTime(modifiedAt)} (v${version})`;
};

const VersionSelector = ({ classificationId, currentVersion, versions, router }) => {
  const name = `helerm-classification-${classificationId}`;

  return (
    <div>
      <label className='helerm-classification-label' htmlFor={name}>Versio:</label>
      <Select
        id={name}
        name={name}
        className='helerm-classification-selector'
        placeholder='Valitse versio...'
        noResultsText='Hakua vastaavia versioita ei löytynyt'
        onChange={({ value }) => {
          router.push(`/view-classification/${classificationId}/version/${value}`);
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
  valid_from: PropTypes.string,
  valid_to: PropTypes.string
});

VersionSelector.propTypes = {
  classificationId: PropTypes.string.isRequired,
  currentVersion: PropTypes.number.isRequired,
  router: routerShape,
  versions: PropTypes.arrayOf(versionShape)
};

export default withRouter(VersionSelector);
