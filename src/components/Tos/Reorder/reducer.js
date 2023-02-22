import update from 'immutability-helper';
import { createAction } from 'redux-actions';

export const EXECUTE_ORDER_CHANGE = 'executeOrderChangeAction';

export function executeOrderChange(newOrder, itemType, itemParent, currentState) {
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
  affectedItems.forEach(item => {
    reorderedList.push(currentState.selectedTOS[itemLevel][item]);
  });
  const parentList = [];
  reorderedList.forEach((item, index) => {
    const reorderedItem = { ...item };

    reorderedItem.index = index + 1;
    parentList.push(reorderedItem.id);
  });
  let itemList = { ...currentState.selectedTOS[itemLevel] };
  Object.keys(itemList).forEach(key => {
    if (Object.prototype.hasOwnProperty.call(itemList, key)) {
      reorderedList.forEach(item => {
        if (itemList[key].id === item.id) {
          itemList[key] = item;
        }
      });
    }
  });

  itemList = parentLevel === 'tos'
    ? reorderedList.reduce((result, item) => {
      const newResult = { ...result }

      const key = item.id;
      newResult[key] = item;
      return result;
    }, {})
    : itemList;

  return createAction(EXECUTE_ORDER_CHANGE)({ itemList, itemType, itemParent, parentLevel, itemLevel, parentList });
}

export function changeOrder(newOrder, itemType, itemParent) {
  return (dispatch, getState) => {
    dispatch(executeOrderChange(newOrder, itemType, itemParent, getState()));
  };
}

export const executeOrderChangeAction = (state, { payload }) => {
  if (payload.itemType === 'phase') {
    return update(state, {
      [payload.itemLevel]: {
        $set: payload.itemList
      }
    });
  }
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

};
