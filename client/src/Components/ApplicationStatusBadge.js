import React from 'react';
import { 
  FiClock, FiSend, FiSearch, FiUserCheck, 
  FiCalendar, FiCheckCircle, FiClipboard, 
  FiUsers, FiMail, FiThumbsUp, FiThumbsDown, 
  FiBriefcase, FiXCircle, FiXSquare 
} from 'react-icons/fi';

/**
 * A reusable component for displaying application status badges with consistent styling
 * 
 * @param {Object} props Component props
 * @param {string} props.status The application status to display
 * @param {boolean} props.showIcon Whether to show the status icon (default: true)
 * @param {string} props.size Badge size: 'sm', 'md', 'lg' (default: 'md')
 */
const ApplicationStatusBadge = ({ status, showIcon = true, size = 'md' }) => {
  // Get badge color based on status
  const getBadgeColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'badge-neutral';
      case 'Submitted':
        return 'badge-info';
      case 'Under Review':
        return 'badge-warning';
      case 'Shortlisted':
        return 'badge-success';
      case 'Interview Scheduled':
        return 'badge-primary';
      case 'Interviewed':
        return 'badge-primary';
      case 'Assessment':
        return 'badge-secondary';
      case 'Reference Check':
        return 'badge-secondary';
      case 'Offer Extended':
        return 'badge-accent';
      case 'Offer Accepted':
        return 'badge-success';
      case 'Hired':
        return 'badge-success';
      case 'Offer Declined':
        return 'badge-error';
      case 'Rejected':
        return 'badge-error';
      case 'Withdrawn':
        return 'badge-neutral';
      default:
        return 'badge-ghost';
    }
  };

  // Get appropriate icon for the status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Draft':
        return <FiClock className="mr-1" />;
      case 'Submitted':
        return <FiSend className="mr-1" />;
      case 'Under Review':
        return <FiSearch className="mr-1" />;
      case 'Shortlisted':
        return <FiUserCheck className="mr-1" />;
      case 'Interview Scheduled':
        return <FiCalendar className="mr-1" />;
      case 'Interviewed':
        return <FiCheckCircle className="mr-1" />;
      case 'Assessment':
        return <FiClipboard className="mr-1" />;
      case 'Reference Check':
        return <FiUsers className="mr-1" />;
      case 'Offer Extended':
        return <FiMail className="mr-1" />;
      case 'Offer Accepted':
        return <FiThumbsUp className="mr-1" />;
      case 'Offer Declined':
        return <FiThumbsDown className="mr-1" />;
      case 'Hired':
        return <FiBriefcase className="mr-1" />;
      case 'Rejected':
        return <FiXCircle className="mr-1" />;
      case 'Withdrawn':
        return <FiXSquare className="mr-1" />;
      default:
        return <FiClock className="mr-1" />;
    }
  };

  // Determine badge size class
  const sizeClass = () => {
    switch (size) {
      case 'sm':
        return 'badge-sm';
      case 'lg':
        return 'badge-lg';
      default:
        return '';
    }
  };

  return (
    <div className={`badge ${getBadgeColor(status)} ${sizeClass()} flex items-center`}>
      {showIcon && getStatusIcon(status)}
      <span>{status}</span>
    </div>
  );
};

export default ApplicationStatusBadge;