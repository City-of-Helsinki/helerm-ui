import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ClassificationHeader from '../../components/ClassificationHeader/ClassificationHeader';
import VersionSelector from '../../components/VersionSelector/VersionSelector';
import withRouter from '../../components/hoc/withRouter';

import './ViewClassification.scss';

const BODY_CLASS = 'helerm-classification-view';

const ViewClassification = ({
  classification,
  clearClassification,
  createTos: createTosProp,
  displayMessage,
  fetchClassification: fetchClassificationProp,
  params,
  location,
  navigate,
  setNavigationVisibility,
}) => {
  const fetchClassification = useCallback(
    (id, requestParams = {}) => {
      if (id) {
        fetchClassificationProp(id, requestParams)
          .then(() => setNavigationVisibility(false))
          .catch((err) => {
            if (err instanceof URIError) {
              // We have a 404 from API
              navigate(`/404?classification-id=${id}`);
            }
          });
      }
    },
    [fetchClassificationProp, navigate, setNavigationVisibility],
  );

  useEffect(() => {
    const { id, version } = params;
    const requestParams = version ? { version } : {};

    fetchClassification(id, requestParams);
    addBodyClass();

    return () => {
      removeBodyClass();
      clearClassification();
    };
  }, [params, fetchClassification, clearClassification]);

  useEffect(() => {
    const { id, version } = params;

    if (id) {
      const requestParams = version ? { version } : {};
      fetchClassification(id, requestParams);
    }

    if (location && location.pathname === 'view-classification/:id') {
      setNavigationVisibility(false);
    }
  }, [params, params.id, params.version, location, fetchClassification, setNavigationVisibility]);

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
    return createTosProp()
      .then((action) => {
        navigate(`/view-tos/${action.payload.id}`);
        return displayMessage({
          title: 'Luonnos',
          body: 'Luonnos tallennettu!',
        });
      })
      .catch((err) =>
        displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`,
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

ViewClassification.propTypes = {
  classification: PropTypes.object,
  clearClassification: PropTypes.func.isRequired,
  createTos: PropTypes.func.isRequired,
  displayMessage: PropTypes.func.isRequired,
  fetchClassification: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired,
};

ViewClassification.BODY_CLASS = BODY_CLASS;

export default withRouter(ViewClassification);
