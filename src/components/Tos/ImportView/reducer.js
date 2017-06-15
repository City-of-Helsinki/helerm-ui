import update from 'immutability-helper';
import { createAction } from 'redux-actions';
import map from 'lodash/map';

export const EXECUTE_IMPORT = 'executeImportAction';

export function importItems (newItem, level, itemParent) {
  return function (dispatch, getState) {
    dispatch(executeImport(newItem, level, itemParent, getState()));
  };
}

export function executeImport (newItem, level, itemParent, currentState) {
  let importPhases = JSON.parse(JSON.stringify(currentState.selectedTOS.phases));
  let importActions = JSON.parse(JSON.stringify(currentState.selectedTOS.actions));
  let importRecords = JSON.parse(JSON.stringify(currentState.selectedTOS.records));
  const newActions = {};
  const newRecords = {};

  switch (level) {
    case 'phase':
      let phaseIndexes = [];
      for (const key in importPhases) {
        if (importPhases.hasOwnProperty(key)) {
          phaseIndexes.push(importPhases[key].index);
        }
      }
      const newPhaseId = Math.random().toString(36).replace(/[^a-z]+/g, '');

      if (importPhases[newItem].actions) {
        for (const childAction of importPhases[newItem].actions) {
          const newActionId = Math.random().toString(36).replace(/[^a-z]+/g, '');
          const newActionRecords = [];

          if (importActions[childAction].records) {
            for (const childRecord of importActions[childAction].records) {
              const newRecordId = Math.random().toString(36).replace(/[^a-z]+/g, '');
              const newRecord = Object.assign({}, importRecords[childRecord], { id: newRecordId }, { action: newActionId });
              newActionRecords.push(newRecordId);
              newRecords[newRecordId] = newRecord;
            }
          }

          const newAction = Object.assign({}, importActions[childAction], { id: newActionId }, { phase: newPhaseId }, { records: newActionRecords });
          newActions[newActionId] = newAction;
        }
      }
      const newPhaseIndex = phaseIndexes.length > 0 ? Math.max.apply(null, phaseIndexes) + 1 : 1;
      const newPhaseName = (importPhases[newItem].name || '') + ' (KOPIO)';
      const newPhase = Object.assign({}, importPhases[newItem], { id: newPhaseId }, { index: newPhaseIndex }, { name: newPhaseName }, { actions: map(newActions, (newAction) => newAction.id) }, { attributes: { TypeSpecifier: newPhaseName } });

      importPhases[newPhaseId] = newPhase;
      importActions = Object.assign({}, importActions, newActions);
      importRecords = Object.assign({}, importRecords, newRecords);
      break;
    case 'action':
      let actionIndexes = [];
      for (const key in importActions) {
        if (importActions.hasOwnProperty(key)) {
          actionIndexes.push(importActions[key].index);
        }
      }
      const newActionId = Math.random().toString(36).replace(/[^a-z]+/g, '');
      const newActionRecords = [];

      if (importActions[newItem].records) {
        for (const childRecord of importActions[newItem].records) {
          const newRecordId = Math.random().toString(36).replace(/[^a-z]+/g, '');
          const newRecord = Object.assign({}, importRecords[childRecord], { id: newRecordId }, { action: newActionId });
          newActionRecords.push(newRecordId);
          newRecords[newRecordId] = newRecord;
        }
      }
      const newActionIndex = actionIndexes.length > 0 ? Math.max.apply(null, actionIndexes) + 1 : 1;
      const newActionName = (importActions[newItem].name || '') + ' (KOPIO)';
      const newAction = Object.assign({}, importActions[newItem], { id: newActionId }, { phase: itemParent }, { index: newActionIndex }, { name: newActionName }, { records: newActionRecords }, { attributes: { TypeSpecifier: newActionName } });

      importPhases[itemParent].actions.push(newActionId);
      importActions[newActionId] = newAction;
      importRecords = Object.assign({}, importRecords, newRecords);
      break;
    case 'record':
      break;
    default:
      break;
  }

  return createAction(EXECUTE_IMPORT)({ importPhases, importActions, importRecords });
}

export const executeImportAction = (state, { payload }) => {
  return update(state, {
    phases: {
      $set: payload.importPhases
    },
    actions: {
      $set: payload.importActions
    },
    records: {
      $set: payload.importRecords
    }
  });
};
