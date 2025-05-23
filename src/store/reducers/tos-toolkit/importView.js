/* eslint-disable no-case-declarations */
import { map } from 'lodash';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { randomActionId } from '../../../utils/helpers';

export const executeImportReducer = (state, action) => {
  const { importPhases, importActions, importRecords } = action.payload;

  state.phases = importPhases;
  state.actions = importActions;
  state.records = importRecords;

  return state;
};

export const prepareImport = (newItem, level, itemParent, currentState) => {
  const importPhases = JSON.parse(JSON.stringify(currentState.selectedTOS.phases));
  let importActions = JSON.parse(JSON.stringify(currentState.selectedTOS.actions));
  let importRecords = JSON.parse(JSON.stringify(currentState.selectedTOS.records));
  const newActions = {};
  const newRecords = {};

  switch (level) {
    case 'phase':
      const phaseIndexes = [];
      Object.keys(importPhases).forEach(key => {
        if (Object.hasOwn(importPhases, key)) {
          phaseIndexes.push(importPhases[key].index);
        }
      });
      const newPhaseId = randomActionId();

      if (importPhases[newItem].actions) {
        importPhases[newItem].actions.forEach(childAction => {
          const newActionId = randomActionId();
          const newActionRecords = [];
          if (importActions[childAction].records) {
            importActions[childAction].records.forEach(childRecord => {
              const newRecordId = randomActionId();
              const newRecord = { ...importRecords[childRecord], id: newRecordId, action: newActionId };
              newActionRecords.push(newRecordId);
              newRecords[newRecordId] = newRecord;
            });
          }

          const newAction = { ...importActions[childAction], id: newActionId, phase: newPhaseId, records: newActionRecords };
          newActions[newActionId] = newAction;
        });
      }
      const newPhaseIndex = phaseIndexes.length > 0 ? Math.max.apply(null, phaseIndexes) + 1 : 1;
      const newPhaseName = `${importPhases[newItem].name || ''} (KOPIO)`;
      const newPhaseAttributes = { ...importPhases[newItem].attributes, TypeSpecifier: newPhaseName };
      const newPhase = { ...importPhases[newItem], id: newPhaseId, index: newPhaseIndex, name: newPhaseName, actions: map(newActions, (newAction) => newAction.id), attributes: newPhaseAttributes };

      importPhases[newPhaseId] = newPhase;
      importActions = { ...importActions, ...newActions };
      importRecords = { ...importRecords, ...newRecords };
      break;
    case 'action':
      const actionIndexes = [];
      Object.keys(importActions).forEach(key => {
        if (Object.hasOwn(importActions, key)) {
          actionIndexes.push(importActions[key].index);
        }
      });
      const newActionId = randomActionId();
      const newActionRecords = [];

      if (importActions[newItem].records) {
        importActions[newItem].records.forEach(childRecord => {
          const newRecordId = randomActionId();
          const newRecord = { ...importRecords[childRecord], id: newRecordId, action: newActionId };
          newActionRecords.push(newRecordId);
          newRecords[newRecordId] = newRecord;
        });
      }
      const newActionIndex = actionIndexes.length > 0 ? Math.max.apply(null, actionIndexes) + 1 : 1;
      const newActionName = `${importActions[newItem].name || ''} (KOPIO)`;
      const newActionAttributes = { ...importActions[newItem].attributes, TypeSpecifier: newActionName };
      const newAction = { ...importActions[newItem], id: newActionId, phase: itemParent, index: newActionIndex, name: newActionName, records: newActionRecords, attributes: newActionAttributes };

      importPhases[itemParent].actions.push(newActionId);
      importActions[newActionId] = newAction;
      importRecords = { ...importRecords, ...newRecords };
      break;
    case 'record':
      const recordIndexes = [];
      Object.keys(importRecords).forEach(key => {
        if (Object.hasOwn(importRecords, key)) {
          recordIndexes.push(importRecords[key].index);
        }
      });
      const newRecordId = randomActionId();

      const newRecordIndex = recordIndexes.length > 0 ? Math.max.apply(null, recordIndexes) + 1 : 1;
      const newRecordName = `${importRecords[newItem].name || ''} (KOPIO)`;
      const newRecordAttributes = { ...importRecords[newItem].attributes, TypeSpecifier: newRecordName };
      const newRecord = { ...importRecords[newItem], id: newRecordId, action: itemParent, index: newRecordIndex, name: newRecordName, attributes: newRecordAttributes };

      importActions[itemParent].records.push(newRecordId);
      importRecords[newRecordId] = newRecord;
      break;
    default:
      break;
  }

  return {
    importPhases,
    importActions,
    importRecords
  };
}

export const importItemsThunk = createAsyncThunk(
  'selectedTOS/importItems',
  async ({ newItem, level, itemParent }, { getState }) => {
    const importData = prepareImport(newItem, level, itemParent, getState());
    return importData;
  }
);
