import { isEmpty } from 'lodash';

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

const renderPhaseAttributeChange = (phase, phaseId, attribute, value, getAttributeName, currentValue = ' ') => (
  <h4 key={`phase_${phaseId}_attr_${attribute}`}>
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
  Object.keys(changed.actions).forEach((actionId) => {
    const action = changed.actions[actionId];
    const currentAction = currentPhase.actions ? currentPhase.actions.find((a) => a.id === actionId) : undefined;

    // Action attributes
    if (!isEmpty(action.attributes)) {
      Object.keys(action.attributes).forEach((attribute) => {
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
      Object.keys(action.records).forEach((recordId) => {
        const record = action.records[recordId];
        const currentRecord = currentAction.records ? currentAction.records.find((r) => r.id === recordId) : undefined;

        if (!isEmpty(record.attributes)) {
          Object.keys(record.attributes).forEach((attribute) => {
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
  Object.keys(changed.phases).forEach((phaseId) => {
    const phase = changed.phases[phaseId];
    const currentPhase = item.phases ? item.phases.find((p) => p.id === phaseId) : undefined;

    // Phase attributes
    if (!isEmpty(phase.attributes)) {
      Object.keys(phase.attributes).forEach((attribute) => {
        const currentValue = currentPhase?.attributes?.[attribute] || ' ';
        changes.push(
          renderPhaseAttributeChange(
            currentPhase,
            phaseId,
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
    Object.keys(actionError.records).forEach((recordId) => {
      const recordError = actionError.records[recordId];
      const record = action.records ? action.records.find((r) => r.id === recordId) : undefined;

      // Always push record error paragraph, even if no attributes (to match old behavior)
      const attributeLabels = recordError.attributes
        ? recordError.attributes.map((attribute) => getAttributeName(attribute)).join(', ')
        : '';

      elem.push(
        <p className='preview-error-record' key={`error_record_${recordId}`}>
          <strong>{record.name || ''}: </strong>
          {attributeLabels}
        </p>,
      );
    });
  }
};

const renderActionErrors = (phaseError, phase, elem, getAttributeName) => {
  if (phaseError.actions) {
    Object.keys(phaseError.actions).forEach((actionId) => {
      const actionError = phaseError.actions[actionId];
      const action = phase.actions ? phase.actions.find((a) => a.id === actionId) : undefined;

      // Always push action error paragraph, even if no attributes (to match old behavior)
      const attributeLabels = actionError.attributes
        ? actionError.attributes.map((attribute) => getAttributeName(attribute)).join(', ')
        : '';

      elem.push(
        <p className='preview-error-action' key={`error_action_${actionId}`}>
          <strong>{action.name || ''}: </strong>
          {attributeLabels}
        </p>,
      );

      renderRecordErrors(actionError, action, elem, getAttributeName);
    });
  }
};

export default { renderAttributeChange, renderFunctionAttributeChange, renderPhaseChanges, renderActionErrors };
