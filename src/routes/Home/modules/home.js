import fetch from 'isomorphic-fetch';
import update from 'immutability-helper';
// ------------------------------------
// Constants
// ------------------------------------
export const REQUEST_NAVIGATION = 'REQUEST_NAVIGATION';
export const RECEIVE_NAVIGATION = 'RECEIVE_NAVIGATION';

export const SELECT_TOS = 'SELECT_TOS';
export const REQUEST_TOS = 'REQUEST_TOS';
export const RECEIVE_TOS = 'RECEIVE_TOS';

export const TOGGLE_PHASE_VISIBILITY = 'TOGGLE_PHASE_VISIBILITY';
export const SET_PHASES_VISIBILITY = 'SET_PHASES_VISIBILITY';

export const SET_DOCUMENT_STATE = 'SET_DOCUMENT_STATE';

// ------------------------------------
// Actions
// ------------------------------------
export function requestNavigation () {
  return {
    type: REQUEST_NAVIGATION
  };
}

export function receiveNavigation (items) {
  // const itemTree = [];
  // items.results.map((item, index) => {
  //   if( item.parent  && index < 5) {
  //
  //   } else {
  //     itemTree[item.id] = {id: item.id, name: item.function_id+' '+item.name, children: []};
  //   }
  // });
  // console.log(itemTree);
  const tempItems = [{
      id: "01235187312",
      name: '01 Asuminen',
      children: []
    }, {
      id: "0123518731asas123",
      name: '02 Rakennettu ympäristö',
      children: []
    }, {
      id: "sadlkasdlkj2123",
      name: '03 Perheiden palvelut',
      children: []
    }, {
      id: "askldhaskj2",
      name: '04 Terveydenhuolto ja sairaanhoito',
      children: []
    }, {
      id: "askldhaskj1",
      name: '05 Sosiaalipalvelut',
      children: [{
        id: "saldk090ijkas",
        name: '05 01 Lasten päivähoito',
        children: [{
          id: "a51dfd356cc447ec85f486f242c199a7",
          name: '05 01 00 Varhaiskasvatuksen suunnittelu, ohjaus ja valvonta'
        }, {
          id: "aosdj98123",
          name: '05 01 01 Varhaiskasvatukseen hakeminen ja ottaminen',
          children: [{
            id: "6bf114abbd5e4f4f9bbc1aa4de749a74",
            name: '05 01 01 00 Päiväkoti- ja perhepäivähoitoon hakeminen ja ottaminen (ml. kesällä myös kehitysvammaiset ja autistiset koululaiset)'
          }, {
            id: "6f5baa3218784996b9dc078f59d65c1e",
            name: '05 01 01 01 Esiopetukseen hakeminen ja ottaminen'
          }]
        }]
      }, {
        id: "askld8912",
        name: '05 02 Testi',
        children: [{
          id: "askldj892",
          name: '05 02 00 Testi 2'
        }]
      }]
    }];
  
  return {
    type: RECEIVE_NAVIGATION,
    items: tempItems
  };
}

export function selectTOS (tos) {
  return {
    type: SELECT_TOS,
    tos
  };
}

export function requestTOS (tos) {
  return {
    type: REQUEST_TOS,
    tos
  };
}

export function receiveTOS (tos, json) {
  return {
    type: RECEIVE_TOS,
    tos,
    data: json,
    receivedAt: Date.now()
  };
}

export function fetchTOS (tos) {
  return function (dispatch) {
    dispatch(requestTOS(tos));
    // placeholder fetch, will be changed
    const url = 'https://api.hel.fi/helerm-test/v1/function/'+tos;
    return fetch(url)
      .then(response => response.json())
      .then(json =>
      dispatch(receiveTOS(tos, json))
    );
  };
}

export function fetchNavigation () {
  return function (dispatch) {
    dispatch(requestNavigation());
    // placeholder fetch, will be changed
    return fetch('https://api.hel.fi/helerm-test/v1/function/?page_size=2000')
    // return fetch('https://www.reddit.com/r/reactjs.json')
      .then(response => response.json())
      .then(json =>
      dispatch(receiveNavigation(json))
    );
  };
}

export function togglePhaseVisibility (phase, current) {
  return {
    type: TOGGLE_PHASE_VISIBILITY,
    phase,
    newOpen: !current
  };
}

export function setPhasesVisibility (phases, value) {
  const allPhasesOpen = [];
  for (const key in phases) {
    if (phases.hasOwnProperty(key)) {
      allPhasesOpen.push(update(phases[key], { is_open: { $set: value } }));
    }
  };
  return {
    type: SET_PHASES_VISIBILITY,
    allPhasesOpen
  };
}

export function setDocumentState (state) {
  return {
    type: SET_DOCUMENT_STATE,
    state
  }
}
export const actions = {
  fetchNavigation,
  requestNavigation,
  receiveNavigation,
  selectTOS,
  requestTOS,
  receiveTOS,
  fetchTOS,
  togglePhaseVisibility,
  setPhasesVisibility
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [RECEIVE_NAVIGATION] : (state, action) => {
    return ({ ...state, navigationMenuItems: action.items });
  },
  [REQUEST_NAVIGATION] : (state, action) => {
    return state;
  },
  [SELECT_TOS] : (state, action) => {
    return update(state, { selectedTOSId: { $set: action.tos } });
  },
  [REQUEST_TOS] : (state, action) => {
    return update(state, { selectedTOS: {
      isFetching: { $set: true }
    } });
  },
  [RECEIVE_TOS]: (state, action) => {
    return update(state, { selectedTOS: {
      isFetching: { $set: false },
      data: { $set: action.data },
      lastUpdated: { $set: action.receivedAt }
    } });
  },
  [TOGGLE_PHASE_VISIBILITY] : (state, action) => {
    return update(state, { selectedTOS: {
      data: {
        phases: {
          [action.phase]: {
            is_open: { $set: action.newOpen }
          }
        }
      }
    } });
  },
  [SET_PHASES_VISIBILITY] : (state, action) => {
    return update(state, { selectedTOS: {
      data: {
        phases: { $set: action.allPhasesOpen }
      }
    } });
  },
  [SET_DOCUMENT_STATE] : (state, action) => {
    return update(state, { selectedTOS: {
      documentState: { $set: action.state}
    } });
  }
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  navigationMenuItems: [],
  selectedTOS: {
    isFetching: false,
    data: {},
    documentState: 'view',
    lastUpdated: 0
  }
};

export default function homeReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
