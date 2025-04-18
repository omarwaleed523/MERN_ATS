import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, FiSearch, FiFilter, FiX, FiDownload,
  FiInfo, FiUsers, FiEdit, FiTrash2, FiCheckCircle, 
  FiXCircle, FiClock, FiRefreshCw, FiEye, FiUser
} from 'react-icons/fi';

const AdminInterviews = () => {
  const { user } = useContext(UserContext);
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // State for showing notifications
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    today: 0
  });

  // Fetch interviews
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/interviews', {
          headers: { 'x-auth-token': user.token }
        });
        
        const data = response.data;
        setInterviews(data);
        setFilteredInterviews(data);
        
        // Calculate stats
        const now = new Date();
        const today = now.toDateString();
        
        const statsData = {
          total: data.length,
          upcoming: data.filter(interview => new Date(interview.scheduledDate) > now).length,
          completed: data.filter(interview => interview.status === 'Completed').length,
          cancelled: data.filter(interview => interview.status === 'Cancelled').length,
          today: data.filter(interview => new Date(interview.scheduledDate).toDateString() === today).length
        };
        
        setStats(statsData);
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
        const candidateName = interview.candidateId?.name?.toLowerCase() || '';
        const recruiterName = interview.recruiterId?.name?.toLowerCase() || '';
        const jobTitle = interview.jobPostId?.jobTitle?.toLowerCase() || '';
        const company = interview.jobPostId?.company?.toLowerCase() || '';
        
        return candidateName.includes(term) || 
               recruiterName.includes(term) || 
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
      const weekStart = new Date(now);
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
    
    // Sort interviews by date
    results.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    
    setFilteredInterviews(results);
  }, [interviews, searchTerm, statusFilter, typeFilter, timeframeFilter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'badge-primary';
      case 'Completed':
        return 'badge-success';
      case 'Cancelled':
        return 'badge-error';
      case 'Rescheduled':
        return 'badge-warning';
      case 'No-Show':
        return 'badge-error';
      default:
        return 'badge';
    }
  };

  const getInterviewTypeClass = (type) => {
    switch (type) {
      case 'Phone Screening':
        return 'badge-info';
      case 'Technical':
        return 'badge-secondary';
      case 'HR':
        return 'badge-primary';
      case 'Hiring Manager':
        return 'badge-accent';
      case 'Team':
        return 'badge-warning';
      case 'Final':
        return 'badge-success';
      default:
        return 'badge-outline';
    }
  };

  const handleShowDetails = (interview) => {
    setSelectedInterview(interview);
    setShowDetailsModal(true);
  };

  const handleShowStatusModal = (interview) => {
    setSelectedInterview(interview);
    setNewStatus(interview.status);
    setShowStatusModal(true);
  };

  const handleShowDeleteModal = (interview) => {
    setSelectedInterview(interview);
    setShowDeleteModal(true);
  };

  const handleStatusChange = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/interviews/${selectedInterview._id}`,
        { status: newStatus },
        { headers: { 'x-auth-token': user.token } }
      );
      
      // Update interviews state
      setInterviews(interviews.map(interview => 
        interview._id === selectedInterview._id 
          ? { ...interview, status: newStatus } 
          : interview
      ));
      
      setShowStatusModal(false);
      setSelectedInterview(null);
      
      setNotification({
        show: true,
        message: `Interview status updated to ${newStatus}`,
        type: 'success'
      });
      
      setTimeout(() => {
        setNotification({ show: false });
      }, 3000);
      
    } catch (error) {
      console.error('Error updating interview status:', error);
      
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Error updating interview status',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({ show: false });
      }, 3000);
    }
  };

  const handleDeleteInterview = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/interviews/${selectedInterview._id}`,
        { headers: { 'x-auth-token': user.token } }
      );
      
      // Update interviews state
      setInterviews(interviews.filter(interview => 
        interview._id !== selectedInterview._id
      ));
      
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

  const exportToCSV = () => {
    const headers = [
      'Candidate',
      'Recruiter',
      'Job Title',
      'Company',
      'Type',
      'Date',
      'Time',
      'Duration',
      'Location',
      'Status'
    ];
    
    const rows = filteredInterviews.map(interview => [
      interview.candidateId?.name || 'Unknown',
      interview.recruiterId?.name || 'Unknown',
      interview.jobPostId?.jobTitle || 'Unknown',
      interview.jobPostId?.company || 'Unknown',
      interview.interviewType,
      formatDate(interview.scheduledDate),
      formatTime(interview.scheduledDate),
      `${interview.duration} min`,
      interview.videoConferenceLink ? 'Virtual' : interview.location,
      interview.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `interviews_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Interview Administration</h1>
              <p className="text-base-content/70">Manage and monitor all interviews across the system</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="btn btn-outline btn-primary"
                onClick={exportToCSV}
              >
                <FiDownload className="mr-2" /> Export CSV
              </button>
              <Link to="/admin/dashboard" className="btn btn-ghost">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <FiCalendar size={24} />
              </div>
              <div className="stat-title">Total</div>
              <div className="stat-value text-primary">{stats.total}</div>
              <div className="stat-desc">All interviews</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-info">
                <FiClock size={24} />
              </div>
              <div className="stat-title">Upcoming</div>
              <div className="stat-value text-info">{stats.upcoming}</div>
              <div className="stat-desc">Future interviews</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-success">
                <FiCheckCircle size={24} />
              </div>
              <div className="stat-title">Completed</div>
              <div className="stat-value text-success">{stats.completed}</div>
              <div className="stat-desc">Finished interviews</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-error">
                <FiXCircle size={24} />
              </div>
              <div className="stat-title">Cancelled</div>
              <div className="stat-value text-error">{stats.cancelled}</div>
              <div className="stat-desc">Cancelled interviews</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-accent">
                <FiCalendar size={24} />
              </div>
              <div className="stat-title">Today</div>
              <div className="stat-value text-accent">{stats.today}</div>
              <div className="stat-desc">Interviews today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and search bar */}
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
                placeholder="Search candidate, recruiter, job title..."
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

      {/* Interviews table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-base-200 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-16">
                <FiCalendar className="mx-auto text-6xl text-base-content/20" />
                <h3 className="mt-4 text-lg font-medium">No interviews found</h3>
                <p className="text-base-content/60">
                  {interviews.length === 0
                    ? "There are no interviews in the system."
                    : "No interviews match your filter criteria."}
                </p>
              </div>
            ) : (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Candidate / Recruiter</th>
                    <th>Job Details</th>
                    <th>Interview Type</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map(interview => (
                    <tr key={interview._id} className="hover">
                      <td>
                        <div className="flex flex-col">
                          <div className="font-medium flex items-center gap-1">
                            <FiUser className="text-primary" />
                            {interview.candidateId?.name || 'Unknown Candidate'}
                          </div>
                          <div className="text-sm text-base-content/60 flex items-center gap-1">
                            <FiUsers className="text-secondary" />
                            {interview.recruiterId?.name || 'Unknown Recruiter'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium">{interview.jobPostId?.jobTitle || 'Unknown Job'}</div>
                        <div className="text-sm text-base-content/60">{interview.jobPostId?.company || 'Unknown Company'}</div>
                      </td>
                      <td>
                        <span className={`badge ${getInterviewTypeClass(interview.interviewType)}`}>
                          {interview.interviewType}
                        </span>
                      </td>
                      <td>
                        <div>{formatDate(interview.scheduledDate)}</div>
                        <div className="text-sm text-base-content/60">
                          {formatTime(interview.scheduledDate)} ({interview.duration} min)
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(interview.status)}`}>
                          {interview.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShowDetails(interview)}
                            className="btn btn-xs btn-ghost"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <button
                            onClick={() => handleShowStatusModal(interview)}
                            className="btn btn-xs btn-ghost btn-info"
                            title="Change Status"
                          >
                            <FiRefreshCw />
                          </button>
                          <button
                            onClick={() => handleShowDeleteModal(interview)}
                            className="btn btn-xs btn-ghost btn-error"
                            title="Delete Interview"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Interview details modal */}
      {showDetailsModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {selectedInterview.interviewType} Interview Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Job Details</h3>
                  <div className="bg-base-200 p-4 rounded-md">
                    <p className="font-semibold">
                      {selectedInterview.jobPostId?.jobTitle || 'Unknown Job'}
                    </p>
                    <p className="text-base-content/70">
                      {selectedInterview.jobPostId?.company || 'Unknown Company'}
                    </p>
                    <div className="mt-2">
                      <Link
                        to={`/admin/jobposts/${selectedInterview.jobPostId?._id}`}
                        className="link link-primary text-sm"
                      >
                        View Job Post
                      </Link>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Schedule</h3>
                  <div className="bg-base-200 p-4 rounded-md">
                    <p className="font-medium">
                      {formatDate(selectedInterview.scheduledDate)}
                    </p>
                    <p className="text-base-content/70">
                      {formatTime(selectedInterview.scheduledDate)} 
                      ({selectedInterview.duration} minutes)
                    </p>
                    <p className="mt-2">
                      {selectedInterview.videoConferenceLink ? (
                        <>
                          <span className="font-medium">Virtual:</span>{' '}
                          <a
                            href={selectedInterview.videoConferenceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary"
                          >
                            {selectedInterview.videoConferenceLink}
                          </a>
                        </>
                      ) : (
                        <>
                          <span className="font-medium">Location:</span>{' '}
                          {selectedInterview.location}
                        </>
                      )}
                    </p>
                    <div className="mt-2">
                      <span className={`badge ${getStatusClass(selectedInterview.status)}`}>
                        {selectedInterview.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Candidate</h3>
                  <div className="bg-base-200 p-4 rounded-md">
                    <p className="font-semibold">
                      {selectedInterview.candidateId?.name || 'Unknown Candidate'}
                    </p>
                    <p className="text-base-content/70">
                      {selectedInterview.candidateId?.email || 'No email available'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Recruiter</h3>
                  <div className="bg-base-200 p-4 rounded-md">
                    <p className="font-semibold">
                      {selectedInterview.recruiterId?.name || 'Unknown Recruiter'}
                    </p>
                    <p className="text-base-content/70">
                      {selectedInterview.recruiterId?.email || 'No email available'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedInterview.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <div className="bg-base-200 p-4 rounded-md">
                    <p className="whitespace-pre-line">{selectedInterview.description}</p>
                  </div>
                </div>
              )}

              {selectedInterview.attendees && selectedInterview.attendees.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Attendees</h3>
                  <div className="bg-base-200 p-4 rounded-md">
                    <ul className="list-disc pl-5">
                      {selectedInterview.attendees.map((attendee, index) => (
                        <li key={index}>{attendee}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {selectedInterview.feedback && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Feedback</h3>
                  <div className="bg-base-200 p-4 rounded-md">
                    {selectedInterview.feedback.rating && (
                      <div className="mb-2">
                        <span className="font-medium">Rating: </span>
                        <div className="rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <input
                              key={star}
                              type="radio"
                              name="rating"
                              className={`mask mask-star-2 ${star <= selectedInterview.feedback.rating ? 'bg-orange-400' : 'bg-gray-300'}`}
                              checked={star === selectedInterview.feedback.rating}
                              readOnly
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedInterview.feedback.strengths && (
                      <div className="mb-2">
                        <p className="font-medium">Strengths:</p>
                        <p>{selectedInterview.feedback.strengths}</p>
                      </div>
                    )}
                    
                    {selectedInterview.feedback.weaknesses && (
                      <div className="mb-2">
                        <p className="font-medium">Areas for Improvement:</p>
                        <p>{selectedInterview.feedback.weaknesses}</p>
                      </div>
                    )}
                    
                    {selectedInterview.feedback.notes && (
                      <div className="mb-2">
                        <p className="font-medium">Notes:</p>
                        <p>{selectedInterview.feedback.notes}</p>
                      </div>
                    )}
                    
                    {selectedInterview.feedback.decision && (
                      <div className="mt-4">
                        <p className="font-medium">Decision:</p>
                        <span className={`badge ${
                          selectedInterview.feedback.decision === 'Proceed' ? 'badge-success' :
                          selectedInterview.feedback.decision === 'Reject' ? 'badge-error' :
                          selectedInterview.feedback.decision === 'On Hold' ? 'badge-warning' :
                          'badge-info'
                        }`}>
                          {selectedInterview.feedback.decision}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-4">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
                <button
                  className="btn btn-outline btn-error"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleShowDeleteModal(selectedInterview);
                  }}
                >
                  <FiTrash2 className="mr-2" /> Delete
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleShowStatusModal(selectedInterview);
                  }}
                >
                  <FiEdit className="mr-2" /> Change Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status change modal */}
      {showStatusModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Update Interview Status</h2>
            <p className="mb-4">
              Change the status for {selectedInterview.candidateId?.name}'s {selectedInterview.interviewType} interview 
              for {selectedInterview.jobPostId?.jobTitle} at {selectedInterview.jobPostId?.company}.
            </p>
            
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>
            
            <div className="mt-6 flex justify-end gap-4">
              <button
                className="btn btn-ghost"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleStatusChange}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-2">
              Are you sure you want to delete the {selectedInterview.interviewType} interview for {selectedInterview.candidateId?.name}?
            </p>
            <p className="text-sm text-base-content/70">
              This action cannot be undone.
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

export default AdminInterviews;