import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
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

const Exporter = ({ data, className, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const exportData = data.reduce(getChildren, []);
  const countStr = exportData.length > 1 ? 'tulosta' : 'tulos';
  const fileName = `helerm-export_${new Date().getTime()}.csv`;

  return (
    <CSVLink data={exportData}
      filename={fileName}
      className={classnames('btn btn-primary', className)}
      target='_blank'>
        Vie {exportData.length} {countStr} <i className='fa fa-file-excel-o' />
    </CSVLink>
  );
};

Exporter.propTypes = {
  className: PropTypes.string,
  data: PropTypes.array,
  isVisible: PropTypes.bool
};

Exporter.defaultProps = {
  isVisible: true
};

export default Exporter;
