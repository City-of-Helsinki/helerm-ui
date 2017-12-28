// Permissions
export const EDIT = 'can_edit';
export const APPROVE = 'can_approve';
export const REVIEW = 'can_review';

// Statuses
export const DRAFT = 'draft';
export const SENT_FOR_REVIEW = 'sent_for_review';
export const WAITING_FOR_APPROVAL = 'waiting_for_approval';
export const APPROVED = 'approved';

// Validation
// Matches these https://github.com/City-of-Helsinki/helerm/issues/155
export const VALIDATION_SPECIAL_CASES = {
  action: {
    allow_values_outside_choices: ['InformationSystem']
  },
  function: {
    allow_values_outside_choices: [
      'CollectiveProcessIDSource',
      'DataGroup',
      'InformationSystem',
      'ProcessOwner',
      'Subject',
      'Subject.Scheme'
    ]
  },
  phase: {
    allow_values_outside_choices: ['InformationSystem']
  },
  record: {
    allow_values_outside_choices: [
      'DataGroup',
      'InformationSystem',
      'Subject',
      'Subject.Scheme'
    ]
  }
};
