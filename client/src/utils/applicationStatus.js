/**
 * Utility functions for handling application statuses
 */

/**
 * All valid application statuses in the system
 */
export const APPLICATION_STATUSES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Interview Scheduled',
  'Interviewed',
  'Assessment',
  'Reference Check',
  'Offer Extended',
  'Offer Accepted',
  'Offer Declined',
  'Hired',
  'Rejected',
  'Withdrawn'
];

/**
 * Group application statuses by stage for filtering and reporting
 */
export const STATUS_GROUPS = {
  active: [
    'Submitted',
    'Under Review',
    'Shortlisted',
    'Interview Scheduled',
    'Interviewed',
    'Assessment',
    'Reference Check',
    'Offer Extended'
  ],
  completed: ['Hired', 'Offer Accepted'],
  closed: ['Offer Declined', 'Rejected', 'Withdrawn'],
  draft: ['Draft']
};

/**
 * Get the application status group
 * @param {string} status - The application status
 * @returns {string} The status group (active, completed, closed, draft)
 */
export const getStatusGroup = (status) => {
  if (STATUS_GROUPS.active.includes(status)) return 'active';
  if (STATUS_GROUPS.completed.includes(status)) return 'completed';
  if (STATUS_GROUPS.closed.includes(status)) return 'closed';
  if (STATUS_GROUPS.draft.includes(status)) return 'draft';
  return 'unknown';
};

/**
 * Valid status transitions
 * Maps current status to array of valid next statuses
 */
export const VALID_STATUS_TRANSITIONS = {
  'Draft': ['Submitted', 'Withdrawn'],
  'Submitted': ['Under Review', 'Rejected', 'Withdrawn'],
  'Under Review': ['Shortlisted', 'Rejected', 'Withdrawn'],
  'Shortlisted': ['Interview Scheduled', 'Rejected', 'Withdrawn'],
  'Interview Scheduled': ['Interviewed', 'Rejected', 'Withdrawn'],
  'Interviewed': ['Assessment', 'Reference Check', 'Offer Extended', 'Rejected', 'Withdrawn'],
  'Assessment': ['Reference Check', 'Offer Extended', 'Rejected', 'Withdrawn'],
  'Reference Check': ['Offer Extended', 'Rejected', 'Withdrawn'],
  'Offer Extended': ['Offer Accepted', 'Offer Declined', 'Withdrawn'],
  'Offer Accepted': ['Hired', 'Withdrawn'],
  'Offer Declined': [],
  'Hired': [],
  'Rejected': [],
  'Withdrawn': []
};

/**
 * Check if a status transition is valid
 * @param {string} currentStatus - The current application status
 * @param {string} newStatus - The new status to transition to
 * @returns {boolean} Whether the transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  if (!APPLICATION_STATUSES.includes(currentStatus) || !APPLICATION_STATUSES.includes(newStatus)) {
    return false;
  }
  
  // If current status equals new status, it's always valid (no change)
  if (currentStatus === newStatus) {
    return true;
  }
  
  // Check if the new status is in the list of valid transitions
  return VALID_STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get human-readable descriptions for each status
 * @param {string} status - The application status
 * @returns {string} Description of the status
 */
export const getStatusDescription = (status) => {
  const descriptions = {
    'Draft': 'Application started but not yet submitted',
    'Submitted': 'Application has been submitted and is awaiting review',
    'Under Review': 'Application is being reviewed by the hiring team',
    'Shortlisted': 'Candidate has been shortlisted for further consideration',
    'Interview Scheduled': 'An interview has been scheduled with the candidate',
    'Interviewed': 'The candidate has completed their interview',
    'Assessment': 'Candidate is completing or has completed an assessment',
    'Reference Check': 'References are being checked',
    'Offer Extended': 'A job offer has been extended to the candidate',
    'Offer Accepted': 'The candidate has accepted the job offer',
    'Offer Declined': 'The candidate has declined the job offer',
    'Hired': 'The candidate has been hired and onboarded',
    'Rejected': 'The application has been rejected',
    'Withdrawn': 'The candidate has withdrawn their application'
  };
  
  return descriptions[status] || 'Unknown status';
};

export default {
  APPLICATION_STATUSES,
  STATUS_GROUPS,
  getStatusGroup,
  VALID_STATUS_TRANSITIONS,
  isValidStatusTransition,
  getStatusDescription
};