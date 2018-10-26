// Misc
export const DEFAULT_PAGE_SIZE = 2000;

// Permissions
export const EDIT = 'can_edit';
export const APPROVE = 'can_approve';
export const REVIEW = 'can_review';

// Statuses
export const DRAFT = 'draft';
export const SENT_FOR_REVIEW = 'sent_for_review';
export const WAITING_FOR_APPROVAL = 'waiting_for_approval';
export const APPROVED = 'approved';

// Status filters
export const statusFilters = [
  { value: DRAFT, label: 'Luonnos' },
  { value: SENT_FOR_REVIEW, label: 'Lähetetty tarkastettavaksi' },
  { value: WAITING_FOR_APPROVAL, label: 'Odottaa hyväksymistä' },
  { value: APPROVED, label: 'Hyväksytty', default: true }
];

// export for easier administration
export const navigationStateFilters = {
  statusFilters: {
    path: ['function_state'],
    values: []
  },
  retentionPeriodFilters: {
    path: [
      'function_attributes.RetentionPeriod',
      'phases.actions.records.attributes.RetentionPeriod'
    ],
    values: []
  }
};
