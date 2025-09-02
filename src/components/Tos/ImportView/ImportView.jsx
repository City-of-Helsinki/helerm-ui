/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ImportView.scss';
import _ from 'lodash';

const ImportView = (props) => {
  const {
    actions,
    importItems,
    itemsToImportText,
    level,
    parent,
    phases,
    phasesOrder,
    records,
    showItems,
    targetText,
    title,
    toggleImportView,
  } = props;

  const [selectedElements, setSelectedElements] = useState([]);
  const [values] = useState(props[`${level}s`]);

  useEffect(() => {
    document.body.classList.add('noscroll');

    return () => {
      document.body.classList.remove('noscroll');
    };
  }, []);

  const getTargetName = useCallback((specifier, type) => {
    const hasType = type?.length;
    const hasTypeSpecifier = specifier?.length;
    const slash = hasType && hasTypeSpecifier ? ' / ' : '';

    return (type || '') + slash + (specifier || '');
  }, []);

  const selectForImport = useCallback((e, element) => {
    e.preventDefault();
    setSelectedElements((prev) => [...prev, element]);
  }, []);

  const removeFromImport = useCallback((e, elementIndex) => {
    e.preventDefault();
    setSelectedElements((prev) => {
      const newArray = [...prev];
      newArray.splice(elementIndex, 1);
      return newArray;
    });
  }, []);

  const generateLinks = useCallback(
    (values, items) => {
      const links = [];
      let itemsInArray = items;
      if (!items.length) {
        itemsInArray = Object.keys(items);
      }
      Object.keys(itemsInArray).forEach((key) => {
        if (Object.hasOwn(itemsInArray, key)) {
          links.push(
            <div key={key} className='import-row-title' data-testid={`import-row-item-${itemsInArray[key]}`}>
              <span
                key={key}
                className='import-row-link'
                data-testid={`import-row-link-${values[itemsInArray[key]].id}`}
                onClick={(e) => selectForImport(e, values[itemsInArray[key]].id)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    selectForImport(e, values[itemsInArray[key]].id);
                  }
                }}
              >
                {getTargetName(
                  values[itemsInArray[key]].attributes.TypeSpecifier,
                  values[itemsInArray[key]].attributes[`${_.capitalize(level)}Type`],
                )}
              </span>
            </div>,
          );
        }
      });
      return links;
    },
    [selectForImport, getTargetName, level],
  );

  const generateActionItems = useCallback(() => {
    return phasesOrder.map((phase) => {
      const actionElements = generateLinks(actions, phases[phase].actions);
      return (
        <div key={phases[phase].id} className='col-xs-12'>
          <span className='import-row-title'>
            {getTargetName(phases[phase].attributes.TypeSpecifier, phases[phase].attributes.PhaseType)}
          </span>
          <div className='import-action-record-wrapper'>{actionElements}</div>
        </div>
      );
    });
  }, [phasesOrder, phases, actions, generateLinks, getTargetName]);

  const generateRecordItems = useCallback(() => {
    return phasesOrder.map((phase) => {
      const actionElements = [];
      if (_.keys(phases[phase].actions).length > 0) {
        phases[phase].actions.forEach((action) => {
          if (_.keys(actions[action].records).length > 0) {
            const recordElements = generateLinks(records, actions[action].records);
            actionElements.push(
              <div key={actions[action].id} className='import-action-record-wrapper'>
                <span className='import-row-title'>
                  {getTargetName(actions[action].attributes.TypeSpecifier, actions[action].attributes.ActionType)}
                </span>
                <div className='import-action-record-wrapper'>{recordElements}</div>
              </div>,
            );
          }
        });
      }
      let phaseTitle;
      if (phases[phase].actions.length > 0) {
        phaseTitle = (
          <span className='import-row-title import-phase-title'>
            {getTargetName(phases[phase].attributes.TypeSpecifier, phases[phase].attributes.PhaseType)}
          </span>
        );
      }
      return (
        <div key={phases[phase].id} className='import-wrapper'>
          {phaseTitle}
          {actionElements}
        </div>
      );
    });
  }, [phasesOrder, phases, actions, records, generateLinks, getTargetName]);

  const generateImportableElements = useCallback(
    (level) => {
      let elements;
      switch (level) {
        case 'phase':
          elements = generateLinks(phases, phasesOrder);
          break;
        case 'action':
          elements = generateActionItems();
          break;
        case 'record':
          elements = generateRecordItems();
          break;
        default:
          elements = null;
      }
      return elements;
    },
    [phases, phasesOrder, generateLinks, generateActionItems, generateRecordItems],
  );

  const handleImportItems = useCallback(() => {
    const newElements = selectedElements;
    newElements.forEach((element) => {
      importItems({ newItem: element, level, itemParent: parent });
    });
    if (typeof showItems === 'function') {
      showItems();
    }
    toggleImportView();
  }, [selectedElements, importItems, level, parent, showItems, toggleImportView]);

  const importableElements = generateImportableElements(level);

  return (
    <div className='row' data-testid='import-view'>
      <h3 data-testid='import-view-title'>
        Tuo {title} {targetText}
      </h3>
      <h5 className='col-xs-6' data-testid='import-view-select-items'>
        Valitse listalta tuotavat {itemsToImportText}
      </h5>
      <h5 className='col-xs-6' data-testid='import-view-selected-items'>
        Tuotavat {itemsToImportText}
      </h5>
      <div className='col-xs-12'>
        <div className='col-xs-6 importable-elements' data-testid='import-view-available-elements'>
          {importableElements}
        </div>
        <div className='col-xs-6 importable-elements' data-testid='import-view-selected-elements'>
          {selectedElements.length > 0 && (
            <div>
              {selectedElements.map((element, index) => (
                <span
                  key={element}
                  onClick={(e) => removeFromImport(e, index)}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      removeFromImport(e, index);
                    }
                  }}
                  className='col-xs-12 importable-element-link'
                  data-testid={`import-view-selected-element-${index}`}
                >
                  {values[element].attributes.TypeSpecifier ||
                    values[element].attributes[`${_.capitalize(level)}Type`] ||
                    '-'}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className='col-xs-12 button-row' data-testid='import-view-button-row'>
        <button
          type='button'
          onClick={handleImportItems}
          className='btn btn-primary pull-right'
          data-testid='import-view-import-button'
        >
          Tuo
        </button>
        <button
          type='button'
          onClick={toggleImportView}
          className='btn btn-danger pull-right'
          data-testid='import-view-cancel-button'
        >
          Peruuta
        </button>
      </div>
    </div>
  );
};

ImportView.propTypes = {
  actions: PropTypes.object.isRequired,
  importItems: PropTypes.func.isRequired,
  itemsToImportText: PropTypes.string.isRequired,
  level: PropTypes.string.isRequired,
  parent: PropTypes.string,
  phases: PropTypes.object.isRequired,
  phasesOrder: PropTypes.array.isRequired,
  records: PropTypes.object.isRequired,
  showItems: PropTypes.func,
  targetText: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  toggleImportView: PropTypes.func.isRequired,
};

export default ImportView;
