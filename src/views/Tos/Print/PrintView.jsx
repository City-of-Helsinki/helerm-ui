/* eslint-disable operator-assignment */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import get from 'lodash/get';

import { fetchTOSThunk } from '../../../store/reducers/tos-toolkit';
import { itemsSelector, setNavigationVisibility } from '../../../store/reducers/navigation';
import { getStatusLabel, formatDateTime, getNewPath, itemById } from '../../../utils/helpers';
import MetaDataTable from '../../../components/Tos/Print/MetaDataTable';
import PrintClassification from '../../../components/Tos/Print/PrintClassification';
import PrintPhase from '../../../components/Tos/Print/PrintPhase';
import { selectedTOSSelector } from '../../../store/reducers/tos-toolkit/main';
import { attributeTypesSelector } from '../../../store/reducers/ui';

import './PrintView.scss';

const PrintView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const selectedTOS = useSelector(selectedTOSSelector);

  const attributeTypes = useSelector(attributeTypesSelector);
  const navigationItems = useSelector(itemsSelector);

  const TOS = denormalizeTOS(selectedTOS);
  const classification = getClassification(selectedTOS, navigationItems);

  const getAttributeName = (key) => get(attributeTypes, [key, 'name'], key);

  const sortAttributeKeys = (keys) =>
    keys.sort((a, b) => get(attributeTypes, [a, 'index'], Infinity) - get(attributeTypes, [b, 'index'], Infinity));

  const addBodyClass = () => {
    if (document.body) {
      document.body.className = document.body.className + PrintView.BODY_CLASS;
    }
  };

  const removeBodyClass = () => {
    if (document.body) {
      document.body.className = document.body.className.replace(PrintView.BODY_CLASS, '');
    }
  };

  useEffect(() => {
    addBodyClass();
    if (location && location.pathname.path === '/view-tos/:id/print') {
      dispatch(setNavigationVisibility(false));
    }

    const tosAvailable = TOS.id === params.id && (!params.version || TOS.version === params.version);
    if (!tosAvailable) {
      const requestParams = {};
      if (typeof params.version !== 'undefined') {
        requestParams.version = params.version;
      }
      dispatch(fetchTOSThunk({ tosId: params.id, params: requestParams })).catch((err) => {
        if (err instanceof URIError) {
          navigate(`/404?tos-id=${params.id}`);
        }
      });
    }

    return () => {
      removeBodyClass();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, location]);

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
};

PrintView.BODY_CLASS = 'helerm-tos-print-view';

const denormalizeTOS = (tos) => ({
  ...tos,
  phases: Object.values(tos.phases || {})
    .sort((a, b) => a.index - b.index)
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

export default PrintView;
