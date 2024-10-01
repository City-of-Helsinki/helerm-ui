/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import raw from 'raw.macro';

import { setNavigationVisibility } from '../../components/Navigation/reducer';
import './ViewInfo.scss';
import withRouter from '../../components/hoc/withRouter';

// CRA does not support importing text files
// this is offered as a solution here
// (https://github.com/facebook/create-react-app/issues/3722)
const markdown = raw('./content_fi.md');

class InfoView extends Component {
  componentDidMount() {
    if (document.body) {
      document.body.classList.add(InfoView.BODY_CLASS);
    }

    this.props.setNavigationVisibility(true);
  }

  componentWillUnmount() {
    if (document.body) {
      document.body.classList.remove(InfoView.BODY_CLASS);
    }
  }

  render() {
    const classname = this.props.location.pathname === '/info' ? 'info-view-center' : 'info-view';
    return (
      <div className={classname}>
        <ReactMarkdown plugins={[gfm]}>{markdown}</ReactMarkdown>
      </div>
    );
  }
}

InfoView.propTypes = {
  setNavigationVisibility: PropTypes.func,
  location: PropTypes.object.isRequired,
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
