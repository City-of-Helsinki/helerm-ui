import React from 'react';
import Header from '../../components/Header';
import Navigation from '../../components/Navigation/containers/NavigationContainer';
import './CoreLayout.scss';
import '../../styles/core.scss';

export const CoreLayout = (
  {
    children,
    fetchTOS,
    fetchNavigation,
    navigation,
    setNavigationVisibility,
    selectedTOSPath
  }) => (
    <div className='core-layout__viewport'>
      <Header />
      <Navigation
        fetchTOS={fetchTOS}
        fetchNavigation={fetchNavigation}
        navigation={navigation}
        setNavigationVisibility={setNavigationVisibility}
        selectedTOSPath={selectedTOSPath}
      />
      <div className='container-fluid'>
        {children}
      </div>
    </div>
);

CoreLayout.propTypes = {
  children : React.PropTypes.element.isRequired,
  fetchTOS: React.PropTypes.func.isRequired,
  fetchNavigation: React.PropTypes.func.isRequired,
  navigation: React.PropTypes.object.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired,
  selectedTOS: React.PropTypes.object.isRequired,
  selectedTOSPath: React.PropTypes.array.isRequired
};

export default CoreLayout;
