import React from 'react';
import { 
  FiCalendar, FiClock, FiMapPin, FiUser, FiVideo,
  FiEdit, FiTrash2, FiCheckCircle, FiXCircle, FiPhone,
  FiUsers, FiTarget, FiMessageSquare
} from 'react-icons/fi';

/**
 * InterviewCard component for displaying interview details
 * 
 * @param {Object} props
 * @param {Object} props.interview - The interview object containing all interview data
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.onClick - Optional function to call when card is clicked
 */
const InterviewCard = ({ interview, onEdit, onDelete, onClick }) => {
  // Handle null interview object
  if (!interview) return null;
  
  // Format date and time for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };
  
  // Determine interview type icon
  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'Phone Screening':
        return <FiPhone />;
      case 'Technical':
        return <FiTarget />;
      case 'HR':
        return <FiUsers />;
      case 'Final':
        return <FiMessageSquare />;
      default:
        return <FiCalendar />;
    }
  };
  
  // Determine status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <span className="badge badge-primary">{status}</span>;
      case 'Completed':
        return <span className="badge badge-success">{status}</span>;
      case 'Cancelled':
        return <span className="badge badge-error">{status}</span>;
      case 'Rescheduled':
        return <span className="badge badge-warning">{status}</span>;
      case 'No Show':
        return <span className="badge badge-secondary">{status}</span>;
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };
  
  // Check if interview is upcoming
  const isUpcoming = () => {
    const now = new Date();
    const interviewDate = new Date(interview.scheduledDate);
    return interviewDate > now;
  };
  
  // Check if interview is today
  const isToday = () => {
    const now = new Date();
    const interviewDate = new Date(interview.scheduledDate);
    return interviewDate.toDateString() === now.toDateString();
  };
  
  return (
    <div 
      className={`card bg-base-200 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 ${
        isToday() 
          ? 'border-primary' 
          : isUpcoming() 
          ? 'border-accent' 
          : 'border-base-300'
      }`}
      onClick={() => onClick && onClick(interview)}
    >
      <div className="card-body p-5">
        {/* Header with candidate and position */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="card-title text-base-content">
              {interview.candidateId?.name || 'Candidate'}
            </h3>
            <p className="text-sm text-base-content/70">
              {interview.jobPostId?.jobTitle || 'Position'} at {interview.jobPostId?.company || 'Company'}
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            {getStatusBadge(interview.status)}
            <div className="mt-1 flex items-center text-xs text-base-content/60">
              {getInterviewTypeIcon(interview.interviewType)}
              <span className="ml-1">{interview.interviewType}</span>
            </div>
          </div>
        </div>
        
        {/* Interview details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center text-base-content/80">
            <FiCalendar className="mr-2 text-primary" />
            <span>{formatDate(interview.scheduledDate)}</span>
          </div>
          
          <div className="flex items-center text-base-content/80">
            <FiClock className="mr-2 text-primary" />
            <span>{formatTime(interview.scheduledDate)} ({interview.duration} min)</span>
          </div>
          
          {interview.location && (
            <div className="flex items-center text-base-content/80">
              <FiMapPin className="mr-2 text-primary" />
              <span>{interview.location}</span>
            </div>
          )}
          
          {interview.videoConferenceLink && (
            <div className="flex items-center text-base-content/80">
              <FiVideo className="mr-2 text-primary" />
              <a 
                href={interview.videoConferenceLink}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Video conference link
              </a>
            </div>
          )}
        </div>
        
        {/* Interview description */}
        {interview.description && (
          <div className="bg-base-300/30 p-3 rounded-md mb-3">
            <p className="text-sm text-base-content/80 line-clamp-2">
              {interview.description}
            </p>
          </div>
        )}
        
        {/* Additional attendees */}
        {interview.attendees && interview.attendees.length > 0 && (
          <div className="flex items-center text-xs text-base-content/60 mb-3">
            <FiUsers className="mr-2" />
            <span>Additional attendees: {interview.attendees.join(', ')}</span>
          </div>
        )}
        
        {/* Feedback summary if completed */}
        {interview.status === 'Completed' && interview.feedback && (
          <div className="flex items-center text-sm text-base-content/80 mb-3">
            {interview.feedback.recommended ? (
              <FiCheckCircle className="mr-2 text-success" />
            ) : (
              <FiXCircle className="mr-2 text-error" />
            )}
            <span>
              Rating: {interview.feedback.rating}/5 - 
              {interview.feedback.recommended ? ' Recommended' : ' Not Recommended'}
            </span>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="card-actions justify-end mt-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(interview);
            }}
            className="btn btn-sm btn-ghost hover:bg-base-300"
            aria-label="Edit interview"
          >
            <FiEdit />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(interview);
            }}
            className="btn btn-sm btn-ghost hover:bg-error hover:text-white"
            aria-label="Delete interview"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;