import React from 'react';
import PropTypes from 'prop-types';

import MetaDataTable from './MetaDataTable';
import PrintRecord from './PrintRecord';

const PrintAction = ({ action, phaseName, getAttributeName, sortAttributeKeys }) => (
  <section>
    <header>
      <div className='breadscrumbs'>{phaseName}</div>
      <h3>{action.name}</h3>
    </header>
    <MetaDataTable
      rows={sortAttributeKeys(Object.keys(action.attributes)).map((key) => [
        getAttributeName(key),
        action.attributes[key],
      ])}
    />
    {action.records
      ? action.records.map((record) => (
          <PrintRecord
            key={record.id}
            record={record}
            breadscrumbs={[phaseName, action.name].join(' » ')}
            getAttributeName={getAttributeName}
            sortAttributeKeys={sortAttributeKeys}
          />
        ))
      : null}
  </section>
);

PrintAction.propTypes = {
  action: PropTypes.object.isRequired,
  getAttributeName: PropTypes.func.isRequired,
  phaseName: PropTypes.string,
  sortAttributeKeys: PropTypes.func.isRequired,
};

export default PrintAction;
