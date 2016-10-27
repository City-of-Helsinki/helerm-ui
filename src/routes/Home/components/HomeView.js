import React from 'react';
import Navigation from './Navigation';
import SingleTOS from './SingleTOS';
import './Homeview.scss';

export class HomeView extends React.Component {
  render () {
    const {
      fetchNavigation,
      navigationMenuItems,
      fetchTOS,
      selectedTOS,
      togglePhaseVisibility,
      isFetching,
      setPhasesVisibility,
      documentState,
      setDocumentState,
      fetchRecordTypes,
      recordTypes
    } = this.props;
    return (
      <div className='row home-container'>
        <Navigation
          fetchTOS={fetchTOS}
          fetchNavigation={fetchNavigation}
          navigationMenuItems={navigationMenuItems}
        />
        <SingleTOS
          selectedTOS={selectedTOS}
          togglePhaseVisibility={togglePhaseVisibility}
          isFetching={isFetching}
          setPhasesVisibility={setPhasesVisibility}
          documentState={documentState}
          setDocumentState={setDocumentState}
          fetchRecordTypes={fetchRecordTypes}
          recordTypes={recordTypes}
        />
      </div>
    );
  }
};
HomeView.propTypes = {
  fetchTOS: React.PropTypes.func.isRequired,
  fetchNavigation: React.PropTypes.func.isRequired,
  navigationMenuItems: React.PropTypes.array.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  togglePhaseVisibility: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  setPhasesVisibility: React.PropTypes.func.isRequired,
  documentState: React.PropTypes.string.isRequired,
  setDocumentState: React.PropTypes.func.isRequired,
  fetchRecordTypes: React.PropTypes.func.isRequired,
  recordTypes: React.PropTypes.object.isRequired
};
export default HomeView;
