/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { filter, find, isEmpty, keys } from 'lodash';

import { getStatusLabel } from '../../../utils/helpers';
import './Preview.scss';
import { BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES } from '../../../constants';
import helpers from './helpers';

const Preview = ({
  conversions,
  getAttributeName,
  getTypeName,
  isFinalPreview,
  items,
  onClose,
  onConfirm,
  onSelect,
}) => {
  const renderItemChanges = (previewItem) => {
    const { changed, item } = previewItem;
    const changes = [];

    BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES.forEach((attribute) => {
      if (changed[attribute.value]) {
        const currentValue = item[attribute.value] || ' ';
        changes.push(helpers.renderFunctionAttributeChange(item, attribute, changed[attribute.value], currentValue));
      }
    });

    if (!isEmpty(changed.attributes)) {
      keys(changed.attributes).forEach((attribute) => {
        const currentValue = item.attributes[attribute] || ' ';
        changes.push(
          helpers.renderAttributeChange(item, attribute, changed.attributes[attribute], getAttributeName, currentValue),
        );
      });
    }

    if (!isEmpty(changed.phases)) {
      helpers.renderPhaseChanges(changed, item, changes, getAttributeName);
    }

    return <div className='preview-changes'>{changes}</div>;
  };

  const renderItemErrors = (previewItem) => {
    const { errors, item } = previewItem;
    const elem = [];

    if (!isEmpty(errors.attributes)) {
      elem.push(
        <p key={`error_function_${item.id}`}>
          <strong>Käsittelyprosessi: </strong>
          {errors.attributes.map((attribute) => getAttributeName(attribute)).join(', ')}
        </p>,
      );
    }

    if (errors.phases) {
      keys(errors.phases).forEach((phaseId) => {
        const phaseError = errors.phases[phaseId];
        const phase = find(item.phases, { id: phaseId });

        if (phaseError.attributes) {
          const attributeLabels = phaseError.attributes.map((attribute) => getAttributeName(attribute)).join(', ');

          elem.push(
            <p className='preview-error-phase' key={`error_phase_${phaseId}`}>
              <strong>{phase.name || ''}: </strong>
              {attributeLabels}
            </p>,
          );
        }

        helpers.renderActionErrors(phaseError, phase, elem, getAttributeName);
      });
    }

    return (
      <div className='preview-errors'>
        <h4>
          <i className='fa-solid fa-triangle-exclamation' /> Esitarkastus:
        </h4>
        {elem}
      </div>
    );
  };

  const selectedCount = filter(items, { selected: true }).length;

  return (
    <div className='preview'>
      <div className='row'>
        <div className='col-xs-12'>
          <button type='button' className='btn btn-link' onClick={onClose}>
            <i className='fa-solid fa-angle-left' /> Takaisin
          </button>
        </div>
        <div className='col-xs-12'>
          <h3>Massamuutos esikatselu</h3>
          <p>
            <strong>{`Muutetaan: ${selectedCount} käsittelyprosessia`}</strong>
          </p>
          {conversions.map((conversion) => (
            <p key={`${conversion.type}-${conversion.value}`}>
              {`${getTypeName(conversion.type)}: ${getAttributeName(conversion.attribute)} = ${conversion.value}`}
            </p>
          ))}
        </div>
        <div className='col-xs-12 preview-actions'>
          {!isFinalPreview && (
            <button type='button' className='btn btn-primary' disabled={selectedCount === 0} onClick={onConfirm}>
              Lisää muutokset
            </button>
          )}
          <button type='button' className='btn btn-default' onClick={onClose}>
            {isFinalPreview ? 'Takaisin' : 'Peruuta'}
          </button>
        </div>
      </div>
      {keys(items).map((id) => (
        <div className='row preview-item' key={id}>
          <div className='col-xs-1'>
            <div
              className={classnames('preview-item-check', { 'preview-item-checked': items[id].selected })}
              onClick={() => {
                onSelect(id);
              }}
              onKeyUp={(event) => {
                if (event.key === 'Enter') {
                  onSelect(id);
                }
              }}
            >
              <i className='fa-solid fa-check' />
            </div>
          </div>
          <div className='col-xs-9'>
            <span className='preview-item-path'>{items[id].item.path.join(' > ')}</span>
            <h4 className='preview-item-name'>{items[id].item.name}</h4>
            {renderItemChanges(items[id])}
            {!isEmpty(items[id].errors) && renderItemErrors(items[id])}
          </div>
          <div className='col-xs-2 preview-item-state'>
            <h4>{getStatusLabel(items[id].item.function_state)}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};

Preview.propTypes = {
  conversions: PropTypes.array.isRequired,
  getAttributeName: PropTypes.func.isRequired,
  getTypeName: PropTypes.func.isRequired,
  isFinalPreview: PropTypes.bool.isRequired,
  items: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Preview;
