import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FiEye, FiBriefcase, FiUserCheck, FiCalendar, FiTrash2 } from 'react-icons/fi';

const AdminInterviewManagement = () => {
  const { user } = useContext(UserContext);
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [companies, setCompanies] = useState([]);

  // Define fetchInterviews using useCallback to prevent dependency cycle
  const fetchInterviews = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/interviews', {
        headers: { 'x-auth-token': user.token }
      });
      
      const interviewData = response.data;
      setInterviews(interviewData);
      
      // Extract unique companies for filter
      const uniqueCompanies = [...new Set(interviewData
        .filter(interview => interview.jobPostId && interview.jobPostId.company)
        .map(interview => interview.jobPostId.company))];
      
      setCompanies(uniqueCompanies);
      setFilteredInterviews(interviewData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to load interviews. Please try again.');
      setLoading(false);
    }
  }, [user.token]);

  // Define filterInterviews using useCallback
  const filterInterviews = React.useCallback(() => {
    let filtered = interviews;
    
    // Filter by status if not "All"
    if (statusFilter !== 'All') {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }
    
    // Filter by company if not "All"
    if (companyFilter !== 'All') {
      filtered = filtered.filter(interview => 
        interview.jobPostId && interview.jobPostId.company === companyFilter
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(interview => 
        (interview.candidateId && interview.candidateId.name && interview.candidateId.name.toLowerCase().includes(term)) || 
        (interview.jobPostId && interview.jobPostId.jobTitle && interview.jobPostId.jobTitle.toLowerCase().includes(term)) ||
        (interview.jobPostId && interview.jobPostId.company && interview.jobPostId.company.toLowerCase().includes(term))
      );
    }
    
    setFilteredInterviews(filtered);
  }, [interviews, statusFilter, companyFilter, searchTerm]);

  useEffect(() => {
    // Check if user is admin
    if (user.role !== 'Administrator') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    fetchInterviews();
  }, [user, fetchInterviews]);

  // Filter interviews when search term or filters change
  useEffect(() => {
    filterInterviews();
  }, [searchTerm, statusFilter, companyFilter, interviews, filterInterviews]);

  const handleStatusClick = (interview) => {
    setSelectedInterview(interview);
    setNewStatus(interview.status);
    setIsStatusModalOpen(true);
  };

  const handleDeleteClick = (interview) => {
    setSelectedInterview(interview);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/interviews/${selectedInterview._id}/status`,
        { status: newStatus },
        { headers: { 'x-auth-token': user.token } }
      );
      
      // Update local state
      const updatedInterviews = interviews.map(interview => 
        interview._id === selectedInterview._id ? { ...interview, status: newStatus } : interview
      );
      
      setInterviews(updatedInterviews);
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error('Error updating interview status:', err);
      alert(`Error updating status: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/interviews/${selectedInterview._id}`, {
        headers: { 'x-auth-token': user.token }
      });
      
      // Update local state
      const updatedInterviews = interviews.filter(interview => interview._id !== selectedInterview._id);
      setInterviews(updatedInterviews);
      
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting interview:', err);
      alert(`Error deleting interview: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 p-6">
        <div className="text-center text-error p-6 bg-base-200 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Interview Management</h1>
        <div className="flex gap-2">
          <Link to="/admin/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-base-200 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Status Filter</span>
            </label>
            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Canceled">Canceled</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Company Filter</span>
            </label>
            <select
              className="select select-bordered"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="All">All Companies</option>
              {companies.map((company, index) => (
                <option key={index} value={company}>{company}</option>
              ))}
            </select>
          </div>

          <div className="form-control flex-grow">
            <label className="label">
              <span className="label-text">Search Interviews</span>
            </label>
            <input
              type="text"
              placeholder="Search by candidate name, job title or company"
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <span className="badge badge-lg">{filteredInterviews.length} interviews found</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-200 rounded-lg shadow">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Interview Date</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.length > 0 ? (
                filteredInterviews.map((interview) => (
                  <tr key={interview._id}>
                    <td>
                      {interview.candidateId && interview.candidateId.name ? (
                        <div className="flex items-center gap-2">
                          <FiUserCheck className="text-secondary" />
                          <span>{interview.candidateId.name}</span>
                        </div>
                      ) : (
                        <span className="italic text-opacity-60">Unknown Candidate</span>
                      )}
                    </td>
                    <td>
                      {interview.jobPostId && interview.jobPostId.jobTitle ? (
                        <div className="flex items-center gap-2">
                          <FiBriefcase className="text-primary" />
                          <span>{interview.jobPostId.jobTitle}</span>
                        </div>
                      ) : (
                        <span className="italic text-opacity-60">Unknown Job</span>
                      )}
                    </td>
                    <td>
                      {interview.jobPostId && interview.jobPostId.company ? (
                        <span>{interview.jobPostId.company}</span>
                      ) : (
                        <span className="italic text-opacity-60">Unknown</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-info" />
                        <span>{formatDate(interview.scheduledDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {interview.interviewType || 'General'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`badge ${
                          interview.status === 'Completed' ? 'badge-success' :
                          interview.status === 'Scheduled' ? 'badge-info' :
                          interview.status === 'Canceled' ? 'badge-error' :
                          interview.status === 'Rescheduled' ? 'badge-warning' :
                          'badge-secondary'
                        }`}
                      >
                        {interview.status}
                      </span>
                    </td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-xs btn-info"
                        onClick={() => handleStatusClick(interview)}
                        title="Change Status"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDeleteClick(interview)}
                        title="Delete Interview"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">No interviews found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isStatusModalOpen && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Update Interview Status</h2>
            <p className="mb-4">
              {selectedInterview.candidateId?.name || 'Candidate'}'s interview for{' '}
              {selectedInterview.jobPostId?.jobTitle || 'job position'} at{' '}
              {selectedInterview.jobPostId?.company || 'company'}
            </p>
            
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Status</span>
              </label>
              <select
                className="select select-bordered"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="btn btn-ghost"
                onClick={() => setIsStatusModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={`btn ${
                  newStatus === 'Completed' ? 'btn-success' : 
                  newStatus === 'Canceled' ? 'btn-error' : 
                  newStatus === 'Scheduled' ? 'btn-info' :
                  newStatus === 'Rescheduled' ? 'btn-warning' :
                  'btn-secondary'
                }`}
                onClick={handleStatusChange}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete the interview for{' '}
              {selectedInterview.candidateId?.name || 'this candidate'} for the{' '}
              {selectedInterview.jobPostId?.jobTitle || 'this position'} position?
            </p>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="btn btn-ghost"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInterviewManagement;