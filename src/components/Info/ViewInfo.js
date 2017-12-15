import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ReactMarkdown from 'react-markdown';
import content from './content_fi.md';

import { setNavigationVisibility } from '../Navigation/reducer';

class InfoView extends React.Component {
  render () {
    return (
      <div>
        <ReactMarkdown source={content} />
        <Link to='/'>Etusivulle</Link>
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
