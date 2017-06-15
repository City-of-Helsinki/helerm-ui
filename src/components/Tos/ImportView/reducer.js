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

  switch (level) {
    case 'phase':
      let phaseIndexes = [];
      for (const key in importPhases) {
        if (importPhases.hasOwnProperty(key)) {
          phaseIndexes.push(importPhases[key].index);
        }
      }
      const newPhaseId = Math.random().toString(36).replace(/[^a-z]+/g, '');

      const newActions = {};
      const newRecords = {};
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
      break;
    case 'record':
      break;
    default:
      return currentState;
  }

  return createAction(EXECUTE_IMPORT)({ level, importPhases, importActions, importRecords });
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
