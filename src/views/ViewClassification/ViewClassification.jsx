import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ClassificationHeader from '../../components/ClassificationHeader/ClassificationHeader';
import VersionSelector from '../../components/VersionSelector/VersionSelector';
import withRouter from '../../components/hoc/withRouter';

import './ViewClassification.scss';

class ViewClassification extends React.Component {
  constructor(props) {
    super(props);
    this.createTos = this.createTos.bind(this);
    this.fetchClassification = this.fetchClassification.bind(this);
    this.onVersionSelectorChange = this.onVersionSelectorChange.bind(this);
  }

  componentDidMount() {
    const { id, version } = this.props.params;
    const requestParams = version ? { version } : {};
    this.fetchClassification(id, requestParams);
    this.addBodyClass();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { params, location } = nextProps;

    if (params.id !== this.props.params.id || params.version !== this.props.params.version) {
      const { id, version } = params;
      const requestParams = version ? { version } : {};
      this.fetchClassification(id, requestParams);
    }

    if (location && location.pathname === 'view-classification/:id') {
      this.props.setNavigationVisibility(false);
    }
  }

  componentWillUnmount() {
    this.removeBodyClass();
    this.props.clearClassification();
  }

  onVersionSelectorChange(item) {
    this.props.navigate(`/view-classification/${this.props.classification.id}/version/${item.value}`);
  }

  addBodyClass() {
    if (document.body) {
      document.body.className += ViewClassification.BODY_CLASS;
    }
  }

  removeBodyClass() {
    if (document.body) {
      document.body.className = document.body.className.replace(ViewClassification.BODY_CLASS, '');
    }
  }

  fetchClassification(id, requestParams = {}) {
    if (id) {
      this.props
        .fetchClassification(id, requestParams)
        .then(() => this.props.setNavigationVisibility(false))
        .catch((err) => {
          if (err instanceof URIError) {
            // We have a 404 from API
            this.props.navigate(`/404?classification-id=${id}`);
          }
        });
    }
  }

  createTos() {
    return this.props
      .createTos()
      .then((action) => {
        this.props.navigate(`/view-tos/${action.payload.id}`);
        return this.props.displayMessage({
          title: 'Luonnos',
          body: 'Luonnos tallennettu!',
        });
      })
      .catch((err) =>
        this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`,
          },
          { type: 'error' },
        ),
      );
  }

  renderClassificationData(label, value) {
    return (
      <div className='list-group-item col-xs-6'>
        <strong>{label}</strong>
        <div>{value || '\u00A0'}</div>
      </div>
    );
  }

  render() {
    const { classification } = this.props;

    if (classification?.id) {
      const descriptionInternal = this.renderClassificationData('Sisäinen kuvaus', classification.description_internal);
      const description = this.renderClassificationData('Kuvaus', classification.description);
      const relatedClassification = this.renderClassificationData(
        'Liittyvä tehtäväluokka',
        classification.related_classification,
      );
      const additionalInformation = this.renderClassificationData('Lisätiedot', classification.additional_information);
      const version = this.renderClassificationData('Versio', classification.version);
      return (
        <div className='col-xs-12 single-classification-container'>
          <ClassificationHeader
            code={classification.code}
            title={classification.title}
            createTos={this.createTos}
            functionAllowed={!classification.function && classification.function_allowed}
          />
          <div className='classification-version-selector'>
            <VersionSelector
              versionId={classification.id}
              currentVersion={classification.version}
              versions={classification.version_history}
              onChange={this.onVersionSelectorChange}
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
    }
    return null;
  }
}

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

ViewClassification.BODY_CLASS = 'helerm-classification-view';

export default withRouter(ViewClassification);
