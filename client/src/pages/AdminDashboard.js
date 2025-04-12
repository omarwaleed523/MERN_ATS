import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    candidatesCount: 0,
    recruitersCount: 0,
    adminCount: 0,
    jobPostsCount: 0,
    applicationsCount: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (user.role !== 'Administrator') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { 'x-auth-token': user.token }
        });
        
        // Fetch recent users
        const usersResponse = await axios.get('http://localhost:5000/api/admin/recent-users', {
          headers: { 'x-auth-token': user.token }
        });
        
        // Fetch recent job posts
        const jobsResponse = await axios.get('http://localhost:5000/api/admin/recent-jobs', {
          headers: { 'x-auth-token': user.token }
        });

        setStats(statsResponse.data);
        setRecentUsers(usersResponse.data);
        setRecentJobs(jobsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // User role distribution data for pie chart
  const roleDistributionData = {
    labels: ['Candidates', 'Recruiters', 'Admins'],
    datasets: [
      {
        data: [stats.candidatesCount, stats.recruitersCount, stats.adminCount],
        backgroundColor: ['#4ade80', '#3b82f6', '#f97316'],
        borderColor: ['#22c55e', '#2563eb', '#ea580c'],
        borderWidth: 1,
      },
    ],
  };

  // Application status distribution
  const applicationStatusData = {
    labels: ['Pending', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'],
    datasets: [
      {
        label: 'Applications by Status',
        data: [
          stats.pendingApplications || 0,
          stats.reviewingApplications || 0,
          stats.shortlistedApplications || 0,
          stats.rejectedApplications || 0,
          stats.hiredApplications || 0,
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
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
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="stats shadow bg-primary text-primary-content">
              <div className="stat">
                <div className="stat-title">Total Users</div>
                <div className="stat-value">{stats.totalUsers}</div>
              </div>
            </div>
            <div className="stats shadow bg-secondary text-secondary-content">
              <div className="stat">
                <div className="stat-title">Job Postings</div>
                <div className="stat-value">{stats.jobPostsCount}</div>
              </div>
            </div>
            <div className="stats shadow bg-accent text-accent-content">
              <div className="stat">
                <div className="stat-title">Applications</div>
                <div className="stat-value">{stats.applicationsCount}</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-base-200 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
              <div className="h-[300px] flex items-center justify-center">
                <Pie data={roleDistributionData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-base-200 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Application Status</h2>
              <div className="h-[300px] flex items-center justify-center">
                <Bar 
                  data={applicationStatusData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0 // Only show integer values
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Management Navigation */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link to="/admin/users" className="btn btn-primary">
              Manage Users
            </Link>
            <Link to="/admin/jobs" className="btn btn-secondary">
              Manage Job Posts
            </Link>
            <Link to="/admin/applications" className="btn btn-accent">
              Manage Applications
            </Link>
            <Link to="/admin/schemas" className="btn btn-info">
              View Database Schemas
            </Link>
          </div>

          {/* Recent Users */}
          <div className="bg-base-200 p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
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
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentUsers.length === 0 && (
                <div className="text-center py-4">No users found</div>
              )}
            </div>
          </div>

          {/* Recent Job Posts */}
          <div className="bg-base-200 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Job Posts</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job._id}>
                      <td>{job.jobTitle}</td>
                      <td>{job.company}</td>
                      <td>
                        <span className={`badge ${
                          job.status === 'open' 
                            ? 'badge-success' 
                            : 'badge-error'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td>{new Date(job.postDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentJobs.length === 0 && (
                <div className="text-center py-4">No jobs found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;