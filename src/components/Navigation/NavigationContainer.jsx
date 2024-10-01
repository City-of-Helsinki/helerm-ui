/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { isEmpty } from 'lodash';

import { fetchNavigation, setNavigationVisibility } from './reducer';
import { itemById } from '../../utils/helpers';
import Navigation from './Navigation';
import withRouter from '../hoc/withRouter';

const NavigationContainer = ({
  attributeTypes,
  fetchNavigationFn,
  isFetching,
  isUser,
  is_open,
  items,
  itemsTimestamp,
  onLeafMouseClick,
  pushFn,
  setNavigationVisibilityFn,
  tosPath,
  location,
}) => (
  <Navigation
    attributeTypes={attributeTypes}
    fetchNavigation={fetchNavigationFn}
    isFetching={isFetching}
    isUser={isUser}
    is_open={is_open}
    items={items}
    itemsTimestamp={itemsTimestamp}
    onLeafMouseClick={onLeafMouseClick}
    push={pushFn}
    setNavigationVisibility={setNavigationVisibilityFn}
    tosPath={tosPath}
    location={location}
  />
);

const mapDispatchToProps = (dispatch) => ({
  fetchNavigationFn: bindActionCreators(fetchNavigation, dispatch),
  pushFn: (path) => dispatch(push(path)),
  setNavigationVisibilityFn: bindActionCreators(setNavigationVisibility, dispatch),
});

const getTOS = (selectedTOS, items, classification) => {
  if (selectedTOS.classification) {
    return itemById(items, selectedTOS.classification.id);
  }

  if (classification.id) {
    return itemById(items, classification.id);
  }

  return null;
};

const getTOSPath = (ownProps, tos) => {
  if (ownProps.tosPath) {
    return ownProps.tosPath;
  }

  if (tos) {
    return tos.path;
  }

  return [];
};

const mapStateToProps = (state, ownProps) => {
  const { items, timestamp } = state.navigation;
  const { attributeTypes } = state.ui;
  const { selectedTOS, classification } = state;

  const tos = getTOS(selectedTOS, items, classification);
  const tosPath = getTOSPath(ownProps, tos);

  return {
    attributeTypes,
    tosPath,
    is_open: state.navigation.is_open,
    isFetching: state.navigation.isFetching,
    isUser: !isEmpty(state.user.data),
    items, // TODO: Unhack this when Navigation doesn't mutate state
    itemsTimestamp: timestamp,
    selectedTOS,
  };
};

NavigationContainer.propTypes = {
  attributeTypes: PropTypes.object,
  fetchNavigationFn: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  isUser: PropTypes.bool,
  is_open: PropTypes.bool.isRequired,
  // One does not simply mutate props unless one is Navigation and the prop is `items`.
  // Sorry, didn't find out where the devil is doing the mutations :'(
  items: PropTypes.array.isRequired,
  itemsTimestamp: PropTypes.string,
  onLeafMouseClick: PropTypes.func,
  pushFn: PropTypes.func.isRequired,
  setNavigationVisibilityFn: PropTypes.func.isRequired,
  tosPath: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NavigationContainer));
