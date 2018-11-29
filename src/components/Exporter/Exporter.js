import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import isArray from 'lodash/isArray';
import XLSX from 'xlsx';

const getChildren = (array, item) => {
  if (isArray(item.children)) {
    return item.children.reduce(getChildren, array);
  }

  const exportItem = {
    code: item.code,
    name: item.title,
    attributes: item.function_attributes,
    phases: item.phases
  };

  array.push(exportItem);
  return array;
};

/**
 * Get all attributes (phases, actions, records) for specific function
 * @param {object} item
 */
const getAllAttributes = (item) => {
  const allAttributes = Object.keys(item.attributes || {});

  item.phases.forEach((phase) => {
    allAttributes.push(...Object.keys(phase.attributes || {}));
    phase.actions.forEach((action) => {
      allAttributes.push(...Object.keys(action.attributes || {}));
      action.records.forEach((record) => {
        allAttributes.push(...Object.keys(record.attributes || {}));
      });
    });
  });

  // // Add two blank, merge attributes of each items & sort alphabetically
  return [ null, null, ...allAttributes.reduce((a, b) => [...new Set([...a, b])], []).sort() ];
};

/**
 * Set data for row
 * @param {object} item
 * @param {array} headers
 * @param {name} name
 */
const setRowData = (item, headers, name = 'käsittelyprosessi') => {
  const rowData = [name, `${item.code || ''} ${item.name}`];
  Object.keys(item.attributes || {}).forEach((attrName) => {
    const indexInHeaders = headers.indexOf(attrName);
    rowData[indexInHeaders] = item.attributes[attrName];
  });

  return rowData;
};

const createWorkBook = (filename, items) => {
  const workBook = XLSX.utils.book_new();

  items.forEach((item) => {
    const headers = getAllAttributes(item);
    const rows = [];

    // Function-level data
    rows.push(setRowData(item, headers));

    item.phases.forEach((phase) => {
      rows.push(setRowData(phase, headers, 'käsittelyvaihe'));
      phase.actions.forEach((action) => {
        rows.push(setRowData(action, headers, 'toimenpide'));
        action.records.forEach((record) => {
          rows.push(setRowData(record, headers, 'asiakirja'));
        });
      });
    });

    const workSheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(workBook, workSheet, item.code);
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
