/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { filter, includes, isEmpty, keys } from 'lodash';

import { CHANGE_BULKUPDATE, BULK_UPDATE_PACKAGE_APPROVE_OPTIONS } from '../../constants';
import { formatDateTime, getStatusLabel, resolveReturnValues, resolveSelectValues } from '../../utils/helpers';
import IsAllowed from '../../components/IsAllowed/IsAllowed';
import withRouter from '../../components/hoc/withRouter';

import './BulkListView.scss';

class BulkListView extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeFilter = this.onChangeFilter.bind(this);
    this.onClickBulkUpdate = this.onClickBulkUpdate.bind(this);

    this.state = {
      filters: [false],
    };
  }

  componentDidMount() {
    this.props.fetchBulkUpdates(true);
  }

  onChangeFilter(options) {
    const filters = options.map((option) => option.value);
    this.setState({ filters });
  }

  onClickBulkUpdate(bulkId) {
    this.props.navigate(`/bulk/view/${bulkId}`);
  }

  render() {
    const { bulkUpdates } = this.props;
    const { filters } = this.state;
    const filteredBulkUpdates = filter(bulkUpdates, (bulkUpdate) =>
      !isEmpty(filters) ? includes(filters, bulkUpdate.is_approved) : true,
    );

    return (
      <div className='bulk-view'>
        <h3>Massamuutokset</h3>
        <Link className='btn btn-primary' to='/bulk/create'>
          Uusi massamuutos
        </Link>
        <IsAllowed to={CHANGE_BULKUPDATE}>
          <div className='bulk-packages'>
            <div className='bulk-packages-header'>
              <div className='bulk-update-info'>
                <h4>Tarkastettavat paketit ({filteredBulkUpdates.length})</h4>
              </div>
              <div className='bulk-update-approved'>
                <h5>Massamuutoksen tila</h5>
                <Select
                  className='Select'
                  openMenuOnFocus
                  isClearable={false}
                  value={resolveSelectValues(BULK_UPDATE_PACKAGE_APPROVE_OPTIONS, filters, true)}
                  onChange={(emittedValue) => this.onChangeFilter(resolveReturnValues(emittedValue, true))}
                  options={BULK_UPDATE_PACKAGE_APPROVE_OPTIONS}
                  isMulti
                  placeholder='Valitse massamuutoksen tila'
                />
              </div>
            </div>
            <div className='bulk-updates'>
              {filteredBulkUpdates.map((bulk) => (
                <div
                  className='bulk-update'
                  key={bulk.id}
                  onClick={() => this.onClickBulkUpdate(bulk.id)}
                  onKeyUp={(event) => {
                    if (event.key === 'Enter') {
                      this.onClickBulkUpdate(bulk.id);
                    }
                  }}
                >
                  <div className='bulk-update-info'>
                    <div>Paketti ID: {bulk.id}</div>
                    <div>Luotu: {formatDateTime(bulk.created_at)}</div>
                    <div>Muutettu: {formatDateTime(bulk.modified_at)}</div>
                    <div>Muokkaaja: {bulk.modified_by}</div>
                    <div>Muutokset: {bulk.description}</div>
                    <div>Käsittelyprosesseja: {keys(bulk.changes).length} kpl</div>
                    <div>Käsittelyprosessin tila muutoksen jälkeen: {getStatusLabel(bulk.state)}</div>
                  </div>
                  <div className='bulk-update-approved'>
                    <h5>{bulk.is_approved ? 'Hyväksytty' : 'Odottaa'}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </IsAllowed>
      </div>
    );
  }
}

BulkListView.propTypes = {
  bulkUpdates: PropTypes.array.isRequired,
  fetchBulkUpdates: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default withRouter(BulkListView);
