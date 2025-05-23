import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { checkPermissions } from '../../utils/helpers';
import { userDataSelector } from '../../store/reducers/user';

const IsAllowed = ({ children, to }) => {
  const user = useSelector(userDataSelector);

  const isAllowed = checkPermissions(user, to);

  return isAllowed ? children : null;
};

IsAllowed.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
};

export default IsAllowed;
