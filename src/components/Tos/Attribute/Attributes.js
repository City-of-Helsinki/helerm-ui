import React from 'react';

import Attribute from './Attribute';

export const Attributes = ({
  attributeTypes,
  element,
  documentState,
  mode,
  renderButtons,
  showAttributes,
  type,
  typeOptions,
  updateAttribute,
  updateTypeSpecifier,
  updateType
}) => {
  function generateDescriptions (element) {
    const descriptions = [];
    let elementDescription;
    let elementType;

    switch (type) {
      case 'phase':
        elementDescription = 'Käsittelyvaihetyypin';
        elementType = 'PhaseType';
        break;
      case 'action':
        elementDescription = 'Toimenpidetyypin';
        elementType = 'ActionType';
        break;
      case 'record':
        elementDescription = 'Asiakirjatyypin';
        elementType = 'RecordType';
        break;
    }

    descriptions.push({
      descriptionKey: `${elementDescription} tarkenne`,
      name: element.name,
      type: ''
    });
    descriptions.push({
      descriptionKey: 'Tyyppi',
      name: element.attributes[`${elementType}`],
      type: element.attributes[`${elementType}`]
    });

    return descriptions;
  }

  function generateBasicAttributes (descriptions) {
    return descriptions.map((description, index) => {
      return (
        <Attribute
          key={index}
          recordId={element.id}
          attributeIndex={description.type}
          attributeKey=''
          attribute={description.name}
          documentState={documentState}
          attributeTypes={typeOptions}
          mode={mode}
          type={'record'}
          editable={true}
          updateTypeSpecifier={updateTypeSpecifier}
          updateType={updateType}
          updateAttribute={updateAttribute}
          showAttributes={true}
        />
      );
    });
  }

  function generateAttributes (attributes) {
    const attributeElements = [];

    for (const key in attributeTypes) {
      if (attributes.hasOwnProperty(key) && attributes[key] && attributeTypes[key]) {
        attributeElements.push(
          <Attribute
            key={key}
            recordId={element.id}
            attributeIndex={key}
            attributeKey={attributeTypes[key].name}
            attribute={attributes[key]}
            attributeTypes={attributeTypes}
            documentState={documentState}
            mode={mode}
            type={'attribute'}
            editable={true}
            updateAttribute={updateAttribute}
            showAttributes={showAttributes}
          />);
      }
    }
    return attributeElements;
  }

  const buttons = renderButtons();
  const descriptions = generateDescriptions(element);
  const basicAttributes = generateBasicAttributes(descriptions);
  const attributes = generateAttributes(element.attributes);

  return (
    <div className='list-group'>
      { buttons }
      { basicAttributes }
      { attributes }
    </div>
  );
};

Attributes.propTypes = {
  attributeTypes: React.PropTypes.object.isRequired,
  documentState: React.PropTypes.string.isRequired,
  element: React.PropTypes.object.isRequired,
  mode: React.PropTypes.string.isRequired,
  renderButtons: React.PropTypes.func.isRequired,
  showAttributes: React.PropTypes.bool.isRequired,
  type: React.PropTypes.string.isRequired,
  typeOptions: React.PropTypes.object,
  updateAttribute: React.PropTypes.func,
  updateType: React.PropTypes.func,
  updateTypeSpecifier: React.PropTypes.func
};

export default Attributes;
