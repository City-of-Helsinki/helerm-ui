import { connect } from 'react-redux';

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
} from '../modules/tos';

import ViewTOS from '../components/ViewTOS';

const mapDispatchToProps = {
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  addAction,
  addRecord,
  addPhase,
  changeOrder,
  importItems
};

const mapStateToProps = (state) => {
  return {
    actions: state.selectedTOS.actions,
    attributeTypes: state.home.attributeTypes,
    documentState: state.selectedTOS.documentState,
    isFetching: state.selectedTOS.isFetching,
    items: state.navigation.items,
    phases: state.selectedTOS.phases,
    records: state.selectedTOS.records,
    recordTypes: state.home.recordTypes,
    selectedTOS: state.selectedTOS.tos,
    selectedTOSPath: state.selectedTOS.path
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewTOS);
