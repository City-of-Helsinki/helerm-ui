import React from 'react';
import PropTypes from 'prop-types';

import MetaDataTable from './MetaDataTable';

const PrintClassification = ({ classification }) => {
  return (
    <section>
      <header>
        <h2>Tehtäväluokan tiedot</h2>
      </header>
      <MetaDataTable
        rows={[
          ['Kuvaus', classification.description_internal],
          ['Sisäinen kuvaus', classification.description],
          ['Liittyviä luokituksia', classification.related_classification],
          ['Lisätietoa', classification.additional_information]
        ]}
      />
    </section>
  );
};

PrintClassification.propTypes = {
  classification: PropTypes.object
};

export default PrintClassification;
