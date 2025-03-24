import React from 'react';
import PropTypes from 'prop-types';

import MetaDataTable from './MetaDataTable';
import PrintAction from './PrintAction';

const PrintPhase = ({ phase, getAttributeName, sortAttributeKeys }) => {
  const metaData = sortAttributeKeys(Object.keys(phase.attributes)).map((key) => [
    getAttributeName(key),
    phase.attributes[key],
  ]);
  return (
    <section>
      <header>
        <h2>{phase.name}</h2>
      </header>
      <MetaDataTable rows={metaData} />
      {phase.actions.map((action) => (
        <PrintAction
          key={action.id}
          action={action}
          phaseName={phase.name}
          getAttributeName={getAttributeName}
          sortAttributeKeys={sortAttributeKeys}
        />
      ))}
    </section>
  );
};

const PhaseShape = PropTypes.shape({
  actions: PropTypes.arrayOf(PropTypes.object),
  attributes: PropTypes.object,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

PrintPhase.propTypes = {
  getAttributeName: PropTypes.func.isRequired,
  phase: PhaseShape,
  sortAttributeKeys: PropTypes.func.isRequired,
};

export default PrintPhase;
