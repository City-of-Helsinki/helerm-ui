import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Select from 'react-select';
import { includes, isArray, isEmpty } from 'lodash';
import * as ExcelJs from 'exceljs';
import moment from 'moment';

const CLASSIFICATION_ATTRIBUTES = [
  { attribute: 'code', name: 'Koodi', type: 'classification' },
  { attribute: 'name', name: 'Nimi', type: 'classification' },
  { attribute: 'description', name: 'Kuvaus', type: 'classification' },
  {
    attribute: 'descriptionInternal',
    name: 'Sisäinen kuvaus',
    type: 'classification',
  },
  {
    attribute: 'relatedClassification',
    name: 'Liittyvä tehtäväluokka',
    type: 'classification',
  },
  {
    attribute: 'additionalInformation',
    name: 'Lisätiedot',
    type: 'classification',
  },
];

export const EXPORT_OPTIONS = [
  { value: 0, label: 'Yhdelle välilehdelle' },
  { value: 1, label: 'Omille välilehdille' },
];

const FILE_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Recursively retrieves children from an item and adds them to an array.
 *
 * @param {Array} array - The array to store the exported items.
 * @param {Object} item - The item to process and extract children from.
 * @returns {Array} - The updated array with the exported items.
 */
const getChildren = (array, item) => {
  if (isArray(item.children)) {
    return item.children.reduce(getChildren, array);
  }
  const exportItem = {
    additionalInformation: item.additional_information,
    code: item.code,
    description: item.description,
    descriptionInternal: item.description_internal,
    name: item.title,
    relatedClassification: item.related_classification,
    attributes: item.function_attributes,
    phases: item.phases,
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
  return [null, null, ...allAttributes.reduce((a, b) => [...new Set([...a, b])], []).sort((a, b) => a - b)];
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

/**
 * Downloads a file using the provided workbook and filename.
 *
 * @param {Object} workBook - The workbook object to be downloaded.
 * @param {string} filename - The name of the file to be downloaded.
 * @returns {Promise<void>} - A promise that resolves when the file has been downloaded.
 */
const downloadFile = async (workBook, filename) => {
  const buffer = await workBook.xlsx.writeBuffer();
  const blobUrl = window.URL.createObjectURL(new Blob([buffer], { type: FILE_TYPE }));

  const link = document.createElement('a');

  link.href = blobUrl;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(blobUrl);
  link.remove();
};

/**
 * Creates a workbook using the provided attribute types, filename, and items.
 *
 * @param {Function} attributeTypes - A function that returns the attribute types.
 * @param {string} filename - The name of the file to be downloaded.
 * @param {Array} items - An array of items.
 * @returns {Promise<void>} - A promise that resolves when the file is downloaded.
 */
const createWorkBook = async (attributeTypes, filename, items) => {
  const workBook = new ExcelJs.Workbook();

  items.forEach((item) => {
    const headers = getAllAttributes(item);
    const names = headers.map((header) =>
      attributeTypes && Object.hasOwn(attributeTypes, header) ? attributeTypes[header].name || null : null,
    );
    const rows = [];

    // Function-level data
    rows.push(setRowData(item, headers));

    item.phases.forEach((phase) => {
      rows.push(setRowData(phase, headers, 'käsittelyvaihe'));
      phase.actions.forEach((action) => {
        rows.push(setRowData(action, headers, 'toimenpide'));
        // eslint-disable-next-line sonarjs/no-nested-functions
        action.records.forEach((record) => {
          rows.push(setRowData(record, headers, 'asiakirja'));
        });
      });
    });

    const workSheet = workBook.addWorksheet(item.code);

    workSheet.addRow(headers);
    workSheet.addRow(names);

    rows.forEach((row) => workSheet.addRow(row));
  });

  await downloadFile(workBook, filename);
};

/**
 * Retrieves attributes based on the given attribute types and type.
 *
 * @param {Object} attributeTypes - The attribute types object.
 * @param {string} type - The type of attribute.
 * @returns {Array} - An array of attributes.
 */
const getAttributes = (attributeTypes, type) =>
  Object.keys(attributeTypes || {})
    .reduce((acc, attribute) => {
      if (
        Object.hasOwn(attributeTypes, attribute) &&
        attributeTypes[attribute].allowedIn &&
        includes(attributeTypes[attribute].allowedIn, type)
      ) {
        acc.push({
          attribute,
          index: attributeTypes[attribute].index || 100,
          name: attributeTypes[attribute].name,
          type,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.index - b.index);

/**
 * Retrieves the values of specified attributes from an item.
 *
 * @param {Array} attributes - The list of attributes to retrieve values for.
 * @param {Object} item - The item object containing attributes.
 * @returns {Array} - The values of the specified attributes.
 */
const getItemAttributes = (attributes, item) => {
  const values = [];
  attributes.forEach((attr) => {
    const value =
      item.attributes && Object.hasOwn(item.attributes, attr.attribute) ? item.attributes[attr.attribute] : null;
    values.push(isArray(value) ? value.join(', ') : value);
  });
  return values;
};

/**
 * Adds rows of data to a worksheet.
 *
 * @param {Array<Array<any>>} data - The data to be added as rows.
 * @param {Worksheet} workSheet - The worksheet to add the rows to.
 * @returns {Worksheet} The updated worksheet with the added rows.
 */
const worksheetAddRows = (data, workSheet) => {
  data.forEach((row) => workSheet.addRow(row));

  return workSheet;
};

/**
 * Creates a single sheet workbook using the provided attribute types, filename, and items.
 *
 * @param {Function} attributeTypes - A function that returns the attribute types.
 * @param {string} filename - The name of the file to be downloaded.
 * @param {Array} items - An array of items.
 * @returns {Promise<void>} - A promise that resolves when the file is downloaded.
 */
const createSingleSheetWorkBook = async (attributeTypes, filename, items) => {
  const workBook = new ExcelJs.Workbook();

  const functionAttributes = getAttributes(attributeTypes, 'function');
  const phaseAttributes = getAttributes(attributeTypes, 'phase');
  const actionAttributes = getAttributes(attributeTypes, 'action');
  const recordAttributes = getAttributes(attributeTypes, 'record');
  const attributes = [];
  const titles = [];

  [
    ...CLASSIFICATION_ATTRIBUTES,
    ...functionAttributes,
    ...phaseAttributes,
    ...actionAttributes,
    ...recordAttributes,
  ].forEach((attr) => {
    attributes.push(`${attr.type}.${attr.attribute}`);
    titles.push(attr.name);
  });

  let workSheet = workBook.addWorksheet('Tiedonohjaus');
  const rows = [attributes, titles];

  rows.forEach((row) => workSheet.addRow(row));

  items.forEach((item) => {
    const cols = [];

    CLASSIFICATION_ATTRIBUTES.forEach((attr) => {
      cols.push(Object.hasOwn(item, attr.attribute) ? item[attr.attribute] : null);
    });

    cols.push(...getItemAttributes(functionAttributes, item));

    item.phases.forEach((phase) => {
      const phaseCols = getItemAttributes(phaseAttributes, phase);

      phase.actions.forEach((action) => {
        const actionCols = getItemAttributes(actionAttributes, action);

        // eslint-disable-next-line sonarjs/no-nested-functions
        action.records.forEach((record) => {
          const recordCols = getItemAttributes(recordAttributes, record);
          const data = [[...cols, ...phaseCols, ...actionCols, ...recordCols]];

          workSheet = worksheetAddRows(data, workSheet);
        });

        if (isEmpty(action.records)) {
          const data = [[...cols, ...phaseCols, ...actionCols]];

          workSheet = worksheetAddRows(data, workSheet);
        }
      });

      if (isEmpty(phase.actions)) {
        const data = [[...cols, ...phaseCols]];

        workSheet = worksheetAddRows(data, workSheet);
      }
    });

    if (isEmpty(item.phases)) {
      const data = [[...cols]];

      workSheet = worksheetAddRows(data, workSheet);
    }
  });

  await downloadFile(workBook, filename);
};

/**
 * Component for exporting data to Excel.
 *
 * @param {Object} attributeTypes - The attribute types object.
 * @param {Array} data - An array of data to be exported.
 * @param {string} className - The CSS class name for the component.
 * @param {boolean} isVisible - Indicates whether the component is visible or not.
 * @returns {JSX.Element|null} - The Exporter component.
 */
const Exporter = ({ attributeTypes, data, className, isVisible }) => {
  if (!isVisible) {
    return null;
  }

  const exportData = data.reduce(getChildren, []);
  const fileName = `helerm-export_${moment().format('DD.MM.YYYY')}.xlsx`;

  return (
    <div className={classnames('exporter', className)}>
      <Select
        className='Select'
        styles={{
          container: (base) => ({
            ...base,
            minWidth: '320px',
          }),
        }}
        isClearable={false}
        value={null}
        onChange={async (e) => {
          if (e.value === 0) {
            await createSingleSheetWorkBook(attributeTypes, fileName, exportData);
          } else {
            await createWorkBook(attributeTypes, fileName, exportData);
          }
        }}
        autoFocus
        options={EXPORT_OPTIONS}
        placeholder={`Vie hakutulokset Exceliin (${exportData.length})`}
      />
    </div>
  );
};

Exporter.propTypes = {
  attributeTypes: PropTypes.object,
  className: PropTypes.string,
  data: PropTypes.array.isRequired,
  isVisible: PropTypes.bool,
};

Exporter.defaultProps = {
  isVisible: true,
};

export default Exporter;
