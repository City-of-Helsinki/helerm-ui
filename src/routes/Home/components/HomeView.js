import React from 'react';
import Navigation from './Navigation';
import SingleTOS from './SingleTOS';

export class HomeView extends React.Component {
  render() {
    const { getNavigationMenuItems, navigationMenuItems } = this.props;
    return(
      <div>
        <Navigation getNavigationMenuItems={getNavigationMenuItems} navigationMenuItems={navigationMenuItems}/>
        <SingleTOS />
      </div>
    )
  }
};

export default HomeView;
