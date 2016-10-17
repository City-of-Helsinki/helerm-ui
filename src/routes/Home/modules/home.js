// ------------------------------------
// Constants
// ------------------------------------
export const GET_NAVIGATION_MENU_ITEMS = 'GET_NAVIGATION_MENU_ITEMS';

// ------------------------------------
// Actions
// ------------------------------------
export function getNavigationMenuItems () {
  return {
    type    : GET_NAVIGATION_MENU_ITEMS,
    navigationMenuItems: [{
      number: '05 01',
      title: 'Lasten päivähoito',
      children: [{
        number: '05 01 00',
        title: 'Varhaiskasvatuksen suunnittelu, ohjaus ja valvonta'
      }, {
        number: '05 01 01',
        title: 'Varhaiskasvatukseen hakeminen ja ottaminen',
        children: [{
          number: '05 01 01 00',
          title: 'Päiväkoti- ja perhepäivähoitoon hakeminen ja ottaminen (ml. kesällä myös kehitysvammaiset ja autistiset koululaiset)'
        }, {
          number: '05 01 01 01',
          title: 'Esiopetukseen hakeminen ja ottaminen'
        }]
      }]
    },{
      number: '05 02',
      title: 'Testi',
      children: [{
        number: '05 02 00',
        title: 'Testi 2'
      }]
    }]
  };
}

/*  This is a thunk, meaning it is a function that immediately
    returns a function for lazy evaluation. It is incredibly useful for
    creating async actions, especially when combined with redux-thunk!

    NOTE: This is solely for demonstration purposes. In a real application,
    you'd probably want to dispatch an action of COUNTER_DOUBLE and let the
    reducer take care of this logic.  */

// export const doubleAsync = () => {
//   return (dispatch, getState) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         dispatch(increment(getState().counter));
//         resolve();
//       }, 200);
//     });
//   };
// };

export const actions = {
  getNavigationMenuItems
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [GET_NAVIGATION_MENU_ITEMS] : (state, action) => {
    return ({ ...state, navigationMenuItems: action.navigationMenuItems});
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  navigationMenuItems: []
};

export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
