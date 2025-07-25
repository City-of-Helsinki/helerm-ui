import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setNavigationVisibility } from '../../store/reducers/navigation';

const IndexPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setNavigationVisibility(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default IndexPage;
