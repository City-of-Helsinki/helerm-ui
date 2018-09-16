import React from 'react';
import PropTypes from 'prop-types';

const createExport = (data) => {
  // Tehtäväluokka – käsittelyvaihe – toimenpide – asiakirja
  //    - attributes
  // Do something with the data...
};

const Exporter = ({ data }) => {
  const countStr = data.length > 1 ? 'tulosta' : 'tulos';
  return (
    <button className='btn btn-primary' onClick={() => createExport(data)}>Vie {data.length} {countStr} <i className='fa fa-file-excel-o' /></button>
  );
};

Exporter.propTypes = {
  data: PropTypes.array
};

export default Exporter;
