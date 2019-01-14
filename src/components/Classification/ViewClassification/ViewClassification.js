import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import ClassificationHeader from '../Header/ClassificationHeader';

import './ViewClassification.scss';

export class ViewClassification extends React.Component {

  static BODY_CLASS = 'helerm-classification-view';

  constructor (props) {
    super(props);
    this.createTos = this.createTos.bind(this);
    this.fetchClassification = this.fetchClassification.bind(this);
  }

  componentDidMount () {
    const { params: { id } } = this.props;

    this.fetchClassification(id);
    this.addBodyClass();
  }

  componentWillReceiveProps (nextProps) {
    const { route } = nextProps;

    if (nextProps.params.id !== this.props.params.id) {
      const { id } = nextProps.params;
      this.fetchClassification(id);
    }

    if (route && route.path === 'view-classification/:id') {
      this.props.setNavigationVisibility(false);
    }
  }

  componentWillUnmount () {
    this.removeBodyClass();
    this.props.clearClassification();
  }

  addBodyClass () {
    if (document.body) {
      document.body.className = document.body.className + ViewClassification.BODY_CLASS;
    }
  }

  removeBodyClass () {
    if (document.body) {
      document.body.className = document.body.className.replace(
        ViewClassification.BODY_CLASS,
        ''
      );
    }
  }

  fetchClassification (id, params = {}) {
    if (id) {
      this.props
        .fetchClassification(id, params)
        .then(() => this.props.setNavigationVisibility(false))
        .catch(err => {
          if (err instanceof URIError) {
            // We have a 404 from API
            this.props.push(`/404?classification-id=${id}`);
          }
        });
    }
  }

  createTos () {
    return this.props
      .createTos()
      .then(action => {
        this.props.push(`/view-tos/${action.payload.id}`);
        return this.props.displayMessage({
          title: 'Luonnos',
          body: 'Luonnos tallennettu!'
        });
      })
      .catch(err => {
        return this.props.displayMessage(
          {
            title: 'Virhe',
            body: `"${err.message}"`
          },
          { type: 'error' }
        );
      });
  }

  renderClassificationData (label, value) {
    return (
      <div className='list-group-item col-xs-6'>
        <strong>{label}</strong>
        <div>{value || '\u00A0'}</div>
      </div>
    );
  }

  render () {
    const { classification } = this.props;
    if (classification && classification.id) {
      const descriptionInternal = this.renderClassificationData(
        'Sisäinen kuvaus',
        classification.description_internal
      );
      const description = this.renderClassificationData(
        'Kuvaus',
        classification.description
      );
      const relatedClassification = this.renderClassificationData(
        'Liittyvä tehtäväluokka',
        classification.related_classification
      );
      const additionalInformation = this.renderClassificationData(
        'Lisätiedot',
        classification.additional_information
      );
      return (
        <div className='col-xs-12 single-classification-container'>
          <ClassificationHeader
            code={classification.code}
            title={classification.title}
            createTos={this.createTos}
            functionAllowed={!classification.function && classification.function_allowed}
          />

          <div className='single-classification-content'>
            <div className='row'>
              <div className='general-info space-between'>
                <div className='classification-details col-xs-12'>
                  <h5 style={{ marginTop: '0' }}>Tehtäväluokan tiedot</h5>
                  {description}
                  {descriptionInternal}
                  {relatedClassification}
                  {additionalInformation}
                </div>
              </div>
              {classification.function
                ? (
                  <div className='classification-details col-xs-12 no-print'>
                    <Link to={`/view-tos/${classification.function}`}>
                        Käsittelyprosessi &raquo;
                      </Link>
                  </div>
                )
                : null}
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
  push: PropTypes.func.isRequired,
  route: PropTypes.object.isRequired,
  setNavigationVisibility: PropTypes.func.isRequired
};

export default ViewClassification;
