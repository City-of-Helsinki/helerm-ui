/* eslint-disable jsx-a11y/interactive-supports-focus */
import React, { createElement, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './CloneView.scss';
import Navigation from '../../Navigation/Navigation';

const METHOD_TEMPLATE = 'template';
const METHOD_FUNCTION = 'function';

const CloneView = ({ templates, toggleCloneView, cloneFromTemplate, setNavigationVisibility }) => {
  const [selectedItem, setSelectedItem] = useState({});
  const [selectedMethod, setSelectedMethod] = useState(METHOD_TEMPLATE);

  useEffect(() => {
    setNavigationVisibility(true);

    return () => {
      setNavigationVisibility(false);
    };
  }, [setNavigationVisibility]);

  const handleCloneFromTemplate = (id) => {
    setNavigationVisibility(false);
    toggleCloneView();

    return cloneFromTemplate(selectedMethod, id);
  };

  const clearSelected = () => {
    return setSelectedItem({});
  };

  const handleSelectItem = ({ id, name }) => {
    setSelectedItem({ id, name });
  };

  const handleSelectMethod = (method) => {
    return setSelectedMethod(method);
  };

  const handleToggleCloneView = () => {
    setNavigationVisibility(false);

    return toggleCloneView();
  };

  const hasSelectedItem = !!selectedItem.id;

  const treeViewProps = {
    tosPath: [],
    showNavigation: true,
    onLeafMouseClick: (event, leaf) => {
      const { name } = leaf;
      return handleSelectItem({ id: leaf.function, name });
    },
  };

  const treeView = createElement(Navigation, treeViewProps);

  return (
    <div className='row clone__view'>
      <ul className='nav nav-tabs disabled'>
        <li
          className={classnames({
            disabled: hasSelectedItem,
            active: selectedMethod === METHOD_TEMPLATE,
          })}
        >
          <span
            className='import-button'
            role='button'
            onClick={() => handleSelectMethod(METHOD_TEMPLATE)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                handleSelectMethod(METHOD_TEMPLATE);
              }
            }}
          >
            Tuo kuvaus moduulista
          </span>
        </li>
        <li
          className={classnames({
            disabled: hasSelectedItem,
            active: selectedMethod === METHOD_FUNCTION,
          })}
        >
          <span
            className='import-button'
            role='button'
            onClick={() => handleSelectMethod(METHOD_FUNCTION)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                handleSelectMethod(METHOD_FUNCTION);
              }
            }}
          >
            Tuo kuvaus toisesta kuvauksesta
          </span>
        </li>
      </ul>

      {!hasSelectedItem && selectedMethod === METHOD_TEMPLATE && (
        <div className='importable-elements'>
          <div className='list-group'>
            {templates.map(({ name, id }) => (
              <button
                key={id}
                type='button'
                className={classnames('list-group-item', {
                  active: selectedItem.id === id,
                })}
                onClick={() => handleSelectItem({ id, name })}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasSelectedItem && selectedMethod === METHOD_FUNCTION && <div className='row'>{treeView}</div>}

      {hasSelectedItem && (
        <div className='clone-controls clearfix'>
          <div className='alert alert-info' role='alert'>
            <strong>Tuotava kuvaus:</strong> <em>{selectedItem.name}</em>
            <button type='button' onClick={clearSelected} className='btn btn-xs btn-default pull-right'>
              Tyhjennä valinta <i className='fa-solid fa-xmark' />
            </button>
          </div>
          <button
            type='button'
            onClick={() => handleCloneFromTemplate(selectedItem.id)}
            className='btn btn-success pull-right'
            disabled={!hasSelectedItem}
          >
            Tuo <i className='fa-solid fa-clone' />
          </button>
          <button type='button' onClick={handleToggleCloneView} className='btn btn-danger pull-right'>
            Peruuta
          </button>
        </div>
      )}
    </div>
  );
};

CloneView.propTypes = {
  cloneFromTemplate: PropTypes.func,
  setNavigationVisibility: PropTypes.func,
  templates: PropTypes.array,
  toggleCloneView: PropTypes.func,
};

export default CloneView;
