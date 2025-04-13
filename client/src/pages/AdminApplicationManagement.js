import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FiEye, FiBriefcase, FiUserCheck, FiTrash2, FiEdit, FiPlus } from 'react-icons/fi';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [companies, setCompanies] = useState([]);
  const [processingMatches, setProcessingMatches] = useState(false);
  
  // For create/edit modals
  const [availableUsers, setAvailableUsers] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [availableResumes, setAvailableResumes] = useState([]);
  
  const [formData, setFormData] = useState({
    userId: '',
    resumeId: '',
    jobPostId: '',
    status: 'Pending',
    similarity: 0
  });

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
  
  // Fetch data for create/edit dropdowns
  const fetchRelatedData = React.useCallback(async () => {
    try {
      // Fetch candidates (users with role Candidate)
      const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { 'x-auth-token': user.token }
      });
      const candidates = usersResponse.data.filter(user => user.role === 'Candidate');
      setAvailableUsers(candidates);
      
      // Fetch job posts
      const jobsResponse = await axios.get('http://localhost:5000/api/jobposts', {
        headers: { 'x-auth-token': user.token }
      });
      setAvailableJobs(jobsResponse.data);
      
      // Fetch resumes
      const resumesResponse = await axios.get('http://localhost:5000/api/resumes', {
        headers: { 'x-auth-token': user.token }
      });
      setAvailableResumes(resumesResponse.data);
    } catch (err) {
      console.error('Error fetching related data:', err);
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
    fetchRelatedData();
  }, [user, fetchApplications, fetchRelatedData]); 

  // Filter applications when search term or filters change
  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, companyFilter, applications, filterApplications]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'similarity' ? parseInt(value) || 0 : value
    });
  };
  
  const handleCreateClick = () => {
    // Reset form data
    setFormData({
      userId: availableUsers.length > 0 ? availableUsers[0]._id : '',
      resumeId: availableResumes.length > 0 ? availableResumes[0]._id : '',
      jobPostId: availableJobs.length > 0 ? availableJobs[0]._id : '',
      status: 'Pending',
      similarity: 0
    });
    setIsCreateModalOpen(true);
  };
  
  const handleEditClick = (application) => {
    setSelectedApplication(application);
    setFormData({
      userId: application.userId?._id || '',
      resumeId: application.resumeId?._id || '',
      jobPostId: application.jobPostId?._id || '',
      status: application.status,
      similarity: application.similarity || 0
    });
    setIsEditModalOpen(true);
  };

  const handleStatusClick = (application) => {
    setSelectedApplication(application);
    setNewStatus(application.status);
    setIsStatusModalOpen(true);
  };

  const handleDeleteClick = (application) => {
    setSelectedApplication(application);
    setIsDeleteModalOpen(true);
  };
  
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the job post and resume details to extract text for matching
      const jobPost = await axios.get(`http://localhost:5000/api/jobposts/${formData.jobPostId}`, {
        headers: { 'x-auth-token': user.token }
      });
      
      const resume = await axios.get(`http://localhost:5000/api/resumes/${formData.resumeId}`, {
        headers: { 'x-auth-token': user.token }
      });
      
      const newApplication = {
        ...formData,
        jobDescriptionText: jobPost.data.jobDescription,
        resumeText: resume.data.ResumeText
      };
      
      const response = await axios.post(
        'http://localhost:5000/api/applications/apply', 
        newApplication,
        { headers: { 'x-auth-token': user.token } }
      );
      
      // Add the new application to the applications list
      fetchApplications(); // Refetch to get populated data
      
      setIsCreateModalOpen(false);
      alert('Application created successfully');
    } catch (err) {
      console.error('Error creating application:', err);
      alert(`Error creating application: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update application status and similarity score
      const response = await axios.put(
        `http://localhost:5000/api/applications/${selectedApplication._id}/status`,
        { 
          status: formData.status,
          similarity: formData.similarity
        },
        { headers: { 'x-auth-token': user.token } }
      );
      
      // Update the application in the local state
      const updatedApplications = applications.map(app => 
        app._id === selectedApplication._id ? { ...app, status: formData.status, similarity: formData.similarity } : app
      );
      setApplications(updatedApplications);
      
      setIsEditModalOpen(false);
      alert('Application updated successfully');
    } catch (err) {
      console.error('Error updating application:', err);
      alert(`Error updating application: ${err.response?.data?.message || 'Unknown error'}`);
    }
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
  
  const processAIMatching = async () => {
    try {
      setProcessingMatches(true);
      const response = await axios.post(
        'http://localhost:5000/api/applications/process-matching',
        {},
        { headers: { 'x-auth-token': user.token } }
      );
      
      alert(`${response.data.count} application(s) processed. Similarity scores updated!`);
      // Refresh applications to get updated scores
      fetchApplications();
    } catch (err) {
      console.error('Error processing AI matching:', err);
      alert(`Error processing AI matching: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setProcessingMatches(false);
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
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Application Management</h1>
        <div className="flex gap-2">
          <button
            onClick={handleCreateClick}
            className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none"
          >
            <FiPlus className="mr-1" /> Create Application
          </button>
          <button
            onClick={processAIMatching}
            disabled={processingMatches}
            className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none"
          >
            {processingMatches ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <>Process AI Matching</>
            )}
          </button>
          <Link to="/admin/dashboard" className="btn bg-sky-600 hover:bg-sky-700 text-white border-none">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-300">Status Filter</span>
            </label>
            <select
              className="select bg-gray-700 border-gray-600 text-white"
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
              <span className="label-text text-gray-300">Company Filter</span>
            </label>
            <select
              className="select bg-gray-700 border-gray-600 text-white"
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
              <span className="label-text text-gray-300">Search Applications</span>
            </label>
            <input
              type="text"
              placeholder="Search by candidate name, job title or company"
              className="input bg-gray-700 border-gray-600 text-white w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <span className="badge bg-indigo-600 text-white">{filteredApplications.length} applications found</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow border border-gray-700">
          <table className="table w-full bg-gray-800 text-white">
            <thead className="text-gray-300 bg-gray-700">
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
                  <tr key={app._id} className="border-b border-gray-700">
                    <td>
                      {app.userId && app.userId.name ? (
                        <div className="flex items-center gap-2">
                          <FiUserCheck className="text-blue-400" />
                          <span className="text-white">{app.userId.name}</span>
                        </div>
                      ) : (
                        <span className="italic text-gray-400">Unknown Candidate</span>
                      )}
                    </td>
                    <td>
                      {app.jobPostId && app.jobPostId.jobTitle ? (
                        <div className="flex items-center gap-2">
                          <FiBriefcase className="text-indigo-400" />
                          <span className="text-white">{app.jobPostId.jobTitle}</span>
                        </div>
                      ) : (
                        <span className="italic text-gray-400">Unknown Job</span>
                      )}
                    </td>
                    <td className="text-gray-300">
                      {app.jobPostId && app.jobPostId.company ? (
                        <span>{app.jobPostId.company}</span>
                      ) : (
                        <span className="italic text-gray-400">Unknown</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <span 
                          className={`badge ${
                            app.similarity >= 70 ? 'bg-green-600' :
                            app.similarity >= 40 ? 'bg-yellow-600' :
                            'bg-red-600'
                          } text-white`}
                        >
                          {app.similarity || 0}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`badge ${
                          app.status === 'Accepted' ? 'bg-green-600' :
                          app.status === 'Rejected' ? 'bg-red-600' :
                          'bg-yellow-600'
                        } text-white`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="text-gray-300">{formatDate(app.appliedAt || app.createdAt)}</td>
                    <td className="flex gap-2">
                      <button
                        className="btn btn-xs bg-blue-600 hover:bg-blue-700 text-white border-none"
                        onClick={() => handleStatusClick(app)}
                        title="Change Status"
                      >
                        <FiEye />
                      </button>
                      <button
                        className="btn btn-xs bg-amber-600 hover:bg-amber-700 text-white border-none"
                        onClick={() => handleEditClick(app)}
                        title="Edit Application"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn btn-xs bg-red-600 hover:bg-red-700 text-white border-none"
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
                  <td colSpan="7" className="text-center py-4 text-gray-400">No applications found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Application Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700 text-white">
            <h2 className="text-2xl font-bold mb-4">Create New Application</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-300">Candidate</span>
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  className="select bg-gray-700 border-gray-600 text-white"
                  required
                >
                  {availableUsers.map(user => (
                    <option key={user._id} value={user._id}>{user.name} - {user.email}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-300">Job Post</span>
                </label>
                <select
                  name="jobPostId"
                  value={formData.jobPostId}
                  onChange={handleInputChange}
                  className="select bg-gray-700 border-gray-600 text-white"
                  required
                >
                  {availableJobs.map(job => (
                    <option key={job._id} value={job._id}>{job.jobTitle} at {job.company}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-300">Resume</span>
                </label>
                <select
                  name="resumeId"
                  value={formData.resumeId}
                  onChange={handleInputChange}
                  className="select bg-gray-700 border-gray-600 text-white"
                  required
                >
                  {availableResumes.map(resume => (
                    <option key={resume._id} value={resume._id}>{resume.title || 'Resume'} - {resume.userId?.name || 'Unknown User'}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-300">Status</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select bg-gray-700 border-gray-600 text-white"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn bg-gray-700 hover:bg-gray-600 text-white border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                >
                  Create Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {isEditModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700 text-white">
            <h2 className="text-2xl font-bold mb-4">Edit Application</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-300">Candidate</span>
                </label>
                <p className="p-2 bg-gray-700 rounded-lg">
                  {selectedApplication.userId?.name || 'Unknown Candidate'}
                </p>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-300">Job Post</span>
                </label>
                <p className="p-2 bg-gray-700 rounded-lg">
                  {selectedApplication.jobPostId?.jobTitle || 'Unknown Job'} at {selectedApplication.jobPostId?.company || 'Unknown Company'}
                </p>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-300">Status</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="select bg-gray-700 border-gray-600 text-white"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-300">Match Score (%)</span>
                </label>
                <input
                  type="number"
                  name="similarity"
                  value={formData.similarity}
                  onChange={handleInputChange}
                  className="input bg-gray-700 border-gray-600 text-white"
                  min="0"
                  max="100"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn bg-gray-700 hover:bg-gray-600 text-white border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-amber-600 hover:bg-amber-700 text-white border-none"
                >
                  Update Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700 text-white">
            <h2 className="text-2xl font-bold mb-4">Update Application Status</h2>
            <div className="mb-4">
              <p>
                <span className="font-bold">Candidate:</span> {selectedApplication.userId?.name || 'Unknown Candidate'}
              </p>
              <p>
                <span className="font-bold">Job:</span> {selectedApplication.jobPostId?.jobTitle || 'Unknown Job'} at {selectedApplication.jobPostId?.company || 'Unknown Company'}
              </p>
              <p>
                <span className="font-bold">Current Status:</span> <span className={`badge ${
                  selectedApplication.status === 'Accepted' ? 'bg-green-600' :
                  selectedApplication.status === 'Rejected' ? 'bg-red-600' :
                  'bg-yellow-600'
                } text-white`}>{selectedApplication.status}</span>
              </p>
            </div>
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text text-gray-300">New Status</span>
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="select bg-gray-700 border-gray-600 text-white"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="btn bg-gray-700 hover:bg-gray-600 text-white border-none"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="btn bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-700 text-white">
            <h2 className="text-2xl font-bold mb-4 text-error">Delete Application</h2>
            <p className="mb-6">
              Are you sure you want to delete the application from <span className="font-bold">{selectedApplication.userId?.name || 'Unknown Candidate'}</span> for <span className="font-bold">{selectedApplication.jobPostId?.jobTitle || 'Unknown Job'}</span> at <span className="font-bold">{selectedApplication.jobPostId?.company || 'Unknown Company'}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn bg-gray-700 hover:bg-gray-600 text-white border-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn bg-red-600 hover:bg-red-700 text-white border-none"
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