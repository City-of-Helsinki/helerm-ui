import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';

import { setNavigationVisibility } from './../Navigation/reducer';
import {
  fetchClassifications,
  filterItems,
  searchItems,
  toggleAttributeOpen,
  toggleAttributeOption,
  toggleShowAllAttributeOptions
} from './reducer';

import FacetedSearch from './FacetedSearch';

const mapDispatchToProps = (dispatch) => {
  return {
    fetchClassifications: bindActionCreators(fetchClassifications, dispatch),
    filterItems: bindActionCreators(filterItems, dispatch),
    push: (path) => dispatch(push(path)),
    searchItems: bindActionCreators(searchItems, dispatch),
    setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch),
    toggleAttributeOpen: bindActionCreators(toggleAttributeOpen, dispatch),
    toggleAttributeOption: bindActionCreators(toggleAttributeOption, dispatch),
    toggleShowAllAttributeOptions: bindActionCreators(toggleShowAllAttributeOptions, dispatch)
  };
};

const mapStateToProps = state => ({
  attributes: state.search.filteredAttributes,
  attributeTypes: state.ui.attributeTypes,
  classifications: state.search.classifications,
  exportItems: state.search.exportItems,
  isFetching: state.search.isFetching,
  items: state.search.items,
  metadata: state.search.metadata,
  terms: state.search.terms
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(FacetedSearch));
