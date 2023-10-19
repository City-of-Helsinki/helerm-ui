/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Select from 'react-select';
import { includes, isArray, isEmpty } from 'lodash';
import * as XLSX from 'xlsx';
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

const createWorkBook = (attributeTypes, filename, items) => {
  const workBook = XLSX.utils.book_new();

  items.forEach((item) => {
    const headers = getAllAttributes(item);
    const names = headers.map((header) =>
      attributeTypes && Object.prototype.hasOwnProperty.call(attributeTypes, header)
        ? attributeTypes[header].name || null
        : null,
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

    const workSheet = XLSX.utils.aoa_to_sheet([headers, names, ...rows]);
    XLSX.utils.book_append_sheet(workBook, workSheet, item.code);
  });

  XLSX.writeFile(workBook, filename);
};

const getAttributes = (attributeTypes, type) =>
  Object.keys(attributeTypes || {})
    .reduce((acc, attribute) => {
      if (
        Object.prototype.hasOwnProperty.call(attributeTypes, attribute) &&
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

const getItemAttributes = (attributes, item) => {
  const values = [];
  attributes.forEach((attr) => {
    const value =
      item.attributes && Object.prototype.hasOwnProperty.call(item.attributes, attr.attribute)
        ? item.attributes[attr.attribute]
        : null;
    values.push(isArray(value) ? value.join(', ') : value);
  });
  return values;
};

const createSingleSheetWorkBook = (attributeTypes, filename, items) => {
  const workBook = XLSX.utils.book_new();
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

  const workSheet = XLSX.utils.aoa_to_sheet([attributes, titles]);

  items.forEach((item) => {
    const cols = [];

    CLASSIFICATION_ATTRIBUTES.forEach((attr) => {
      cols.push(Object.prototype.hasOwnProperty.call(item, attr.attribute) ? item[attr.attribute] : null);
    });

    cols.push(...getItemAttributes(functionAttributes, item));

    item.phases.forEach((phase) => {
      const phaseCols = getItemAttributes(phaseAttributes, phase);

      phase.actions.forEach((action) => {
        const actionCols = getItemAttributes(actionAttributes, action);

        action.records.forEach((record) => {
          const recordCols = getItemAttributes(recordAttributes, record);
          XLSX.utils.sheet_add_aoa(workSheet, [[...cols, ...phaseCols, ...actionCols, ...recordCols]], { origin: -1 });
        });

        if (isEmpty(action.records)) {
          XLSX.utils.sheet_add_aoa(workSheet, [[...cols, ...phaseCols, ...actionCols]], { origin: -1 });
        }
      });

      if (isEmpty(phase.actions)) {
        XLSX.utils.sheet_add_aoa(workSheet, [[...cols, ...phaseCols]], {
          origin: -1,
        });
      }
    });

    if (isEmpty(item.phases)) {
      XLSX.utils.sheet_add_aoa(workSheet, [[...cols]], { origin: -1 });
    }
  });

  XLSX.utils.book_append_sheet(workBook, workSheet, 'Tiedonohjaus');
  XLSX.writeFile(workBook, filename);
};

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
        onChange={(e) => {
          if (e.value === 0) {
            createSingleSheetWorkBook(attributeTypes, fileName, exportData);
          } else {
            createWorkBook(attributeTypes, fileName, exportData);
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
