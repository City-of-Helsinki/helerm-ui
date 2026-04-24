import { createContext } from 'react';
import PropTypes from 'prop-types';

const MatomoContext = createContext(null);

export const MatomoProvider = ({ children, value }) => (
  <MatomoContext value={value}>{children}</MatomoContext>
);

MatomoProvider.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.object.isRequired,
};

export default MatomoContext;
