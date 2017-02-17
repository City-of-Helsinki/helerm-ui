import { connect } from 'react-redux';

import {
  fetchNavigation,
  setNavigationVisibility
} from '../../../components/Navigation/navigationReducer';

import {
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  addAction,
  addRecord,
  addPhase,
  changeOrder,
  importItems
} from '../../ViewTOS/tosReducer';

import {
  closeMessage
} from '../../../store/uiReducer';

import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  addAction,
  addRecord,
  addPhase,
  changeOrder,
  importItems,
  closeMessage
};

const mapStateToProps = (state) => {
  return {
    navigation: state.navigation,
    selectedTOS: state.selectedTOS.tos,
    phases: state.selectedTOS.phases,
    actions: state.selectedTOS.actions,
    records: state.selectedTOS.records,
    selectedTOSPath: state.selectedTOS.path,
    isFetching: state.ui.isFetching || state.navigation.isFetching,
    documentState: state.selectedTOS.documentState,
    message: state.ui.message
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);