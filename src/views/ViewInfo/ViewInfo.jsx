import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import raw from 'raw.macro';
import { useLocation } from 'react-router-dom';

import { setNavigationVisibility } from '../../store/reducers/navigation';
import './ViewInfo.scss';

// CRA does not support importing text files
// this is offered as a solution here
// (https://github.com/facebook/create-react-app/issues/3722)
const markdown = raw('./content_fi.md');

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
