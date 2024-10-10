import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';

import { setNavigationVisibility } from '../../components/Navigation/reducer';
import {
  fetchClassifications,
  filterItems,
  resetSuggestions,
  searchItems,
  toggleAttributeOpen,
  toggleShowAllAttributeOptions,
} from './reducer';
import FacetedSearch from './FacetedSearch';

const mapDispatchToProps = (dispatch) => ({
  fetchClassifications: bindActionCreators(fetchClassifications, dispatch),
  filterItems: bindActionCreators(filterItems, dispatch),
  push: (path) => dispatch(push(path)),
  resetSuggestions: bindActionCreators(resetSuggestions, dispatch),
  searchItems: bindActionCreators(searchItems, dispatch),
  setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch),
  toggleAttributeOpen: bindActionCreators(toggleAttributeOpen, dispatch),
  toggleShowAllAttributeOptions: bindActionCreators(toggleShowAllAttributeOptions, dispatch),
});

const mapStateToProps = (state) => ({
  attributes: state.search.filteredAttributes,
  attributeTypes: state.ui.attributeTypes,
  classifications: state.search.classifications,
  exportItems: state.search.exportItems,
  isFetching: state.search.isFetching,
  items: state.search.items,
  metadata: state.search.metadata,
  suggestions: state.search.suggestions,
  terms: state.search.terms,
});

export default connect(mapStateToProps, mapDispatchToProps)(FacetedSearch);
