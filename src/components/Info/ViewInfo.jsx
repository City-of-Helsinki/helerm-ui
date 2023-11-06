/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import raw from 'raw.macro';

import { setNavigationVisibility } from '../Navigation/reducer';
import './ViewInfo.scss';

// CRA does not support importing text files
// this is offered as a solution here
// (https://github.com/facebook/create-react-app/issues/3722)
const markdown = raw('./content_fi.md');

class InfoView extends Component {
  componentDidMount() {
    if (document.body) {
      document.body.className += InfoView.BODY_CLASS;
    }
    this.props.setNavigationVisibility(true);
  }

  componentWillUnmount() {
    if (document.body) {
      document.body.className = document.body.className.replace(InfoView.BODY_CLASS, '');
    }
  }

  render() {
    const classname = this.props.match.path === '/info' ? 'info-view-center' : 'info-view';
    return (
      <div className={classname}>
        <ReactMarkdown plugins={[gfm]}>{markdown}</ReactMarkdown>
      </div>
    );
  }
}

InfoView.propTypes = {
  setNavigationVisibility: PropTypes.func,
  match: PropTypes.object.isRequired,
};

InfoView.BODY_CLASS = 'helerm-info-view';

const mapStateToProps = null;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setNavigationVisibility,
    },
    dispatch,
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(InfoView));
