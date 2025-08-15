import { createAsyncThunk } from '@reduxjs/toolkit';

export const executeOrderChangeReducer = (state, action) => {
  const { itemList, itemType, itemParent, parentLevel, itemLevel, parentList } = action.payload;

  if (itemType === 'phase') {
    state[itemLevel] = itemList;
  } else {
    state[parentLevel][itemParent][itemLevel] = parentList;
    state[itemLevel] = itemList;
  }

  return state;
};

export const changeOrderThunk = createAsyncThunk(
  'selectedTOS/changeOrder',
  async ({ newOrder, itemType, itemParent }, { getState, dispatch }) => {
    const orderChangeData = prepareOrderChange(newOrder, itemType, itemParent, getState());

    if (orderChangeData) {
      dispatch({
        type: 'selectedTOS/executeOrderChange',
        payload: orderChangeData,
      });
    }

    return orderChangeData;
  },
);

export const prepareOrderChange = (newOrder, itemType, itemParent, currentState) => {
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
      return null;
  }

  const reorderedList = [];
  affectedItems.forEach((item) => {
    reorderedList.push(currentState.selectedTOS[itemLevel][item]);
  });

  const parentList = [];
  reorderedList.forEach((item, index) => {
    const reorderedItem = { ...item };
    reorderedItem.index = index + 1;
    parentList.push(reorderedItem.id);
  });

  let itemList = { ...currentState.selectedTOS[itemLevel] };
  Object.keys(itemList).forEach((key) => {
    if (Object.hasOwn(itemList, key)) {
      reorderedList.forEach((item) => {
        if (itemList[key].id === item.id) {
          itemList[key] = item;
        }
      });
    }
  });

  itemList =
    parentLevel === 'tos'
      ? reorderedList.reduce((result, item) => {
          const newResult = { ...result };
          const key = item.id;
          newResult[key] = item;
          return newResult;
        }, {})
      : itemList;

  return { itemList, itemType, itemParent, parentLevel, itemLevel, parentList };
};
