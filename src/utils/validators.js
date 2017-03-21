/**
 * Validate TOS against rules
 * @param tos
 * @param rules
 * @returns {Array}
 */
export const validateTOS = (tos, rules) => {
  let errors = [];
  for (const key in rules) {
    if (rules[key].required && rules[key].requiredIn.includes('function')) {
      if (!tos.attributes[key]) {
        errors.push(key);
      }
    }
    if (rules[key].requiredIf.length) {
      for (const item in key.requiredIf) {
        if (item.key === key && !item.values.includes(tos.attributes[key])) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};

/**
 * Validate Phase against rules
 * @param phase
 * @param rules
 * @returns {Array}
 */
export const validatePhase = (phase, rules) => {
  let errors = [];
  // TODO: implementation
  return errors;
};

/**
 * Validate Action against rules
 * @param action
 * @param rules
 * @returns {Array}
 */
export const validateAction = (action, rules) => {
  let errors = [];
  // TODO: implementation
  return errors;
};

/**
 * Validate Record against rules
 * @param record
 * @param rules
 * @returns {Array}
 */
export const validateRecord = (record, rules) => {
  let errors = [];
  for (const key in rules) {
    if (rules[key].required && rules[key].requiredIn.includes('record')) {
      if (!record.attributes[key]) {
        errors.push(key);
      }
    }
    if (rules[key].requiredIf.length) {
      for (const item in key.requiredIf) {
        if (item.key === key && !item.values.includes(record.attributes[key].value)) {
          errors.push(key);
        }
      }
    }
  }
  return errors;
};
