import React, { useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import ClassificationHeader from '../../components/ClassificationHeader/ClassificationHeader';
import VersionSelector from '../../components/VersionSelector/VersionSelector';
import { displayMessage } from '../../utils/helpers';
import { setNavigationVisibility } from '../../store/reducers/navigation';
import {
  createTosThunk,
  fetchClassificationThunk,
  clearClassification,
  classificationSelector,
  isFetchingSelector,
  errorSelector,
} from '../../store/reducers/classification';

import './ViewClassification.scss';

const BODY_CLASS = 'helerm-classification-view';

const ViewClassification = () => {
  const dispatch = useDispatch();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const classification = useSelector(classificationSelector);
  const isFetching = useSelector(isFetchingSelector);
  const error = useSelector(errorSelector);

  const fetchClassification = useCallback(
    (id, requestParams = {}) => {
      if (id) {
        dispatch(fetchClassificationThunk({ id, params: requestParams }))
          .unwrap()
          .then(() => dispatch(setNavigationVisibility(false)))
          .catch((err) => {
            if (err instanceof URIError) {
              navigate(`/404?classification-id=${id}`);
            }
          });
      }
    },
    [dispatch, navigate],
  );

  useEffect(() => {
    const { id, version } = params;
    const requestParams = version ? { version } : {};

    fetchClassification(id, requestParams);

    addBodyClass();

    return () => {
      removeBodyClass();
      dispatch(clearClassification());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, params.version]);

  useEffect(() => {
    if (location && location.pathname === 'view-classification/:id') {
      dispatch(setNavigationVisibility(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const addBodyClass = () => {
    if (document.body) {
      document.body.className += BODY_CLASS;
    }
  };

  const removeBodyClass = () => {
    if (document.body) {
      document.body.className = document.body.className.replace(BODY_CLASS, '');
    }
  };

  const onVersionSelectorChange = (item) => {
    navigate(`/view-classification/${classification.id}/version/${item.value}`);
  };

  const createTos = () => {
    return dispatch(createTosThunk())
      .unwrap()
      .then((result) => {
        navigate(`/view-tos/${result.id}`);
        return displayMessage({
          title: 'Luonnos',
          body: 'Luonnos tallennettu!',
        });
      })
      .catch((err) =>
        displayMessage(
          {
            title: 'Virhe',
            body: `"${err}"`,
          },
          { type: 'error' },
        ),
      );
  };

  const renderClassificationData = (label, value) => {
    return (
      <div className='list-group-item col-xs-6'>
        <strong>{label}</strong>
        <div>{value || '\u00A0'}</div>
      </div>
    );
  };

  if ((isFetching && !classification?.id) || (error && !classification?.id)) {
    return null;
  }

  if (!classification?.id) {
    return null;
  }

  const descriptionInternal = renderClassificationData('Sisäinen kuvaus', classification.description_internal);
  const description = renderClassificationData('Kuvaus', classification.description);
  const relatedClassification = renderClassificationData(
    'Liittyvä tehtäväluokka',
    classification.related_classification,
  );
  const additionalInformation = renderClassificationData('Lisätiedot', classification.additional_information);
  const version = renderClassificationData('Versio', classification.version);

  return (
    <div className='col-xs-12 single-classification-container'>
      <ClassificationHeader
        code={classification.code}
        title={classification.title}
        createTos={createTos}
        functionAllowed={!classification.function && classification.function_allowed}
      />
      <div className='classification-version-selector'>
        <VersionSelector
          versionId={classification.id}
          currentVersion={classification.version}
          versions={classification.version_history}
          onChange={onVersionSelectorChange}
          label='Versio:'
        />
      </div>
      <div className='single-classification-content'>
        <div className='row'>
          <div className='general-info space-between'>
            <div className='classification-details col-xs-12'>
              <h5 style={{ marginTop: '0' }}>Tehtäväluokan tiedot</h5>
              {description}
              {descriptionInternal}
              {relatedClassification}
              {additionalInformation}
              {version}
            </div>
          </div>
          {classification.function ? (
            <div className='classification-details col-xs-12 no-print'>
              <Link to={`/view-tos/${classification.function}/version/${classification.function_version}`}>
                Käsittelyprosessi &raquo;
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

ViewClassification.BODY_CLASS = BODY_CLASS;

export default ViewClassification;
