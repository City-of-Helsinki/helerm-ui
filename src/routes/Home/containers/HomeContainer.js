import { connect } from 'react-redux';

import {
  fetchNavigation,
  setNavigationVisibility
} from '../../../components/Navigation/modules/navigation';

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
} from '../../ViewTOS/modules/tos';

import {
  fetchRecordTypes,
  fetchAttributeTypes,
  closeMessage
} from '../modules/home';

import HomeView from '../components/HomeView';

const mapDispatchToProps = {
  fetchNavigation,
  setNavigationVisibility,
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  fetchRecordTypes,
  fetchAttributeTypes,
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
    recordTypes: state.home.recordTypes,
    selectedTOS: state.selectedTOS.tos,
    phases: state.selectedTOS.phases,
    actions: state.selectedTOS.actions,
    records: state.selectedTOS.records,
    selectedTOSPath: state.selectedTOS.path,
    isFetching: state.home.isFetching || state.navigation.isFetching,
    documentState: state.selectedTOS.documentState,
    attributeTypes: state.home.attributeTypes,
    message: state.home.message
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);
