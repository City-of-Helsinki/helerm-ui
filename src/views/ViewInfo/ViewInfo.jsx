import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';

import { setNavigationVisibility } from '../../store/reducers/navigation';
import markdown from './content_fi.md?raw';
import './ViewInfo.scss';

const BODY_CLASS = 'helerm-info-view';

const InfoView = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (document.body) {
      document.body.classList.add(BODY_CLASS);
    }

    dispatch(setNavigationVisibility(true));

    return () => {
      if (document.body) {
        document.body.classList.remove(BODY_CLASS);
      }
    };
  }, [dispatch]);

  const classname = location.pathname === '/info' ? 'info-view-center' : 'info-view';

  return (
    <div className={classname}>
      <ReactMarkdown remarkPlugins={[gfm]}>{markdown}</ReactMarkdown>
    </div>
  );
};

export default InfoView;
