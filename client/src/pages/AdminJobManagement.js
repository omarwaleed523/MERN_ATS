import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { FiTrash2, FiEye, FiEdit, FiPlus } from 'react-icons/fi';

const AdminJobManagement = () => {
  const { user } = useContext(UserContext);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  // Form data for creating/editing job posts
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    department: '',
    location: '',
    salary: '',
    jobDescription: '',
    skills: []
  });
  
  const [skillInput, setSkillInput] = useState('');

  // Define fetchJobs using useCallback to prevent dependency cycle
  const fetchJobs = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/jobposts`, {
        headers: { 'x-auth-token': user.token }
      });
      
      setJobs(response.data);
      
      // Extract unique companies and departments for filters
      const uniqueCompanies = [...new Set(response.data.map(job => job.company))];
      const uniqueDepartments = [...new Set(response.data.map(job => job.department))];
      
      setCompanies(uniqueCompanies);
      setDepartments(uniqueDepartments);
      
      setFilteredJobs(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setLoading(false);
    }
  }, [user.token]);

  // Define filterJobs using useCallback
  const filterJobs = React.useCallback(() => {
    let filtered = jobs;
    
    // Filter by company if not "All"
    if (companyFilter !== 'All') {
      filtered = filtered.filter(job => job.company === companyFilter);
    }
    
    // Filter by department if not "All"
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(job => job.department === departmentFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.jobTitle.toLowerCase().includes(term) || 
        job.company.toLowerCase().includes(term) ||
        job.department.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      );
    }
    
    setFilteredJobs(filtered);
  }, [jobs, companyFilter, departmentFilter, searchTerm]);

  useEffect(() => {
    // Check if user is admin
    if (user.role !== 'Administrator') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    fetchJobs();
  }, [user, fetchJobs]);

  // Filter jobs when search term or filters change
  useEffect(() => {
    filterJobs();
  }, [searchTerm, companyFilter, departmentFilter, jobs, filterJobs]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'salary' ? parseInt(value) || '' : value
    });
  };
  
  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };
  
  const handleSkillAdd = () => {
    if (skillInput.trim() !== '' && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };
  
  const handleSkillRemove = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSkillAdd();
    }
  };
  
  const handleCreateClick = () => {
    // Reset form data
    setFormData({
      jobTitle: '',
      company: '',
      department: '',
      location: '',
      salary: '',
      jobDescription: '',
      skills: []
    });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (job) => {
    setSelectedJob(job);
    setFormData({
      jobTitle: job.jobTitle,
      company: job.company,
      department: job.department,
      location: job.location,
      salary: job.salary,
      jobDescription: job.jobDescription,
      skills: job.skills || []
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (job) => {
    setSelectedJob(job);
    setIsDeleteModalOpen(true);
  };
  
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobposts`, 
        {
          ...formData,
          userId: user._id // Admin creates the job post
        },
        {
          headers: { 'x-auth-token': user.token }
        }
      );
      
      // Add the new job to the jobs list
      setJobs([response.data, ...jobs]);
      setIsCreateModalOpen(false);
      alert('Job post created successfully');
    } catch (err) {
      console.error('Error creating job post:', err);
      alert(`Error creating job post: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobposts/${selectedJob._id}`, 
        formData,
        {
          headers: { 'x-auth-token': user.token }
        }
      );
      
      // Update the job in the local state
      const updatedJobs = jobs.map(job => 
        job._id === selectedJob._id ? response.data : job
      );
      setJobs(updatedJobs);
      
      setIsEditModalOpen(false);
      alert('Job post updated successfully');
    } catch (err) {
      console.error('Error updating job post:', err);
      alert(`Error updating job post: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/jobposts/${selectedJob._id}`, {
        headers: { 'x-auth-token': user.token }
      });
      
      // Update local state
      const updatedJobs = jobs.filter(j => j._id !== selectedJob._id);
      setJobs(updatedJobs);
      
      setIsDeleteModalOpen(false);
      alert('Job post deleted successfully');
    } catch (err) {
      console.error('Error deleting job post:', err);
      alert(`Error deleting job post: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  // Format salary to display as currency
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };

  // Format date to be more readable
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
        <h1 className="text-3xl font-bold">Job Post Management</h1>
        <div className="flex gap-2">
          <button
            onClick={handleCreateClick}
            className="btn btn-success"
          >
            <FiPlus className="mr-1" /> Create Job Post
          </button>
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
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Department Filter</span>
            </label>
            <select 
              className="select select-bordered" 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              {departments.map((department, index) => (
                <option key={index} value={department}>{department}</option>
              ))}
            </select>
          </div>
          
          <div className="form-control flex-grow">
            <label className="label">
              <span className="label-text">Search Job Posts</span>
            </label>
            <input 
              type="text" 
              placeholder="Search by title, company, or location" 
              className="input input-bordered w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <span className="badge badge-primary badge-lg">{filteredJobs.length} job posts found</span>
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
                <th>Job Title</th>
                <th>Company</th>
                <th>Department</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.jobTitle}</td>
                    <td>{job.company}</td>
                    <td>
                      <span className="badge badge-ghost">
                        {job.department}
                      </span>
                    </td>
                    <td>{job.location}</td>
                    <td>{formatSalary(job.salary)}</td>
                    <td>{formatDate(job.createdAt)}</td>
                    <td className="flex gap-2">
                      <Link 
                        to={`/viewjobpost/${job._id}`} 
                        className="btn btn-xs btn-info"
                      >
                        <FiEye />
                      </Link>
                      <button 
                        className="btn btn-xs btn-warning"
                        onClick={() => handleEditClick(job)}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="btn btn-xs btn-error"
                        onClick={() => handleDeleteClick(job)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">No job posts found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Job Post Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Create New Job Post</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Job Title</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Company</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Department</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Location</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Salary (USD)</span>
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Skills (add with Enter)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={handleSkillInputChange}
                      onKeyPress={handleKeyPress}
                      className="input input-bordered flex-grow"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={handleSkillAdd}
                      className="btn btn-success"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="badge badge-primary gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Job Description</span>
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered h-32"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  Create Job Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Post Modal */}
      {isEditModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Edit Job Post</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Job Title</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Company</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Department</span>
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Location</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Salary (USD)</span>
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Skills (add with Enter)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={handleSkillInputChange}
                      onKeyPress={handleKeyPress}
                      className="input input-bordered flex-grow"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={handleSkillAdd}
                      className="btn btn-success"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="badge badge-primary gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Job Description</span>
                </label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered h-32"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-warning"
                >
                  Update Job Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete the job post "{selectedJob.jobTitle}" at {selectedJob.company}?</p>
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

export default AdminJobManagement;