import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withRouter, Link } from 'react-router';
import get from 'lodash/get';

import { fetchTOS } from 'components/Tos/reducer';
import { setValidationVisibility } from 'components/Tos/ValidationBar/reducer';
import { getStatusLabel, formatDateTime } from 'utils/helpers';

import MetaDataTable from './MetaDataTable';
import PrintPhase from './PrintPhase';

import './PrintView.scss';

class PrintView extends React.Component {
  static BODY_CLASS = 'helerm-tos-print-view';

  componentDidMount () {
    const { fetchTOS, TOS, hideNavigation, params: { id } } = this.props;
    this.addBodyClass();
    hideNavigation();

    const tosAvailable = TOS.id === id;
    if (!tosAvailable) {
      fetchTOS(id);
    }
  }

  componentWillUnmount () {
    this.removeBodyClass();
  }

  addBodyClass () {
    if (document.body) {
      document.body.className = document.body.className + PrintView.BODY_CLASS;
    }
  }

  removeBodyClass () {
    if (document.body) {
      document.body.className = document.body.className.replace(
        PrintView.BODY_CLASS,
        ''
      );
    }
  }

  render () {
    const { TOS, getAttributeName, sortAttributeKeys, location } = this.props;
    if (!TOS.id) return null;
    return (
      <article>
        <header>
          <div className='no-print btn-group'>
            <Link
              className='btn btn-primary'
              to={location.pathname.replace('/print', '')}
            >
              Takaisin <i className='fa fa-close' />
            </Link>
            <button
              type='button'
              className='btn btn-success'
              onClick={window.print}
            >
              Tulosta <i className='fa fa-print' />
            </button>
          </div>
          <h1>
            {TOS.function_id} {TOS.name}
          </h1>
        </header>
        <MetaDataTable
          rows={[
            ['Versionumero', TOS.version.toString()],
            ['Tila', getStatusLabel(TOS.status)],
            ['Muokkausajankohta', formatDateTime(TOS.modified_at)],
            ['Muokkaaja', TOS.modified_by],
            ...sortAttributeKeys(Object.keys(TOS.attributes)).map(key => [
              getAttributeName(key),
              TOS.attributes[key]
            ])
          ]}
        />
        {Object.keys(TOS.phases).map(key => (
          <PrintPhase
            key={TOS.phases[key].id}
            phase={TOS.phases[key]}
            getAttributeName={getAttributeName}
            sortAttributeKeys={sortAttributeKeys}
          />
        ))}
      </article>
    );
  }
}

PrintView.propTypes = {
  TOS: PropTypes.object,
  fetchTOS: PropTypes.func.isRequired,
  getAttributeName: PropTypes.func.isRequired,
  hideNavigation: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  params: PropTypes.object,
  sortAttributeKeys: PropTypes.func.isRequired
};

const denormalizeTOS = tos => ({
  ...tos,
  phases: Object.values(tos.phases)
    .sort((a, b) => a.index - b.inded)
    .map(phase => ({
      ...phase,
      actions: phase.actions.map(actionKey => {
        const action = tos.actions[actionKey];
        return {
          ...action,
          records: action.records.map(recordKey => tos.records[recordKey])
        };
      })
    }))
});

const mapStateToProps = state => ({
  TOS: denormalizeTOS(state.selectedTOS),
  getAttributeName: key => get(state.ui.attributeTypes, `[${key}].name`, key),
  sortAttributeKeys: keys =>
    keys.sort(key => get(state.ui.attributeTypes, `[${key}].index`, Infinity))
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchTOS,
      hideNavigation: () => setValidationVisibility(false)
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(PrintView);
