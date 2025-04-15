import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FiEye, FiBriefcase, FiUserCheck, FiTrash2 } from 'react-icons/fi';

const AdminApplicationManagement = () => {
  const { user } = useContext(UserContext);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [companies, setCompanies] = useState([]);

  // Define fetchApplications using useCallback to prevent dependency cycle
  const fetchApplications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/applications/all', {
        headers: { 'x-auth-token': user.token }
      });
      
      const appData = response.data;
      setApplications(appData);
      
      // Extract unique companies for filter
      const uniqueCompanies = [...new Set(appData
        .filter(app => app.jobPostId && app.jobPostId.company)
        .map(app => app.jobPostId.company))];
      
      setCompanies(uniqueCompanies);
      setFilteredApplications(appData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
      setLoading(false);
    }
  }, [user.token]);

  // Define filterApplications using useCallback
  const filterApplications = React.useCallback(() => {
    let filtered = applications;
    
    // Filter by status if not "All"
    if (statusFilter !== 'All') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Filter by company if not "All"
    if (companyFilter !== 'All') {
      filtered = filtered.filter(app => 
        app.jobPostId && app.jobPostId.company === companyFilter
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        (app.userId && app.userId.name && app.userId.name.toLowerCase().includes(term)) || 
        (app.jobPostId && app.jobPostId.jobTitle && app.jobPostId.jobTitle.toLowerCase().includes(term)) ||
        (app.jobPostId && app.jobPostId.company && app.jobPostId.company.toLowerCase().includes(term))
      );
    }
    
    setFilteredApplications(filtered);
  }, [applications, statusFilter, companyFilter, searchTerm]);

  useEffect(() => {
    // Check if user is admin
    if (user.role !== 'Administrator') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    fetchApplications();
  }, [user, fetchApplications]); // Added fetchApplications dependency

  // Filter applications when search term or filters change
  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, companyFilter, applications, filterApplications]); // Added filterApplications dependency

  const handleStatusClick = (application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setIsStatusModalOpen(true);
  };

  const handleDeleteClick = (application) => {
    setSelectedApplication(application);
    setIsDeleteModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${selectedApplication._id}/status`,
        { status: newStatus },
        { headers: { 'x-auth-token': user.token } }
      );
      
      // Update local state
      const updatedApplications = applications.map(app => 
        app._id === selectedApplication._id ? { ...app, status: newStatus } : app
      );
      
      setApplications(updatedApplications);
      setIsStatusModalOpen(false);
    } catch (err) {
      console.error('Error updating application status:', err);
      alert(`Error updating status: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/applications/${selectedApplication._id}`, {
        headers: { 'x-auth-token': user.token }
      });
      
      // Update local state
      const updatedApplications = applications.filter(app => app._id !== selectedApplication._id);
      setApplications(updatedApplications);
      
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting application:', err);
      alert(`Error deleting application: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        <h1 className="text-3xl font-bold">Application Management</h1>
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
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
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
              <span className="label-text">Search Applications</span>
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
          <span className="badge badge-lg">{filteredApplications.length} applications found</span>
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
                <th>Match Score</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      {app.userId && app.userId.name ? (
                        <div className="flex items-center gap-2">
                          <FiUserCheck className="text-secondary" />
                          <span>{app.userId.name}</span>
                        </div>
                      ) : (
                        <span className="italic text-opacity-60">Unknown Candidate</span>
                      )}
                    </td>
                    <td>
                      {app.jobPostId && app.jobPostId.jobTitle ? (
                        <div className="flex items-center gap-2">
                          <FiBriefcase className="text-primary" />
                          <span>{app.jobPostId.jobTitle}</span>
                        </div>
                      ) : (
                        <span className="italic text-opacity-60">Unknown Job</span>
                      )}
                    </td>
                    <td>
                      {app.jobPostId && app.jobPostId.company ? (
                        <span>{app.jobPostId.company}</span>
                      ) : (
                        <span className="italic text-opacity-60">Unknown</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span 
                          className={`badge ${
                            app.similarity >= 70 ? 'badge-success' :
                            app.similarity >= 40 ? 'badge-warning' :
                            'badge-error'
                          }`}
                        >
                          {app.similarity || 0}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`badge ${
                          app.status === 'Accepted' ? 'badge-success' :
                          app.status === 'Rejected' ? 'badge-error' :
                          'badge-warning'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td>{formatDate(app.appliedAt || app.createdAt)}</td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-xs btn-info"
                        onClick={() => handleStatusClick(app)}
                        title="Change Status"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn btn-xs btn-error"
                        onClick={() => handleDeleteClick(app)}
                        title="Delete Application"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">No applications found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isStatusModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Update Application Status</h2>
            <p className="mb-4">
              {selectedApplication.userId?.name || 'Candidate'}'s application for{' '}
              {selectedApplication.jobPostId?.jobTitle || 'job position'} at{' '}
              {selectedApplication.jobPostId?.company || 'company'}
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
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
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
                className={`btn ${newStatus === 'Accepted' ? 'btn-success' : newStatus === 'Rejected' ? 'btn-error' : 'btn-warning'}`}
                onClick={handleStatusChange}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p>
              Are you sure you want to delete the application from{' '}
              {selectedApplication.userId?.name || 'this candidate'} for{' '}
              {selectedApplication.jobPostId?.jobTitle || 'this position'}?
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

export default AdminApplicationManagement;