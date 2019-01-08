import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import content from './content_fi.md';

import { setNavigationVisibility } from '../Navigation/reducer';

import './ViewInfo.scss';

class InfoView extends React.Component {
  render () {
    return (
      <div className='info-view'>
        <ReactMarkdown source={content} />
      </div>
    );
  }
}

InfoView.propTypes = {};

const mapStateToProps = null;

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setNavigationVisibility
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(InfoView);
