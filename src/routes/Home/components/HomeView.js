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
      selectedTOSData,
      togglePhaseVisibility,
      isFetching,
      setPhasesVisibility
    } = this.props;
    return (
      <div className='row home-container'>
        <Navigation
          fetchTOS={fetchTOS}
          fetchNavigation={fetchNavigation}
          navigationMenuItems={navigationMenuItems}
        />
        <SingleTOS
          selectedTOSData={selectedTOSData}
          togglePhaseVisibility={togglePhaseVisibility}
          isFetching={isFetching}
          setPhasesVisibility={setPhasesVisibility}
        />
      </div>
    );
  }
};
HomeView.propTypes = {
  fetchTOS: React.PropTypes.func.isRequired,
  fetchNavigation: React.PropTypes.func.isRequired,
  navigationMenuItems: React.PropTypes.array.isRequired,
  selectedTOSData: React.PropTypes.object.isRequired,
  togglePhaseVisibility: React.PropTypes.func.isRequired,
  isFetching: React.PropTypes.bool.isRequired,
  setPhasesVisibility: React.PropTypes.func.isRequired
};
export default HomeView;
