import React from 'react';
import PropTypes from 'prop-types';

const createExport = (data) => {
  // Tehtäväluokka – käsittelyvaihe – toimenpide – asiakirja
  //    - attributes
  // Do something with the data...
};

const Exporter = ({ data }) => {
  return (
    <button className='btn btn-primary' onClick={() => createExport(data)}>Export</button>
  );
};

Exporter.propTypes = {
  data: PropTypes.object
};

export default Exporter;
