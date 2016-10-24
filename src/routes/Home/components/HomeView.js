import React from 'react';
import Navigation from './Navigation';
import SingleTOS from './SingleTOS';

export class HomeView extends React.Component {
  render() {
    const {
      getNavigationMenuItems,
      navigationMenuItems,
      fetchTOS,
      selectedTOSData
    } = this.props;
    return(
      <div>
        <Navigation fetchTOS={fetchTOS} getNavigationMenuItems={getNavigationMenuItems} navigationMenuItems={navigationMenuItems}/>
        <SingleTOS selectedTOSData={selectedTOSData}/>
      </div>
    )
  }
};

export default HomeView;
