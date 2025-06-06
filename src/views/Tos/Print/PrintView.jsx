/* eslint-disable operator-assignment */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from '@reduxjs/toolkit';
import { Link } from 'react-router-dom';
import get from 'lodash/get';

import { fetchTOS as fetchTosReducer } from '../../../components/Tos/reducer';
import { setNavigationVisibility } from '../../../components/Navigation/reducer';
import { getStatusLabel, formatDateTime, getNewPath, itemById } from '../../../utils/helpers';
import MetaDataTable from '../../../components/Tos/Print/MetaDataTable';
import PrintClassification from '../../../components/Tos/Print/PrintClassification';
import PrintPhase from '../../../components/Tos/Print/PrintPhase';
import withRouter from '../../../components/hoc/withRouter';

import './PrintView.scss';

class PrintView extends Component {
  componentDidMount() {
    const { fetchTOS, TOS, location, params } = this.props;
    this.addBodyClass();
    if (location && location.pathname.path === '/view-tos/:id/print') {
      this.props.setNavigationVisibility(false);
    }
    const tosAvailable = TOS.id === params.id && (!params.version || TOS.version === params.version);
    if (!tosAvailable) {
      const requestParams = {};
      if (typeof version !== 'undefined') {
        requestParams.version = params.version;
      }
      fetchTOS(params.id, requestParams).catch((err) => {
        if (err instanceof URIError) {
          // We have a 404 from API
          this.props.navigate(`/404?tos-id=${params.id}`);
        }
      });
    }
  }

  componentWillUnmount() {
    this.removeBodyClass();
  }

  addBodyClass() {
    if (document.body) {
      document.body.className = document.body.className + PrintView.BODY_CLASS;
    }
  }

  removeBodyClass() {
    if (document.body) {
      document.body.className = document.body.className.replace(PrintView.BODY_CLASS, '');
    }
  }

  render() {
    const { TOS, classification, getAttributeName, sortAttributeKeys, location } = this.props;
    if (!TOS.id) return null;
    return (
      <article>
        <header>
          <div className='no-print btn-group'>
            <Link className='btn btn-primary' to={getNewPath(location.pathname, '..')}>
              Takaisin
            </Link>
          </div>
          <table className='no-border'>
            <tbody>
              <tr>
                <th scope='row'>
                  <h1>{TOS.function_id}</h1>
                </th>
                <td>
                  <h1>{TOS.name}</h1>
                </td>
              </tr>
            </tbody>
          </table>
        </header>
        <MetaDataTable
          rows={[
            ['Tila', getStatusLabel(TOS.state)],
            ['Muokkausajankohta', formatDateTime(TOS.modified_at)],
            ['Muokkaaja', TOS.modified_by],
            ['Voimassaolo alkaa', TOS.valid_from ? formatDateTime(TOS.valid_from, 'DD.MM.YYYY') : ''],
            ['Voimassaolo päättyy', TOS.valid_to ? formatDateTime(TOS.valid_to, 'DD.MM.YYYY') : ''],
          ]}
        />
        {classification && <PrintClassification classification={classification} />}
        <section>
          <header>
            <h2>Käsittelyprosessin tiedot</h2>
          </header>
          <MetaDataTable
            rows={[
              ...sortAttributeKeys(Object.keys(TOS.attributes)).map((key) => [
                getAttributeName(key),
                TOS.attributes[key],
              ]),
            ]}
          />
        </section>
        {Object.keys(TOS.phases).map((key) => (
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
  classification: PropTypes.object,
  fetchTOS: PropTypes.func.isRequired,
  getAttributeName: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  sortAttributeKeys: PropTypes.func.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired,
};

PrintView.BODY_CLASS = 'helerm-tos-print-view';

const denormalizeTOS = (tos) => ({
  ...tos,
  phases: Object.values(tos.phases)
    .sort((a, b) => a.index - b.inded)
    .map((phase) => ({
      ...phase,
      actions: phase.actions.map((actionKey) => {
        const action = tos.actions[actionKey];
        return {
          ...action,
          records: action.records.map((recordKey) => tos.records[recordKey]),
        };
      }),
    })),
});

const getClassification = (tos, items) => {
  if (tos?.classification && items) {
    return itemById(items, tos.classification.id);
  }
  return null;
};

const mapStateToProps = (state) => ({
  TOS: denormalizeTOS(state.selectedTOS),
  getAttributeName: (key) => get(state.ui.attributeTypes, [key, 'name'], key),
  classification: getClassification(state.selectedTOS, state.navigation.items),
  sortAttributeKeys: (keys) =>
    keys.sort(
      (a, b) =>
        get(state.ui.attributeTypes, [a, 'index'], Infinity) - get(state.ui.attributeTypes, [b, 'index'], Infinity),
    ),
});

const mapDispatchToProps = (dispatch) => ({
  fetchTOS: bindActionCreators(fetchTosReducer, dispatch),
  setNavigationVisibility: bindActionCreators(setNavigationVisibility, dispatch),
});

export default compose(withRouter, connect(mapStateToProps, mapDispatchToProps))(PrintView);
