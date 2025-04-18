import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import InterviewCard from '../Components/InterviewCard';
import { useLocation } from 'react-router-dom';
import { 
  FiCalendar, FiPlus, FiFilter, FiSearch, FiX, FiSave, 
  FiChevronDown, FiCheck, FiClock, FiEdit, FiTrash2, 
  FiUser, FiBriefcase, FiUsers, FiMapPin, FiVideo, FiInfo
} from 'react-icons/fi';

const RecruiterInterviews = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  
  // Modal states
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  
  // Form data for creating/editing interviews
  const [formData, setFormData] = useState({
    applicationId: '',
    interviewType: 'Phone Screening',
    scheduledDate: '',
    scheduledTime: '09:00',
    duration: 30,
    location: '',
    description: '',
    attendees: '',
    videoConferenceLink: ''
  });
  
  // State for showing notifications
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });
  
  // State for applications dropdown
  const [applications, setApplications] = useState([]);
  
  // Format date for datetime-local input
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Format time for time input
  const formatTimeForInput = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/interviews', {
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

  // Fetch applications for the recruiter
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // First, get job posts created by this recruiter
        const jobPostsResponse = await axios.get(`http://localhost:5000/api/jobposts?userId=${user.userId}`, {
          headers: { 'x-auth-token': user.token }
        });
        
        if (jobPostsResponse.data.length === 0) return;
        
        // Then get applications for these job posts
        const applicationsResponse = await axios.get('http://localhost:5000/api/applications', {
          headers: { 'x-auth-token': user.token }
        });
        
        // Filter applications to get only those for jobs created by this recruiter
        const jobIds = jobPostsResponse.data.map(job => job._id);
        const filteredApps = applicationsResponse.data.filter(
          app => app.jobPostId && jobIds.includes(app.jobPostId._id)
        );
        
        setApplications(filteredApps);
      } catch (err) {
        console.error('Error fetching applications:', err);
      }
    };
    
    if (user && user.token) {
      fetchApplications();
    }
  }, [user]);

  // Check for applicationId passed from RecruiterApplication page
  useEffect(() => {
    if (location.state?.applicationId && applications.length > 0) {
      // If an applicationId was passed via navigation state, open the interview modal with that application selected
      const selectedApplication = applications.find(app => app._id === location.state.applicationId);
      if (selectedApplication) {
        handleOpenInterviewModal(selectedApplication);
      }
    }
  }, [location.state, applications]);

  // Apply filters when they change
  useEffect(() => {
    if (!interviews.length) return;
    
    let results = [...interviews];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(interview => {
        const candidateName = interview.candidateId?.name?.toLowerCase() || '';
        const jobTitle = interview.jobPostId?.jobTitle?.toLowerCase() || '';
        const company = interview.jobPostId?.company?.toLowerCase() || '';
        
        return candidateName.includes(term) || 
               jobTitle.includes(term) || 
               company.includes(term);
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(interview => interview.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      results = results.filter(interview => interview.interviewType === typeFilter);
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
  }, [interviews, searchTerm, statusFilter, typeFilter, timeframeFilter]);

  const handleOpenInterviewModal = (application = null) => {
    if (application) {
      setFormData({
        ...formData,
        applicationId: application._id
      });
    } else {
      setFormData({
        applicationId: '',
        interviewType: 'Phone Screening',
        scheduledDate: formatDateForInput(new Date()),
        scheduledTime: '09:00',
        duration: 30,
        location: '',
        description: '',
        attendees: '',
        videoConferenceLink: ''
      });
    }
    setShowInterviewModal(true);
  };

  const handleInterviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      // Format attendees
      const attendeesArray = formData.attendees
        ? formData.attendees.split(',').map(a => a.trim()).filter(a => a)
        : [];
      
      const interviewData = {
        applicationId: formData.applicationId,
        interviewType: formData.interviewType,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: formData.duration,
        location: formData.location,
        description: formData.description,
        attendees: attendeesArray,
        videoConferenceLink: formData.videoConferenceLink
      };
      
      const response = await axios.post('http://localhost:5000/api/interviews', 
        interviewData,
        { headers: { 'x-auth-token': user.token } }
      );
      
      setInterviews([...interviews, response.data]);
      setShowInterviewModal(false);
      setNotification({
        show: true,
        message: 'Interview scheduled successfully',
        type: 'success'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false });
      }, 3000);
      
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Error scheduling interview',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({ show: false });
      }, 3000);
    }
  };

  const handleEditInterview = async () => {
    if (!selectedInterview) return;
    
    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      // Format attendees
      const attendeesArray = formData.attendees
        ? formData.attendees.split(',').map(a => a.trim()).filter(a => a)
        : [];
      
      const interviewData = {
        interviewType: formData.interviewType,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: formData.duration,
        location: formData.location,
        description: formData.description,
        attendees: attendeesArray,
        videoConferenceLink: formData.videoConferenceLink
      };
      
      const response = await axios.put(
        `http://localhost:5000/api/interviews/${selectedInterview._id}`,
        interviewData,
        { headers: { 'x-auth-token': user.token } }
      );
      
      // Update interviews state
      setInterviews(interviews.map(interview => 
        interview._id === selectedInterview._id ? response.data : interview
      ));
      
      setShowEditModal(false);
      setSelectedInterview(null);
      
      setNotification({
        show: true,
        message: 'Interview updated successfully',
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification({ show: false });
      }, 3000);
      
    } catch (error) {
      console.error('Error updating interview:', error);
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Error updating interview',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({ show: false });
      }, 3000);
    }
  };

  const handleDeleteInterview = async () => {
    if (!selectedInterview) return;
    
    try {
      // Include the x-auth-token in the headers
      await axios.delete(
        `http://localhost:5000/api/interviews/${selectedInterview._id}`,
        { 
          headers: { 
            'x-auth-token': user.token,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Update local state to remove the deleted interview
      setInterviews(interviews.filter(interview => interview._id !== selectedInterview._id));
      setFilteredInterviews(filteredInterviews.filter(interview => interview._id !== selectedInterview._id));
      setShowDeleteModal(false);
      setSelectedInterview(null);
      
      setNotification({
        show: true,
        message: 'Interview deleted successfully',
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification({ show: false });
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting interview:', error);
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Error deleting interview',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({ show: false });
      }, 3000);
    }
  };

  const handleInterviewCardClick = (interview) => {
    setSelectedInterview(interview);
  };

  const openEditModal = (interview) => {
    setSelectedInterview(interview);
    setFormData({
      applicationId: interview.applicationId._id,
      interviewType: interview.interviewType,
      scheduledDate: formatDateForInput(interview.scheduledDate),
      scheduledTime: formatTimeForInput(interview.scheduledDate),
      duration: interview.duration,
      location: interview.location,
      description: interview.description || '',
      attendees: interview.attendees ? interview.attendees.join(', ') : '',
      videoConferenceLink: interview.videoConferenceLink || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (interview) => {
    setSelectedInterview(interview);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
          <h1 className="text-3xl font-bold mb-2">Interview Management</h1>
          <p className="text-base-content/70">Schedule, track, and manage candidate interviews</p>
        </div>
      </div>

      {/* Filter and action bar */}
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
                placeholder="Search candidate name, job title..."
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

              {/* Type filter */}
              <select
                className="select select-bordered"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Phone Screening">Phone Screening</option>
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Hiring Manager">Hiring Manager</option>
                <option value="Team">Team</option>
                <option value="Final">Final</option>
                <option value="Other">Other</option>
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

            {/* Schedule button */}
            <button
              className="btn btn-primary"
              onClick={() => handleOpenInterviewModal()}
            >
              <FiPlus className="mr-2" /> Schedule Interview
            </button>
          </div>

          {/* Filter indicator */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-base-content/70">
              <FiFilter className="inline-block mr-2" />
              <span>{filteredInterviews.length} interviews found</span>
            </div>

            {/* Clear filters */}
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || timeframeFilter !== 'all') && (
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
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
                  ? "You haven't scheduled any interviews yet."
                  : "No interviews match your filter criteria."}
              </p>
              {interviews.length === 0 && (
                <button
                  className="btn btn-primary mt-4"
                  onClick={() => handleOpenInterviewModal()}
                >
                  <FiPlus className="mr-2" /> Schedule Your First Interview
                </button>
              )}
            </div>
          ) : (
            filteredInterviews.map(interview => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                userRole="Recruiter"
                onClick={() => handleInterviewCardClick(interview)}
                onEdit={() => openEditModal(interview)}
                onDelete={() => openDeleteModal(interview)}
              />
            ))
          )}
        </div>
      </div>

      {/* Interview details modal */}
      {selectedInterview && (
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
                    <FiUser className="text-primary" /> Candidate
                  </h3>
                  <div className="bg-base-200 p-4 rounded-md mt-2">
                    <p className="font-semibold">
                      {selectedInterview.candidateId?.name}
                    </p>
                    <p className="text-base-content/70">
                      {selectedInterview.candidateId?.email}
                    </p>
                    <div className="mt-2">
                      <a
                        href={`/applications/${selectedInterview.applicationId?._id}`}
                        className="link link-primary text-sm"
                      >
                        View Application
                      </a>
                    </div>
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
                      {new Date(selectedInterview.scheduledDate).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-base-content/70">
                      {new Date(selectedInterview.scheduledDate).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} 
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

              <div className="mt-8 flex justify-end gap-4">
                <button
                  className="btn btn-ghost"
                  onClick={() => setSelectedInterview(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-outline btn-error"
                  onClick={() => openDeleteModal(selectedInterview)}
                >
                  <FiTrash2 className="mr-2" /> Delete
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => openEditModal(selectedInterview)}
                >
                  <FiEdit className="mr-2" /> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create interview modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Schedule New Interview</h2>
              <form onSubmit={handleInterviewSubmit}>
                {/* Application selection */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Select Application</span>
                    <span className="label-text-alt text-error">*</span>
                  </label>
                  <select
                    name="applicationId"
                    className="select select-bordered w-full"
                    value={formData.applicationId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled>Select an application</option>
                    {applications.map(app => (
                      <option key={app._id} value={app._id}>
                        {app.userId?.name || 'Unnamed'} - {app.jobPostId?.jobTitle || 'Unknown Position'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Interview type */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Interview Type</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <select
                      name="interviewType"
                      className="select select-bordered w-full"
                      value={formData.interviewType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Phone Screening">Phone Screening</option>
                      <option value="Technical">Technical</option>
                      <option value="HR">HR</option>
                      <option value="Hiring Manager">Hiring Manager</option>
                      <option value="Team">Team</option>
                      <option value="Final">Final</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Duration (minutes)</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <select
                      name="duration"
                      className="select select-bordered w-full"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Date */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Date</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      className="input input-bordered w-full"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Time */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Time</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="time"
                      name="scheduledTime"
                      className="input input-bordered w-full"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Location type tabs */}
                <div className="tabs tabs-boxed bg-base-200 mt-6">
                  <a 
                    className={`tab ${!formData.videoConferenceLink ? 'tab-active' : ''}`}
                    onClick={() => setFormData({
                      ...formData,
                      videoConferenceLink: '',
                      location: formData.location || 'Office'
                    })}
                  >
                    <FiMapPin className="mr-2" /> Physical Location
                  </a>
                  <a 
                    className={`tab ${formData.videoConferenceLink ? 'tab-active' : ''}`}
                    onClick={() => setFormData({
                      ...formData,
                      location: '',
                      videoConferenceLink: formData.videoConferenceLink || 'https://'
                    })}
                  >
                    <FiVideo className="mr-2" /> Virtual Meeting
                  </a>
                </div>

                {formData.videoConferenceLink ? (
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Video Conference Link</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="url"
                      name="videoConferenceLink"
                      className="input input-bordered w-full"
                      placeholder="https://meet.google.com/..."
                      value={formData.videoConferenceLink}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Location</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="input input-bordered w-full"
                      placeholder="Office, Room 302"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                {/* Description */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Description (Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    className="textarea textarea-bordered h-24"
                    placeholder="Add details about the interview..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                {/* Attendees */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Attendees (Optional)</span>
                    <span className="label-text-alt">Comma separated</span>
                  </label>
                  <input
                    type="text"
                    name="attendees"
                    className="input input-bordered w-full"
                    placeholder="John Doe, Jane Smith"
                    value={formData.attendees}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Submit buttons */}
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowInterviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FiCalendar className="mr-2" /> Schedule Interview
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit interview modal */}
      {showEditModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Edit Interview</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleEditInterview();
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Interview type */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Interview Type</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <select
                      name="interviewType"
                      className="select select-bordered w-full"
                      value={formData.interviewType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Phone Screening">Phone Screening</option>
                      <option value="Technical">Technical</option>
                      <option value="HR">HR</option>
                      <option value="Hiring Manager">Hiring Manager</option>
                      <option value="Team">Team</option>
                      <option value="Final">Final</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Duration */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Duration (minutes)</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <select
                      name="duration"
                      className="select select-bordered w-full"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Date */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Date</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      className="input input-bordered w-full"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Time */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Time</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="time"
                      name="scheduledTime"
                      className="input input-bordered w-full"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Location type tabs */}
                <div className="tabs tabs-boxed bg-base-200 mt-6">
                  <a 
                    className={`tab ${!formData.videoConferenceLink ? 'tab-active' : ''}`}
                    onClick={() => setFormData({
                      ...formData,
                      videoConferenceLink: '',
                      location: formData.location || 'Office'
                    })}
                  >
                    <FiMapPin className="mr-2" /> Physical Location
                  </a>
                  <a 
                    className={`tab ${formData.videoConferenceLink ? 'tab-active' : ''}`}
                    onClick={() => setFormData({
                      ...formData,
                      location: '',
                      videoConferenceLink: formData.videoConferenceLink || 'https://'
                    })}
                  >
                    <FiVideo className="mr-2" /> Virtual Meeting
                  </a>
                </div>

                {formData.videoConferenceLink ? (
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Video Conference Link</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="url"
                      name="videoConferenceLink"
                      className="input input-bordered w-full"
                      placeholder="https://meet.google.com/..."
                      value={formData.videoConferenceLink}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ) : (
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Location</span>
                      <span className="label-text-alt text-error">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      className="input input-bordered w-full"
                      placeholder="Office, Room 302"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}

                {/* Description */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Description (Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    className="textarea textarea-bordered h-24"
                    placeholder="Add details about the interview..."
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                {/* Attendees */}
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Attendees (Optional)</span>
                    <span className="label-text-alt">Comma separated</span>
                  </label>
                  <input
                    type="text"
                    name="attendees"
                    className="input input-bordered w-full"
                    placeholder="John Doe, Jane Smith"
                    value={formData.attendees}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Submit buttons */}
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FiSave className="mr-2" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete this interview? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteInterview}
              >
                Delete Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviews;