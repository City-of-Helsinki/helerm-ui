import React from 'react';
import PropTypes from 'prop-types';
import isArray from 'lodash/isArray';
import { CSVLink } from 'react-csv';

const getChildren = (array, item) => {
  if (isArray(item.children)) {
    return item.children.reduce(getChildren, array);
  }

  const exportItem = {
    name: item.title,
    status: item.function_state,
    ...item.function_attributes
  };

  array.push(exportItem);
  return array;
};

const Exporter = ({ data }) => {
  const exportData = data.reduce(getChildren, []);
  const countStr = exportData.length > 1 ? 'tulosta' : 'tulos';
  const fileName = `helerm-export_${new Date().getTime()}.csv`;

  return (
    <CSVLink data={exportData}
      filename={fileName}
      className='btn btn-primary'
      target='_blank'>
        Vie {exportData.length} {countStr} <i className='fa fa-file-excel-o' />
    </CSVLink>
  );
};

Exporter.propTypes = {
  data: PropTypes.array
};

export default Exporter;
