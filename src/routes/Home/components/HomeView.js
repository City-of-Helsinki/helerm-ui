import React from 'react';
import Navigation from './Navigation';
import Loader from './Loader';
import ViewTOS from './ViewTOS';
import './Homeview.scss';

export class HomeView extends React.Component {
  componentWillMount () {
    this.props.fetchValidationRules();
    this.props.fetchRecordTypes();
  }
  render () {
    const {
      fetchNavigation,
      setNavigationVisibility,
      navigation,
      fetchTOS,
      selectedTOS,
      phases,
      actions,
      records,
      selectedTOSPath,
      setPhaseVisibility,
      isFetching,
      setPhasesVisibility,
      documentState,
      setDocumentState,
      recordTypes,
      attributeTypes,
      addAction,
      addRecord,
      addPhase,
      commitOrderChanges,
      importItems
    } = this.props;
    return (
      <div>
        { isFetching &&
          <Loader
            isFetching={isFetching}
          />
        }
        <Navigation
          fetchTOS={fetchTOS}
          fetchNavigation={fetchNavigation}
          navigation={navigation}
          setNavigationVisibility={setNavigationVisibility}
          selectedTOSPath={selectedTOSPath}
        />
        <ViewTOS
          selectedTOS={selectedTOS}
          phases={phases}
          actions={actions}
          records={records}
          setPhaseVisibility={setPhaseVisibility}
          isFetching={isFetching}
          setPhasesVisibility={setPhasesVisibility}
          documentState={documentState}
          setDocumentState={setDocumentState}
          recordTypes={recordTypes}
          attributeTypes={attributeTypes}
          addAction={addAction}
          addRecord={addRecord}
          addPhase={addPhase}
          commitOrderChanges={commitOrderChanges}
          importItems={importItems}
        />
      </div>
    );
  }
};
HomeView.propTypes = {
  phases: React.PropTypes.object.isRequired,
  actions: React.PropTypes.object.isRequired,
  records: React.PropTypes.object.isRequired,
  fetchTOS: React.PropTypes.func.isRequired,
  fetchNavigation: React.PropTypes.func.isRequired,
  navigation: React.PropTypes.object.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  selectedTOSPath: React.PropTypes.array.isRequired,
  setPhaseVisibility: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  setPhasesVisibility: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  setDocumentState: React.PropTypes.func.isRequired,
  fetchRecordTypes: React.PropTypes.func.isRequired,
  recordTypes: React.PropTypes.object.isRequired,
  attributeTypes: React.PropTypes.object.isRequired,
  addAction: React.PropTypes.func.isRequired,
  addRecord: React.PropTypes.func.isRequired,
  addPhase: React.PropTypes.func.isRequired,
  fetchValidationRules: React.PropTypes.func.isRequired,
  commitOrderChanges: React.PropTypes.func.isRequired,
  importItems: React.PropTypes.func.isRequired
};
export default HomeView;
