/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { filter, find, isEmpty, keys } from 'lodash';

import { getStatusLabel } from '../../../utils/helpers';
import './Preview.scss';
import { BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES } from '../../../constants';

class Preview extends React.Component {
  renderItemChanges(previewItem) {
    const { getAttributeName } = this.props;
    const { changed, item } = previewItem;
    const changes = [];

    BULK_UPDATE_SEARCH_ADDITIONAL_FUNCTION_ATTRIBUTES.forEach((attribute) => {
      if (changed[attribute.value]) {
        const currentValue = item[attribute.value] || ' ';
        changes.push(
          <h4 key={`function_${item.id}_attribute_${attribute.value}`}>
            {attribute.label}: <span>({currentValue})</span> {changed[attribute.value]}
          </h4>,
        );
      }
    });
    if (!isEmpty(changed.attributes)) {
      keys(changed.attributes).forEach((attribute) => {
        const currentValue = item.attributes[attribute] || ' ';
        changes.push(
          <h4 key={`function_${item.id}_attribute_${attribute}`}>
            {getAttributeName(attribute)}: <span>({currentValue})</span> {changed.attributes[attribute]}
          </h4>,
        );
      });
    }
    if (!isEmpty(changed.phases)) {
      keys(changed.phases).forEach((phase) => {
        const currentPhase = find(item.phases, { id: phase });
        if (!isEmpty(changed.phases[phase].attributes)) {
          keys(changed.phases[phase].attributes).forEach((attribute) => {
            const currentValue = currentPhase?.attributes?.[attribute] || ' ';
            changes.push(
              <h4 key={`phase_${phase}_attr_${attribute}`}>
                {currentPhase.name || ''} &gt;
                {getAttributeName(attribute)}: <span>({currentValue})</span>{' '}
                {changed.phases[phase].attributes[attribute]}
              </h4>,
            );
          });
        }
        if (!isEmpty(changed.phases[phase].actions)) {
          keys(changed.phases[phase].actions).forEach((action) => {
            const currentAction = find(currentPhase.actions, { id: action });
            if (!isEmpty(changed.phases[phase].actions[action].attributes)) {
              keys(changed.phases[phase].actions[action].attributes).forEach((attribute) => {
                const currentValue = currentAction?.attributes?.[attribute] || ' ';
                changes.push(
                  <h4 key={`action_${action}_attr_${attribute}`}>
                    {currentPhase.name || ''} &gt;
                    {currentAction.name || ''} &gt;
                    {getAttributeName(attribute)}: <span>({currentValue})</span>{' '}
                    {changed.phases[phase].actions[action].attributes[attribute]}
                  </h4>,
                );
              });
            }
            if (!isEmpty(changed.phases[phase].actions[action].records)) {
              keys(changed.phases[phase].actions[action].records).forEach((record) => {
                const currentRecord = find(currentAction.records, { id: record });
                if (!isEmpty(changed.phases[phase].actions[action].records[record].attributes)) {
                  keys(changed.phases[phase].actions[action].records[record].attributes).forEach((attribute) => {
                    const currentValue = currentRecord?.attributes?.[attribute] || ' ';
                    changes.push(
                      <h4 key={`record_${record}_attr_${attribute}`}>
                        {currentPhase.name || ''} &gt;
                        {currentAction.name || ''} &gt;
                        {currentRecord.name || ''} &gt;
                        {getAttributeName(attribute)}: <span>({currentValue})</span>{' '}
                        {changed.phases[phase].actions[action].records[record].attributes[attribute]}
                      </h4>,
                    );
                  });
                }
              });
            }
          });
        }
      });
    }
    return <div className='preview-changes'>{changes}</div>;
  }

  renderItemErrors(previewItem) {
    const { getAttributeName } = this.props;
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
        elem.push(
          <p className='preview-error-phase' key={`error_phase_${phaseId}`}>
            <strong>{phase.name || ''}: </strong>
            {!!phaseError.attributes &&
              phaseError.attributes.map((attribute) => getAttributeName(attribute)).join(', ')}
          </p>,
        );
        if (phaseError.actions) {
          keys(phaseError.actions).forEach((actionId) => {
            const actionError = phaseError.actions[actionId];
            const action = find(phase.actions, { id: actionId });
            elem.push(
              <p className='preview-error-action' key={`error_action_${actionId}`}>
                <strong>{action.name || ''}: </strong>
                {!!actionError.attributes &&
                  actionError.attributes.map((attribute) => getAttributeName(attribute)).join(', ')}
              </p>,
            );
            if (actionError.records) {
              keys(actionError.records).forEach((recordId) => {
                const recordError = actionError.records[recordId];
                const record = find(action.records, { id: recordId });
                elem.push(
                  <p className='preview-error-record' key={`error_record_${recordId}`}>
                    <strong>{record.name || ''}: </strong>
                    {!!recordError.attributes &&
                      recordError.attributes.map((attribute) => getAttributeName(attribute)).join(', ')}
                  </p>,
                );
              });
            }
          });
        }
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
  }

  render() {
    const { conversions, getAttributeName, getTypeName, isFinalPreview, items } = this.props;
    const selectedCount = filter(items, { selected: true }).length;

    return (
      <div className='preview'>
        <div className='row'>
          <div className='col-xs-12'>
            <button type='button' className='btn btn-link' onClick={this.props.onClose}>
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
              <button
                type='button'
                className='btn btn-primary'
                disabled={selectedCount === 0}
                onClick={this.props.onConfirm}
              >
                Lisää muutokset
              </button>
            )}
            <button type='button' className='btn btn-default' onClick={this.props.onClose}>
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
                  this.props.onSelect(id);
                }}
                onKeyUp={(event) => {
                  if (event.key === 'Enter') {
                    this.props.onSelect(id);
                  }
                }}
              >
                <i className='fa-solid fa-check' />
              </div>
            </div>
            <div className='col-xs-9'>
              <span className='preview-item-path'>{items[id].item.path.join(' > ')}</span>
              <h4 className='preview-item-name'>{items[id].item.name}</h4>
              {this.renderItemChanges(items[id])}
              {!isEmpty(items[id].errors) && this.renderItemErrors(items[id])}
            </div>
            <div className='col-xs-2 preview-item-state'>
              <h4>{getStatusLabel(items[id].item.function_state)}</h4>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

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
