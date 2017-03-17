import update from 'immutability-helper';
import { createAction, handleActions } from 'redux-actions';

export const EXECUTE_ORDER_CHANGE = 'executeOrderChangeAction';

export function changeOrder (newOrder, itemType, itemParent) {
  return function (dispatch, getState) {
    dispatch(executeOrderChange(newOrder, itemType, itemParent, getState()));
  };
}

export function executeOrderChange (newOrder, itemType, itemParent, currentState) {
  let parentLevel;
  let itemLevel;
  const affectedItems = newOrder;
  switch (itemType) {
    case 'phase':
      parentLevel = 'tos';
      itemLevel = 'phases';
      break;
    case 'action':
      parentLevel = 'phases';
      itemLevel = 'actions';
      break;
    case 'record':
      parentLevel = 'actions';
      itemLevel = 'records';
      break;
    default:
      return currentState;
  }
  const reorderedList = [];
  affectedItems.map(item => {
    reorderedList.push(currentState.selectedTOS[itemLevel][item]);
  });
  const parentList = [];
  reorderedList.map((item, index) => {
    item.index = index + 1;
    parentList.push(item.id);
  });
  let itemList = Object.assign({}, currentState.selectedTOS[itemLevel]);
  for (const key in itemList) {
    if (itemList.hasOwnProperty(key)) {
      reorderedList.map(item => {
        if (itemList[key].id === item.id) {
          itemList[key] = item;
        }
      });
    }
  }

  itemList = parentLevel === 'tos'
    ? reorderedList.reduce((result, item) => {
      const key = item.id;
      result[key] = item;
      return result;
    }, {})
    : itemList;

  return createAction(EXECUTE_ORDER_CHANGE)({ itemList, itemType, itemParent, parentLevel, itemLevel, parentList });
}

export const executeOrderChangeAction = (state, { payload }) => {
  if (payload.itemType === 'phase') {
    return update(state, {
      [payload.itemLevel]: {
        $set: payload.itemList
      }
    });
  } else {
    return update(state, {
      [payload.parentLevel]: {
        [payload.itemParent]: {
          [payload.itemLevel]: {
            $set: payload.parentList
          }
        }
      },
      [payload.itemLevel]: {
        $set: payload.itemList
      }
    });
  }
};
