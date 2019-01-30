import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import content from './content_fi.md';

import { setNavigationVisibility } from '../Navigation/reducer';

import './ViewInfo.scss';

class InfoView extends Component {
  static propTypes = {
    setNavigationVisibility: PropTypes.func
  };

  static BODY_CLASS = 'helerm-info-view';

  componentDidMount () {
    if (document.body) {
      document.body.className = document.body.className + InfoView.BODY_CLASS;
    }
    this.props.setNavigationVisibility(true);
  }

  componentWillUnmount () {
    if (document.body) {
      document.body.className = document.body.className.replace(
        InfoView.BODY_CLASS,
        ''
      );
    }
  }

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
