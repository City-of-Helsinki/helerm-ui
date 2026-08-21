import { difference } from 'lodash';

/**
 * Validate conditional rules
 * @param key
 * @param attributeTypes
 * @param attributes
 * @returns {Boolean}
 */
export const validateConditionalRules = (key, attributeTypes, attributes) => {
  const { requiredIf } = attributeTypes[key];

  let valid = false;

  Object.keys(attributes).forEach((attribute) => {
    // for each attribute
    requiredIf.forEach((item) => {
      // for each item in requiredIf and if requiredIf has attribute
      if (item.key === attribute && (item.values ?? []).includes(attributes[attribute]?.value)) {
        // if requiredIf has same value as attribute
        valid = true;
      }
    });
  });

  return valid;
};

/**
 * @typedef {function(obj:Object, rules:Object):string[]} Validator
 */
/**
 * @param  {string} type
 * @return {Validator}]
 */
const createValidateErrors = (type) => (obj, rules) => {
  const keys = Object.keys(rules).filter((key) => Object.hasOwn(rules, key));

  const errors = keys.filter((key) => {
    const rule = rules[key];

    const isRequired = rules[key].required;
    const isRequiredInType = (rule.requiredIn ?? []).includes(type);
    const objHasRuleAttribute = Boolean(obj.attributes[key]);

    const isAttributeAllowedInType = (rules[key].allowedIn ?? []).includes(type);
    const isValid =
      rule.values.map(({ value }) => value).includes(obj.attributes[key]) || rule.values.length === 0;
    const allowValuesOutsideChoices = (rule.allowValuesOutsideChoicesIn ?? []).includes(type);

    return (
      (isRequired && isRequiredInType && !objHasRuleAttribute) ||
      (objHasRuleAttribute && !isValid && !allowValuesOutsideChoices) ||
      (!isAttributeAllowedInType && objHasRuleAttribute)
    );
  });

  const conditionallyRequired = keys
    .filter((key) => rules[key].requiredIf.length > 0)
    .map((key) => ({ key, items: rules[key].requiredIf }))
    .filter(({ key, items }) =>
      items.some((item) => {
        const predicateValue = obj.attributes[item.key];
        const hasPredicate = typeof predicateValue === 'string';

        const isPredicateRequired = hasPredicate && (item.values ?? []).includes(predicateValue);

        const objHasRuleAttribute = !!obj.attributes[key];

        return (isPredicateRequired && !objHasRuleAttribute) || (!isPredicateRequired && objHasRuleAttribute);
      }),
    )
    .map(({ key }) => key);

  return [...errors, ...conditionallyRequired];
};

const isValueValidOption = (value, options) => {
  const valueArray = Array.isArray(value) ? value : [value];
  const optionValues = options.map((option) => option.value);
  return difference(valueArray, optionValues).length === 0;
};

/**
 * @param  {string} type
 * @return {Validator}]
 */
const createValidateWarnings = (type) => (obj, rules) => {
  const warnings = [];
  Object.keys(rules).forEach((key) => {
    if (Object.hasOwn(rules, key)) {
      const rule = rules[key];
      const attributeValue = obj.attributes[key];
      const allowOutsideValues = (rule.allowValuesOutsideChoicesIn ?? []).includes(type);

      if (
        attributeValue &&
        rule.values.length &&
        !isValueValidOption(attributeValue, rule.values) &&
        allowOutsideValues
      ) {
        warnings.push(key);
      }
    }
  });
  return [...new Set(warnings)];
};

/**
 * Validate TOS against required rules
 */
export const validateTOS = createValidateErrors('function');

/**
 * Validate TOS against warning rules
 */
export const validateTOSWarnings = createValidateWarnings('function');

/**
 * Validate Phase against required rules
 */
export const validatePhase = createValidateErrors('phase');

/**
 * Validate Phase against warning rules
 */
export const validatePhaseWarnings = createValidateWarnings('phase');

/**
 * Validate Action against required rules
 */
export const validateAction = createValidateErrors('action');

/**
 * Validate Action against warning rules
 * @param action
 * @param rules
 * @returns {Array}
 */
export const validateActionWarnings = createValidateWarnings('action');

/**
 * Validate Record against required rules
 */
export const validateRecord = createValidateErrors('record');

/**
 * Validate Record against warn rules
 */
export const validateRecordWarnings = createValidateWarnings('record');
