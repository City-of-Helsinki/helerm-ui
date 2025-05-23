/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { filter, includes, isEmpty, keys } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { CHANGE_BULKUPDATE, BULK_UPDATE_PACKAGE_APPROVE_OPTIONS } from '../../constants';
import { formatDateTime, getStatusLabel, resolveReturnValues, resolveSelectValues } from '../../utils/helpers';
import IsAllowed from '../../components/IsAllowed/IsAllowed';
import { bulkUpdatesSelector, fetchBulkUpdatesThunk } from '../../store/reducers/bulk';

import './BulkListView.scss';

const BulkListView = () => {
  const dispatch = useDispatch();
  const bulkUpdates = useSelector(bulkUpdatesSelector);

  const [filters, setFilters] = useState([false]);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchBulkUpdatesThunk(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeFilter = (options) => {
    const newFilters = options.map((option) => option.value);
    setFilters(newFilters);
  };

  const onClickBulkUpdate = (bulkId) => {
    navigate(`/bulk/view/${bulkId}`);
  };

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
                onChange={(emittedValue) => onChangeFilter(resolveReturnValues(emittedValue, true))}
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
                onClick={() => onClickBulkUpdate(bulk.id)}
                onKeyUp={(event) => {
                  if (event.key === 'Enter') {
                    onClickBulkUpdate(bulk.id);
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
};

export default BulkListView;
