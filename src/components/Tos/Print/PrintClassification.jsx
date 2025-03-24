import React from 'react';
import PropTypes from 'prop-types';

import MetaDataTable from './MetaDataTable';

const PrintClassification = ({ classification }) => (
  <section>
    <header>
      <h2>Tehtäväluokan tiedot</h2>
    </header>
    <MetaDataTable
      rows={[
        ['Kuvaus', classification.description],
        ['Sisäinen kuvaus', classification.description_internal],
        ['Liittyvä tehtäväluokka', classification.related_classification],
        ['Lisätiedot', classification.additional_information],
      ]}
    />
  </section>
);

PrintClassification.propTypes = {
  classification: PropTypes.object,
};

export default PrintClassification;
