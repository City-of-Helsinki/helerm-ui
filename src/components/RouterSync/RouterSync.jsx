import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigationType } from 'react-router-dom';

import { locationChange } from '../../store/reducers/router';

const RouterSync = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const action = useNavigationType();

  useEffect(() => {
    dispatch(locationChange({ location, action }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, action]);

  return null;
};

export default RouterSync;
