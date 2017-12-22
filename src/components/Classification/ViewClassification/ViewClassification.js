import React from 'react';
import PropTypes from 'prop-types';

import ClassificationHeader from '../Header/ClassificationHeader';

import './ViewClassification.scss';

export class ViewClassification extends React.Component {
  constructor (props) {
    super(props);
    this.createTos = this.createTos.bind(this);
    this.fetchClassification = this.fetchClassification.bind(this);
  }

  componentDidMount () {
    const { params: { id } } = this.props;

    this.fetchClassification(id);
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
    this.props.clearClassification();
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
        'Liittyviä luokituksia',
        classification.related_classification
      );
      const additionalInformation = this.renderClassificationData(
        'Lisätietoa',
        classification.additional_information
      );
      return (
        <div>
          <div className='col-xs-12 single-classification-container'>
            <ClassificationHeader
              code={classification.code}
              title={classification.title}
              createTos={this.createTos}
            />

            <div className='single-classification-content'>
              <div className='row'>
                <div className='general-info space-between'>
                  <div className='classification-details col-xs-12'>
                    {description}
                    {descriptionInternal}
                    {relatedClassification}
                    {additionalInformation}
                  </div>
                </div>
              </div>
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
