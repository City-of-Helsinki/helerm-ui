import React from 'react';
import { withRouter, routerShape } from 'react-router';

import Phase from 'components/Tos/Phase/Phase';
import AddElementInput from 'components/Tos/AddElementInput/AddElementInput';
import Attribute from 'components/Tos/Attribute/Attribute';
import ClassificationHeader from '../Header/ClassificationHeader';

import Popup from 'components/Popup';
import Dropdown from 'components/Dropdown';

import { formatDateTime, getStatusLabel } from '../../../utils/helpers';
import {
  validateTOS,
  validatePhase,
  validateAction,
  validateRecord
} from '../../../utils/validators';

import './ViewClassification.scss';

export class ViewClassification extends React.Component {
  constructor (props) {
    super(props);
    this.createTos = this.createTos.bind(this);
    this.fetchClassification = this.fetchClassification.bind(this);

    this.state = { };
  }

  componentDidMount () {
    const { params: { id }, router, route } = this.props;

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
      this.props.fetchClassification(id, params)
        .then(() => this.props.setNavigationVisibility(false))
        .catch((err) => {
          if (err instanceof URIError) {
            // We have a 404 from API
            this.props.push(`/404?classification-id=${id}`);
          }
        });
    }
  }

  createTos () {
    return this.props.createTos()
      .then((tos) => {
        this.props.push(`/view-tos/${tos.payload.id}`);
        return this.props.displayMessage({
          title: 'Luonnos',
          body: 'Luonnos tallennettu!'
        });
      })
      .catch(err => {
        return this.props.displayMessage({
          title: 'Virhe',
          body: `"${err.message}"`
        }, { type: 'error' });
      });
  }

  renderClassificationData (label, value) {
    return (
      <div className="list-group-item col-xs-6">
        <strong>{label}</strong>
        <div>{value || '\u00A0'}</div>
      </div>
    );
  }

  render () {
    const { classification } = this.props;
    if (classification && classification.id) {
      const descriptionInternal = this.renderClassificationData('Sisäinen kuvaus', classification.description);
      const description = this.renderClassificationData('Kuvaus', classification.description);
      const relatedClassification = this.renderClassificationData('Liittyviä luokituksia', classification.related_classification);
      const additionalInformation = this.renderClassificationData('Lisätietoa', classification.additional_information);
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
  isFetching: React.PropTypes.bool.isRequired,
  push: React.PropTypes.func.isRequired,
  route: React.PropTypes.object.isRequired,
  router: routerShape.isRequired,
  createTos: React.PropTypes.func.isRequired,
  fetchClassification: React.PropTypes.func.isRequired,
  clearClassification: React.PropTypes.func.isRequired,
  setNavigationVisibility: React.PropTypes.func.isRequired,
  displayMessage: React.PropTypes.func.isRequired
};

export default withRouter(ViewClassification);
