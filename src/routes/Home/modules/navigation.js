// ------------------------------------
// Constants
// ------------------------------------
export const GET_NAVIGATION_MENU_ITEMS = 'GET_NAVIGATION_MENU_ITEMS';
export const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY';
// ------------------------------------
// Actions
// ------------------------------------
export function getNavigationMenuItems() {
  return {
    type: GET_NAVIGATION_MENU_ITEMS,
    navigationMenuItems: [{
      id: 1,
      number: '01',
      name: 'Asuminen',
      isOpen: false
    }, {
      id: 2,
      number: '02',
      name: 'Rakennettu ympäristö',
      isOpen: false
    }, {
      id: 3,
      number: '03',
      name: 'Perheiden palvelut',
      isOpen: false
    }, {
      id: 4,
      number: '04',
      name: 'Terveydenhuolto ja sairaanhoito',
      isOpen: false
    }, {
      id: 5,
      number: '05',
      name: 'Sosiaalipalvelut',
      isOpen: false,
      children: [{
        id: 1,
        number: '05 01',
        name: 'Lasten päivähoito',
        isOpen: false,
        children: [{
          id: 1,
          number: '05 01 00',
          name: 'Varhaiskasvatuksen suunnittelu, ohjaus ja valvonta'
        }, {
          id: 2,
          number: '05 01 01',
          name: 'Varhaiskasvatukseen hakeminen ja ottaminen',
          isOpen: false,
          children: [{
            id: 1,
            number: '05 01 01 00',
            name: 'Päiväkoti- ja perhepäivähoitoon hakeminen ja ottaminen (ml. kesällä myös kehitysvammaiset ja autistiset koululaiset)'
          }, {
            id: 2,
            number: '05 01 01 01',
            name: 'Esiopetukseen hakeminen ja ottaminen'
          }]
        }]
      }, {
        id: 2,
        number: '05 02',
        name: 'Testi',
        isOpen: false,
        children: [{
          id: 1,
          number: '05 02 00',
          name: 'Testi 2'
        }]
      }]
    }]
  };
}

export function toggleVisibility(items) {
  return {
    type: TOGGLE_VISIBILITY,
    newItems: items
  }
}

export const actions = {
  getNavigationMenuItems,
  toggleVisibility
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [GET_NAVIGATION_MENU_ITEMS] : (state, action) => {
    return ({ ...state, navigationMenuItems: action.navigationMenuItems});
  },
  [TOGGLE_VISIBILITY] : (state, action) => {
    return ({...state, navigationMenuItems: action.newItems});
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  navigationMenuItems: []
};

export default function navigationReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
