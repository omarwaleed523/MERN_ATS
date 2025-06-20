import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import InterviewCard from '../Components/InterviewCard';
import { 
  FiCalendar, FiFilter, FiSearch, FiX,
  FiUser, FiBriefcase, FiMapPin, FiVideo,
  FiUsers, FiCheck, FiMessageSquare, FiInfo,
  FiClock
} from 'react-icons/fi';

const CandidateInterviews = () => {
  const { user } = useContext(UserContext);
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  
  // Modal states
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  
  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });

  // Fetch interviews for this candidate
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/interviews`, {
          headers: { 'x-auth-token': user.token }
        });
        setInterviews(response.data);
        setFilteredInterviews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setError(err.response?.data?.message || 'Error loading interviews');
        setLoading(false);
      }
    };

    if (user && user.token) {
      fetchInterviews();
    }
  }, [user]);

  // Apply filters when they change
  useEffect(() => {
    if (!interviews.length) return;
    
    let results = [...interviews];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(interview => {
        const jobTitle = interview.jobPostId?.jobTitle?.toLowerCase() || '';
        const company = interview.jobPostId?.company?.toLowerCase() || '';
        
        return jobTitle.includes(term) || 
               company.includes(term);
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(interview => interview.status === statusFilter);
    }
    
    // Apply timeframe filter
    const now = new Date();
    if (timeframeFilter === 'today') {
      results = results.filter(interview => {
        const interviewDate = new Date(interview.scheduledDate);
        return interviewDate.toDateString() === now.toDateString();
      });
    } else if (timeframeFilter === 'week') {
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      results = results.filter(interview => {
        const interviewDate = new Date(interview.scheduledDate);
        return interviewDate >= weekStart && interviewDate <= weekEnd;
      });
    } else if (timeframeFilter === 'upcoming') {
      results = results.filter(interview => {
        const interviewDate = new Date(interview.scheduledDate);
        return interviewDate > now;
      });
    } else if (timeframeFilter === 'past') {
      results = results.filter(interview => {
        const interviewDate = new Date(interview.scheduledDate);
        return interviewDate < now;
      });
    }
    
    // Sort interviews - upcoming first, then past
    results.sort((a, b) => {
      const dateA = new Date(a.scheduledDate);
      const dateB = new Date(b.scheduledDate);
      
      // If both are in the past or both are in the future, sort by date
      if ((dateA < now && dateB < now) || (dateA >= now && dateB >= now)) {
        return dateA - dateB;
      }
      
      // If one is in the past and one is in the future, future comes first
      return dateA < now ? 1 : -1;
    });
    
    setFilteredInterviews(results);
  }, [interviews, searchTerm, statusFilter, timeframeFilter]);

  const handleInterviewCardClick = (interview) => {
    setSelectedInterview(interview);
    setShowInterviewModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <div className="alert alert-error max-w-md">
          <FiInfo className="w-6 h-6" />
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4">
      {/* Toast notification */}
      {notification.show && (
        <div className="toast toast-top toast-end z-50">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="bg-base-200 py-6 px-4 rounded-lg mb-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Interviews</h1>
          <p className="text-base-content/70">View and prepare for your upcoming interviews</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-base-200 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-base-content/50" />
              </div>
              <input
                type="text"
                placeholder="Search by job title or company..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Status filter */}
              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="No-Show">No-Show</option>
              </select>

              {/* Timeframe filter */}
              <select
                className="select select-bordered"
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value)}
              >
                <option value="all">All Timeframes</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>

          {/* Filter indicator */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-base-content/70">
              <FiFilter className="inline-block mr-2" />
              <span>{filteredInterviews.length} interviews found</span>
            </div>

            {/* Clear filters */}
            {(searchTerm || statusFilter !== 'all' || timeframeFilter !== 'all') && (
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTimeframeFilter('all');
                }}
              >
                Clear Filters <FiX className="ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interview listings */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterviews.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <FiCalendar className="mx-auto text-6xl text-base-content/20" />
              <h3 className="mt-4 text-lg font-medium">No interviews found</h3>
              <p className="text-base-content/60">
                {interviews.length === 0
                  ? "You don't have any scheduled interviews yet."
                  : "No interviews match your filter criteria."}
              </p>
            </div>
          ) : (
            filteredInterviews.map(interview => (
              <div 
                key={interview._id}
                className="card bg-base-200 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleInterviewCardClick(interview)}
              >
                <div className="card-body p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="card-title text-base-content">
                        {interview.interviewType} Interview
                      </h3>
                      <p className="text-sm text-base-content/70">
                        {interview.jobPostId?.jobTitle} at {interview.jobPostId?.company}
                      </p>
                    </div>
                    
                    <div>
                      <span className={`badge ${
                        interview.status === 'Scheduled' ? 'badge-primary' : 
                        interview.status === 'Completed' ? 'badge-success' :
                        interview.status === 'Cancelled' ? 'badge-error' : 'badge-secondary'
                      }`}>
                        {interview.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center text-base-content/80">
                      <FiCalendar className="mr-2 text-primary" />
                      <span>{formatDate(interview.scheduledDate)}</span>
                    </div>
                    
                    <div className="flex items-center text-base-content/80">
                      <FiClock className="mr-2 text-primary" />
                      <span>{formatTime(interview.scheduledDate)} ({interview.duration} min)</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    {interview.location && (
                      <div className="flex items-center text-base-content/80 mb-2">
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
                          Join video call
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {interview.attendees && interview.attendees.length > 0 && (
                    <div className="flex items-center text-xs text-base-content/60 mb-2">
                      <FiUsers className="mr-2" />
                      <span>With: {interview.attendees.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interview details modal */}
      {showInterviewModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {selectedInterview.interviewType} Interview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    <FiBriefcase className="text-primary" /> Job Details
                  </h3>
                  <div className="bg-base-200 p-4 rounded-md mt-2">
                    <p className="font-semibold">
                      {selectedInterview.jobPostId?.jobTitle}
                    </p>
                    <p className="text-base-content/70">
                      {selectedInterview.jobPostId?.company}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    <FiUser className="text-primary" /> Recruiter
                  </h3>
                  <div className="bg-base-200 p-4 rounded-md mt-2">
                    <p className="font-semibold">
                      {selectedInterview.recruiterId?.name || "Recruiter"}
                    </p>
                    <p className="text-base-content/70">
                      {selectedInterview.recruiterId?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    <FiCalendar className="text-primary" /> Schedule
                  </h3>
                  <div className="bg-base-200 p-4 rounded-md mt-2">
                    <p className="font-semibold">
                      {formatDate(selectedInterview.scheduledDate)}
                    </p>
                    <p className="text-base-content/70">
                      {formatTime(selectedInterview.scheduledDate)} 
                      {' '} ({selectedInterview.duration} minutes)
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    <FiMapPin className="text-primary" /> Location
                  </h3>
                  <div className="bg-base-200 p-4 rounded-md mt-2">
                    {selectedInterview.videoConferenceLink ? (
                      <>
                        <div className="flex items-center gap-2">
                          <FiVideo className="text-primary" />
                          <p>Virtual Interview</p>
                        </div>
                        <a
                          href={selectedInterview.videoConferenceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary mt-1 block break-all"
                        >
                          {selectedInterview.videoConferenceLink}
                        </a>
                      </>
                    ) : (
                      <p>{selectedInterview.location}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedInterview.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    <FiInfo className="text-primary" /> Description
                  </h3>
                  <div className="bg-base-200 p-4 rounded-md mt-2">
                    <p className="whitespace-pre-line">{selectedInterview.description}</p>
                  </div>
                </div>
              )}

              {selectedInterview.attendees && selectedInterview.attendees.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    <FiUsers className="text-primary" /> Attendees
                  </h3>
                  <div className="bg-base-200 p-4 rounded-md mt-2">
                    <ul className="list-disc pl-5">
                      {selectedInterview.attendees.map((attendee, index) => (
                        <li key={index}>{attendee}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="bg-base-200 p-4 rounded-md mb-6">
                <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                  <FiMessageSquare className="text-primary" /> Preparation Tips
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Research the company and position thoroughly</li>
                  <li>Prepare examples of relevant experience</li>
                  <li>Practice answering common interview questions</li>
                  <li>Prepare questions to ask the interviewer</li>
                  <li>Test your video conferencing setup in advance (if virtual)</li>
                  <li>Plan to arrive 10-15 minutes early (if in-person)</li>
                </ul>
              </div>

              <div className="mt-8 flex justify-end">
                {selectedInterview.status === 'Scheduled' && new Date(selectedInterview.scheduledDate) > new Date() && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (selectedInterview.videoConferenceLink) {
                        window.open(selectedInterview.videoConferenceLink, '_blank');
                      }
                      setShowInterviewModal(false);
                    }}
                  >
                    {selectedInterview.videoConferenceLink ? (
                      <>
                        <FiVideo className="mr-2" /> Join Meeting
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2" /> Confirm Attendance
                      </>
                    )}
                  </button>
                )}
                <button
                  className="btn btn-ghost ml-4"
                  onClick={() => setShowInterviewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateInterviews;