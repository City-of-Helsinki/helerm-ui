/* eslint-disable import/no-cycle */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import includes from 'lodash/includes';
import capitalize from 'lodash/capitalize';

import Attribute from './Attribute';

const Attributes = ({
  attributeTypes,
  element,
  documentState,
  renderBasicAttributes,
  renderButtons,
  showAttributes,
  type,
  typeOptions,
  updateAttribute,
  updateTypeSpecifier,
  updateType,
}) => {
  const unwantedAttributes = ['TypeSpecifier', 'RecordType', 'ActionType', 'PhaseType'];
  const defaultAttributes = [];
  Object.keys(attributeTypes).forEach((key) => {
    if (
      Object.hasOwn(attributeTypes, key) &&
      attributeTypes[key].defaultIn.indexOf(type) >= 0 &&
      !includes(unwantedAttributes, key)
    ) {
      defaultAttributes.push(key);
    }
  });

  function generateDescriptions(elem) {
    const descriptions = [];
    let elementType = 'Käsittelyvaiheen tyyppi';
    if (type === 'action') {
      elementType = 'Toimenpiteen tyyppi';
    } else if (type === 'record') {
      elementType = 'Asiakirjan tyyppi';
    }
    descriptions.push({
      descriptionKey: `${elementType} tarkenne`,
      typeSpecifier: elem.attributes[`${capitalize(type)}Type`],
      type: elem.attributes[`${capitalize(type)}Type`],
    });
    descriptions.push({
      descriptionKey: 'Tarkenne',
      typeSpecifier: elem.attributes.TypeSpecifier,
      type: '',
    });

    return descriptions;
  }

  function generateBasicAttributes(descriptions) {
    return descriptions.map((description) => (
      <Attribute
        key={`${element.id}-${description.type}`}
        elementId={element.id}
        attributeIndex={description.type}
        attributeKey=''
        attribute={description.typeSpecifier}
        documentState={documentState}
        typeOptions={typeOptions}
        type='basic'
        parentType={type}
        editable
        updateTypeSpecifier={updateTypeSpecifier}
        updateType={updateType}
        updateAttribute={updateAttribute}
        showAttributes
      />
    ));
  }

  function generateDefaultAttributes(attr) {
    return defaultAttributes.map((key) => (
      <Attribute
        key={key}
        elementId={element.id}
        attributeIndex={key}
        attributeKey={attributeTypes[key].name}
        attribute={attr[key]}
        attributeTypes={attributeTypes}
        documentState={documentState}
        type='attribute'
        parentType={type}
        editable
        updateAttribute={updateAttribute}
        showAttributes={showAttributes}
      />
    ));
  }

  function generateAttributes(attr) {
    const attributeElements = [];

    Object.keys(attributeTypes).forEach((key) => {
      if (
        Object.hasOwn(attr, key) &&
        attr[key] &&
        attributeTypes[key] &&
        !includes(unwantedAttributes, key) &&
        !includes(defaultAttributes, key)
      ) {
        attributeElements.push(
          <Attribute
            key={key}
            elementId={element.id}
            attributeIndex={key}
            attributeKey={attributeTypes[key].name}
            attribute={attr[key]}
            attributeTypes={attributeTypes}
            documentState={documentState}
            type='attribute'
            parentType={type}
            editable
            updateAttribute={updateAttribute}
            showAttributes={showAttributes}
          />,
        );
      }
    });

    return attributeElements;
  }

  const buttons = renderButtons ? renderButtons() : null;
  const basicAttributes = renderBasicAttributes
    ? renderBasicAttributes()
    : generateBasicAttributes(generateDescriptions(element));
  const defaultViewAttributes = generateDefaultAttributes(element.attributes);
  const attributes = generateAttributes(element.attributes);

  return (
    <div className={classnames('list-group', `${type}-attributes`)}>
      {basicAttributes}
      {buttons}
      {defaultViewAttributes}
      {attributes}
    </div>
  );
};

Attributes.propTypes = {
  attributeTypes: PropTypes.object.isRequired,
  documentState: PropTypes.string.isRequired,
  element: PropTypes.object.isRequired,
  renderBasicAttributes: PropTypes.func,
  renderButtons: PropTypes.func,
  showAttributes: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  typeOptions: PropTypes.object,
  updateAttribute: PropTypes.func,
  updateType: PropTypes.func,
  updateTypeSpecifier: PropTypes.func,
};

export default Attributes;
