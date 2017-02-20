import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { push } from 'react-router-redux';

import {
  fetchTOS,
  setPhaseVisibility,
  setPhasesVisibility,
  setDocumentState,
  addAction,
  addRecord,
  addPhase,
  changeOrder,
  importItems,
  clearTOS
} from '../tosReducer';

import ViewTOS from '../components/ViewTOS';

const mapDispatchToProps = (dispatch) => {
  return {
    addAction: bindActionCreators(addAction, dispatch),
    addPhase: bindActionCreators(addPhase, dispatch),
    addRecord: bindActionCreators(addRecord, dispatch),
    changeOrder: bindActionCreators(changeOrder, dispatch),
    clearTOS: bindActionCreators(clearTOS, dispatch),
    fetchTOS: bindActionCreators(fetchTOS, dispatch),
    importItems: bindActionCreators(importItems, dispatch),
    push: (path) => dispatch(push(path)),
    setDocumentState: bindActionCreators(setDocumentState, dispatch),
    setPhasesVisibility: bindActionCreators(setPhasesVisibility, dispatch),
    setPhaseVisibility: bindActionCreators(setPhaseVisibility, dispatch)
  };
};

const mapStateToProps = (state) => {
  return {
    actions: state.selectedTOS.actions,
    attributeTypes: state.ui.attributeTypes,
    documentState: state.selectedTOS.documentState,
    isFetching: state.ui.isFetching || state.selectedTOS.isFetching,
    items: state.navigation.items,
    phases: state.selectedTOS.phases,
    records: state.selectedTOS.records,
    recordTypes: state.ui.recordTypes,
    selectedTOS: state.selectedTOS.tos,
    selectedTOSPath: state.selectedTOS.path
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ViewTOS);
