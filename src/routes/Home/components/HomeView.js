import React from 'react';
import Navigation from './Navigation';
import SingleTOS from './SingleTOS';
import './Homeview.scss';

export class HomeView extends React.Component {
  render() {
    const {
      getNavigationMenuItems,
      navigationMenuItems,
      fetchTOS,
      selectedTOSData,
      togglePhaseVisibility,
      isFetching,
      setPhasesVisibility
    } = this.props;
    return(
      <div className="row home-container">
        <Navigation
          fetchTOS={fetchTOS}
          getNavigationMenuItems={getNavigationMenuItems}
          navigationMenuItems={navigationMenuItems}
        />
        <SingleTOS
          selectedTOSData={selectedTOSData}
          togglePhaseVisibility={togglePhaseVisibility}
          isFetching={isFetching}
          setPhasesVisibility={setPhasesVisibility}
        />
      </div>
    )
  }
};

export default HomeView;
