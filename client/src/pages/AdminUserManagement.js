import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const AdminUserManagement = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: '',
    phonenumber: '',
    company: '',
  });

  useEffect(() => {
    // Check if user is admin
    if (user.role !== 'Administrator') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    fetchUsers();
  }, [user]);

  // Filter users when search term or role filter changes
  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users`, {
        headers: { 'x-auth-token': user.token }
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    
    // Filter by role if not "All"
    if (roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        (user.company && user.company.toLowerCase().includes(term))
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      phonenumber: user.phonenumber || '',
      company: user.company || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${selectedUser._id}`, editFormData, {
        headers: { 'x-auth-token': user.token }
      });
      
      // Update local state
      const updatedUsers = users.map(u => 
        u._id === selectedUser._id ? { ...u, ...editFormData } : u
      );
      
      setUsers(updatedUsers);
      setIsEditModalOpen(false);
      alert('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      alert(`Error updating user: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/admin/users/${selectedUser._id}`, {
        headers: { 'x-auth-token': user.token }
      });
      
      // Update local state
      const updatedUsers = users.filter(u => u._id !== selectedUser._id);
      setUsers(updatedUsers);
      
      setIsDeleteModalOpen(false);
      alert('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(`Error deleting user: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
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
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link to="/admin/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-base-200 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Role Filter</span>
            </label>
            <select 
              className="select select-bordered" 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Administrator">Administrators</option>
              <option value="Recruiter">Recruiters</option>
              <option value="Candidate">Candidates</option>
            </select>
          </div>
          <div className="form-control flex-grow">
            <label className="label">
              <span className="label-text">Search Users</span>
            </label>
            <input 
              type="text" 
              placeholder="Search by name or email" 
              className="input input-bordered w-full" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 md:mt-0">
          <span className="badge badge-lg">{filteredUsers.length} users found</span>
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
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${
                        user.role === 'Administrator' 
                          ? 'badge-warning' 
                          : user.role === 'Recruiter' 
                          ? 'badge-primary' 
                          : 'badge-secondary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.phonenumber || 'N/A'}</td>
                    <td>{user.company || 'N/A'}</td>
                    <td className="flex gap-2">
                      <button 
                        className="btn btn-xs btn-info"
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-xs btn-error"
                        onClick={() => handleDeleteClick(user)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input 
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input 
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  className="input input-bordered"
                  required
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditChange}
                  className="select select-bordered"
                  required
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Candidate">Candidate</option>
                </select>
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Phone Number</span>
                </label>
                <input 
                  type="text"
                  name="phonenumber"
                  value={editFormData.phonenumber}
                  onChange={handleEditChange}
                  className="input input-bordered"
                />
              </div>
              {editFormData.role === 'Recruiter' && (
                <div className="form-control mb-3">
                  <label className="label">
                    <span className="label-text">Company</span>
                  </label>
                  <input 
                    type="text"
                    name="company"
                    value={editFormData.company}
                    onChange={handleEditChange}
                    className="input input-bordered"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete user {selectedUser.name}?</p>
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

export default AdminUserManagement;