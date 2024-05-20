/* eslint-disable react/forbid-prop-types */
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
 * Component for exporting data to Excel.
 *
 * @param {Object} attributeTypes - The attribute types object.
 * @param {Array} data - An array of data to be exported.
 * @param {string} className - The CSS class name for the component.
 * @param {boolean} isVisible - Indicates whether the component is visible or not.
 * @returns {JSX.Element|null} - The Exporter component.
 */
const Exporter = ({ attributeTypes, data, className, isVisible }) => {
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

    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(new Blob([buffer], { type: FILE_TYPE }));
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.remove();
  };

  const createWorkBook = async (getAttributeTypes, filename, items) => {
    const workBook = new ExcelJs.Workbook();

    items.forEach((item) => {
      const headers = getAllAttributes(item);
      const names = headers.map((header) =>
        getAttributeTypes && Object.hasOwn(getAttributeTypes, header) ? getAttributeTypes[header].name || null : null,
      );
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
   * @param {Object} getAttributeTypes - The attribute types object.
   * @param {string} type - The type of attribute.
   * @returns {Array} - An array of attributes.
   */
  const getAttributes = (getAttributeTypes, type) =>
    Object.keys(getAttributeTypes || {})
      .reduce((acc, attribute) => {
        if (
          Object.hasOwn(getAttributeTypes, attribute) &&
          getAttributeTypes[attribute].allowedIn &&
          includes(getAttributeTypes[attribute].allowedIn, type)
        ) {
          acc.push({
            attribute,
            index: getAttributeTypes[attribute].index || 100,
            name: getAttributeTypes[attribute].name,
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
   * Creates a single sheet workbook using the provided attribute types, filename, and items.
   *
   * @param {Function} getAttributeTypes - A function that returns the attribute types.
   * @param {string} filename - The name of the file to be downloaded.
   * @param {Array} items - An array of items.
   * @returns {Promise<void>} - A promise that resolves when the file is downloaded.
   */
  const createSingleSheetWorkBook = async (getAttributeTypes, filename, items) => {
    const workBook = new ExcelJs.Workbook();

    const functionAttributes = getAttributes(getAttributeTypes, 'function');
    const phaseAttributes = getAttributes(getAttributeTypes, 'phase');
    const actionAttributes = getAttributes(getAttributeTypes, 'action');
    const recordAttributes = getAttributes(getAttributeTypes, 'record');
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

    const workSheet = workBook.addWorksheet('Tiedonohjaus');
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

          action.records.forEach((record) => {
            const recordCols = getItemAttributes(recordAttributes, record);
            const recordData = [[...cols, ...phaseCols, ...actionCols, ...recordCols]];

            recordData.forEach((row) => workSheet.addRow(row));
          });

          if (isEmpty(action.records)) {
            const recordData = [[...cols, ...phaseCols, ...actionCols]];

            recordData.forEach((row) => workSheet.addRow(row));
          }
        });

        if (isEmpty(phase.actions)) {
          const recordData = [[...cols, ...phaseCols]];

          recordData.forEach((row) => workSheet.addRow(row));
        }
      });

      if (isEmpty(item.phases)) {
        const recordData = [[...cols]];

        recordData.forEach((row) => workSheet.addRow(row));
      }
    });

    await downloadFile(workBook, filename);
  };

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
