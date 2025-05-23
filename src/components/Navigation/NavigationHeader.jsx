import { Button, IconMenuHamburger } from 'hds-react';
import './NavigationHeader.scss';
import PropTypes from 'prop-types';

const NavigationHeader = ({ showNavigation, toggleNavigation }) => {
  return (
    <div className='helerm-navigation-header'>
      <Button
        theme='black'
        variant='supplementary'
        onClick={toggleNavigation}
        iconLeft={<IconMenuHamburger />}
        aria-label={showNavigation ? 'Näytä' : 'Piilota'}
      ></Button>
    </div>
  );
};

NavigationHeader.propTypes = {
  showNavigation: PropTypes.bool,
  toggleNavigation: PropTypes.func,
};

export default NavigationHeader;
