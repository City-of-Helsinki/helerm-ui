import { find, isEmpty, keys } from 'lodash';

const renderAttributeChange = (item, attribute, value, getAttributeName, currentValue = ' ') => (
  <h4 key={`function_${item.id}_attribute_${attribute}`}>
    {getAttributeName(attribute)}: <span>({currentValue})</span> {value}
  </h4>
);

const renderFunctionAttributeChange = (item, attribute, value, currentValue = ' ') => (
  <h4 key={`function_${item.id}_attribute_${attribute.value}`}>
    {attribute.label}: <span>({currentValue})</span> {value}
  </h4>
);

const renderPhaseAttributeChange = (phase, attribute, value, getAttributeName, currentValue = ' ') => (
  <h4 key={`phase_${phase.id}_attr_${attribute}`}>
    {phase.name || ''} &gt;
    {getAttributeName(attribute)}: <span>({currentValue})</span> {value}
  </h4>
);

const renderActionAttributeChange = (phase, action, attribute, value, getAttributeName, currentValue = ' ') => (
  <h4 key={`action_${action.id}_attr_${attribute}`}>
    {phase.name || ''} &gt;
    {action.name || ''} &gt;
    {getAttributeName(attribute)}: <span>({currentValue})</span> {value}
  </h4>
);

const renderRecordAttributeChange = (phase, action, record, attribute, value, getAttributeName, currentValue = ' ') => (
  <h4 key={`record_${record.id}_attr_${attribute}`}>
    {phase.name || ''} &gt;
    {action.name || ''} &gt;
    {record.name || ''} &gt;
    {getAttributeName(attribute)}: <span>({currentValue})</span> {value}
  </h4>
);

const renderActionChanges = (changed, phase, currentPhase, changes, getAttributeName) => {
  keys(changed.actions).forEach((actionId) => {
    const action = changed.actions[actionId];
    const currentAction = find(currentPhase.actions, { id: actionId });

    // Action attributes
    if (!isEmpty(action.attributes)) {
      keys(action.attributes).forEach((attribute) => {
        const currentValue = currentAction?.attributes?.[attribute] || ' ';
        changes.push(
          renderActionAttributeChange(
            currentPhase,
            currentAction,
            attribute,
            action.attributes[attribute],
            getAttributeName,
            currentValue,
          ),
        );
      });
    }

    // Action records
    if (!isEmpty(action.records)) {
      keys(action.records).forEach((recordId) => {
        const record = action.records[recordId];
        const currentRecord = find(currentAction.records, { id: recordId });

        if (!isEmpty(record.attributes)) {
          keys(record.attributes).forEach((attribute) => {
            const currentValue = currentRecord?.attributes?.[attribute] || ' ';
            changes.push(
              renderRecordAttributeChange(
                currentPhase,
                currentAction,
                currentRecord,
                attribute,
                record.attributes[attribute],
                getAttributeName,
                currentValue,
              ),
            );
          });
        }
      });
    }
  });
};

const renderPhaseChanges = (changed, item, changes, getAttributeName) => {
  keys(changed.phases).forEach((phaseId) => {
    const phase = changed.phases[phaseId];
    const currentPhase = find(item.phases, { id: phaseId });

    // Phase attributes
    if (!isEmpty(phase.attributes)) {
      keys(phase.attributes).forEach((attribute) => {
        const currentValue = currentPhase?.attributes?.[attribute] || ' ';
        changes.push(
          renderPhaseAttributeChange(
            currentPhase,
            attribute,
            phase.attributes[attribute],
            getAttributeName,
            currentValue,
          ),
        );
      });
    }

    // Phase actions
    if (!isEmpty(phase.actions)) {
      renderActionChanges(phase, phaseId, currentPhase, changes, getAttributeName);
    }
  });
};

const renderRecordErrors = (actionError, action, elem, getAttributeName) => {
  if (actionError.records) {
    keys(actionError.records).forEach((recordId) => {
      const recordError = actionError.records[recordId];
      const record = find(action.records, { id: recordId });

      if (recordError.attributes) {
        const attributeLabels = recordError.attributes.map((attribute) => getAttributeName(attribute)).join(', ');

        elem.push(
          <p className='preview-error-record' key={`error_record_${recordId}`}>
            <strong>{record.name || ''}: </strong>
            {attributeLabels}
          </p>,
        );
      }
    });
  }
};

const renderActionErrors = (phaseError, phase, elem, getAttributeName) => {
  if (phaseError.actions) {
    keys(phaseError.actions).forEach((actionId) => {
      const actionError = phaseError.actions[actionId];
      const action = find(phase.actions, { id: actionId });

      if (actionError.attributes) {
        const attributeLabels = actionError.attributes.map((attribute) => getAttributeName(attribute)).join(', ');

        elem.push(
          <p className='preview-error-action' key={`error_action_${actionId}`}>
            <strong>{action.name || ''}: </strong>
            {attributeLabels}
          </p>,
        );
      }

      renderRecordErrors(actionError, action, elem, getAttributeName);
    });
  }
};

export default { renderAttributeChange, renderFunctionAttributeChange, renderPhaseChanges, renderActionErrors };
