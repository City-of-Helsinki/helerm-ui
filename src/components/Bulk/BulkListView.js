import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router';
import { keys } from 'lodash';

import { REVIEW } from '../../../config/constants';
import { formatDateTime, getStatusLabel } from 'utils/helpers';
import IsAllowed from 'components/IsAllowed/IsAllowed';

import './BulkListView.scss';

export class BulkListView extends React.Component {

  componentDidMount () {
    this.props.fetchBulkUpdates(true);
  }

  render () {
    const { bulkUpdates } = this.props;

    return (
      <div className='bulk-view'>
        <h3>Massamuutokset</h3>
        <Link className='btn btn-primary' to='/bulk/create'>
          Uusi massamuutos
        </Link>
        <IsAllowed to={REVIEW}>
          <div className='bulk-packages'>
            <div className='bulk-packages-header'>
              <div className='bulk-update-info'>
                <h4>Tarkastettavat paketit</h4>
              </div>
              <div className='bulk-update-status'>
                <h5>Käsittelyprosessin tila</h5>
              </div>
              <div className='bulk-update-approved'>
                <h5>Massamuutos hyväksytty</h5>
              </div>
              <div className='bulk-update-action' />
            </div>
            <div className='bulk-updates'>
              {bulkUpdates.map((bulk) => (
                <div className='bulk-update' key={bulk.id}>
                  <div className='bulk-update-info'>
                    <div>Paketti ID: {bulk.id}</div>
                    <div>Luotu: {formatDateTime(bulk.created_at)}</div>
                    <div>Muutettu: {formatDateTime(bulk.modified_at)}</div>
                    <div>Tekijä: [TODO]</div>
                    <div>Muutokset: {bulk.description}</div>
                    <div>Käsittelyprosesseja: {keys(bulk.changes).length} kpl</div>
                  </div>
                  <div className='bulk-update-status'><h5>{getStatusLabel(bulk.state)}</h5></div>
                  <div className='bulk-update-approved'><h5>{bulk.is_approved ? 'Hyväksytty' : 'Odottaa'}</h5></div>
                  <div className='bulk-update-action'>
                    <Link className='btn btn-primary' to={`/bulk/view/${bulk.id}`}>
                      Tarkasta
                    </Link>
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
  fetchBulkUpdates: PropTypes.func.isRequired
};

export default withRouter(BulkListView);
