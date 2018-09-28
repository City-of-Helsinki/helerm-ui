import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isArray from 'lodash/isArray';
import XLSX from 'xlsx';

const getChildren = (array, item) => {
  if (isArray(item.children)) {
    return item.children.reduce(getChildren, array);
  }

  // XX XX XX Käsittelyprosessi (function)
  //    => function_attributes

  // käsittelyvaihe
  //    => function_attributes
  // toimenpide
  //    => function_attributes
  // Asiakirja
  //    => function_attributes
  // Asiakirja
  //    => function_attributes
  // Asiakirja
  //    => function_attributes
  // ...
  const exportItem = {
    code: item.code,
    name: item.title,
    attributes: item.function_attributes
  };

  array.push(exportItem);
  return array;
};

const createWorkBook = (filename, items) => {
  const workBook = XLSX.utils.book_new();

  // Add two blank, merge attributes of each items & sort alphabetically
  const headers = [null, null, ...items.map(({ attributes }) => Object.keys(attributes)).reduce((a, b) => [...new Set([...a, ...b])], []).sort()];

  items.forEach(({ name, attributes, code }) => {
    const data = [];
    // TODO: Just käsittelyprosessi for now, add the phases & actions from loop
    data[0] = 'käsittelyprosessi';
    data[1] = `${code} ${name}`;

    Object.keys(attributes).forEach((attrName) => {
      const indexInHeaders = headers.indexOf(attrName);
      data[indexInHeaders] = attributes[attrName];
    });

    const workSheet = XLSX.utils.aoa_to_sheet([headers, data]);
    XLSX.utils.book_append_sheet(workBook, workSheet, code);
  });

  XLSX.writeFile(workBook, filename);
};

const Exporter = ({ data, className, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const exportData = data.reduce(getChildren, []);
  const countStr = exportData.length > 1 ? 'tulosta' : 'tulos';
  const fileName = `helerm-export_${new Date().getTime()}.xlsx`;

  return (
    <button
      className={classnames('btn btn-primary', className)}
      target='_blank'
      onClick={() => createWorkBook(fileName, exportData)}>
      Vie {exportData.length} {countStr} <i className='fa fa-file-excel-o' />
    </button>
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
