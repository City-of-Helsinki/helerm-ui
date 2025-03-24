import React from 'react';
import PropTypes from 'prop-types';
import upperFirst from 'lodash/upperFirst';

import MetaDataTable from './MetaDataTable';

const PrintRecord = ({ record, breadscrumbs, getAttributeName, sortAttributeKeys }) => (
  <section>
    <header>
      <div className='breadscrumbs'>{breadscrumbs}</div>
      <h4>{upperFirst(record.name)}</h4>
    </header>
    <MetaDataTable
      rows={sortAttributeKeys(Object.keys(record.attributes)).map((key) => [
        getAttributeName(key),
        record.attributes[key],
      ])}
    />
  </section>
);

PrintRecord.propTypes = {
  breadscrumbs: PropTypes.string,
  getAttributeName: PropTypes.func.isRequired,
  record: PropTypes.object.isRequired,
  sortAttributeKeys: PropTypes.func.isRequired,
};

export default PrintRecord;
