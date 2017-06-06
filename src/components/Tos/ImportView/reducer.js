import update from 'immutability-helper';
import { createAction } from 'redux-actions';

export const EXECUTE_IMPORT = 'executeImportAction';

export function importItems (newItem, level, itemParent) {
  return function (dispatch, getState) {
    dispatch(executeImport(newItem, level, itemParent, getState()));
  };
}

export function executeImport (newItem, level, itemParent, currentState) {
  const newId = Math.random().toString(36).replace(/[^a-z]+/g, '');
  let currentItems;
  let parentLevel;
  let itemLevel;
  switch (level) {
    case 'phase':
      currentItems = Object.assign({}, currentState.selectedTOS.phases);
      parentLevel = 'tos';
      itemLevel = 'phases';
      break;
    case 'action':
      currentItems = Object.assign({}, currentState.selectedTOS.actions);
      parentLevel = 'phases';
      itemLevel = 'actions';
      break;
    case 'record':
      currentItems = Object.assign({}, currentState.selectedTOS.records);
      parentLevel = 'actions';
      itemLevel = 'records';
      break;
    default:
      return currentState;
  }
  let indexes = [];
  for (const key in currentItems) {
    if (currentItems.hasOwnProperty(key)) {
      indexes.push(currentItems[key].index);
    }
  }
  const newIndex = indexes.length > 0 ? Math.max.apply(null, indexes) + 1 : 1;
  const newName = currentItems[newItem].name + ' (KOPIO)';
  const newCopy = Object.assign({}, currentItems[newItem], { id: newId }, { index: newIndex }, { name: newName }, { attributes: { TypeSpecifier: newName } });
  const newItems = Object.assign({}, currentItems, { [newId]: newCopy });

  return createAction(EXECUTE_IMPORT)({ level, itemParent, parentLevel, itemLevel, newId, newItems });
}

export const executeImportAction = (state, { payload }) => {
  if (payload.level === 'phase') {
    return update(state, {
      [payload.itemLevel]: {
        $set: payload.newItems
      }
    });
  } else {
    return update(state, {
      [payload.parentLevel]: {
        [payload.itemParent]: {
          [payload.itemLevel]: {
            $push: [payload.newId]
          }
        }
      },
      [payload.itemLevel]: {
        $set: payload.newItems
      }
    });
  }
};
