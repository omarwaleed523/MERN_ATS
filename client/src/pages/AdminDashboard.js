import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

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
  const [skillStats, setSkillStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [activityData, setActivityData] = useState({
    labels: [],
    applications: [],
    jobs: []
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
        const statsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/stats`, {
          headers: { 'x-auth-token': user.token }
        });
        
        // Fetch recent users
        const usersResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/recent-users`, {
          headers: { 'x-auth-token': user.token }
        });
        
        // Fetch recent job posts
        const jobsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/recent-jobs`, {
          headers: { 'x-auth-token': user.token }
        });

        // Fetch top skills across resumes (new endpoint to be created)
        const skillsResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/top-skills`, {
          headers: { 'x-auth-token': user.token }
        }).catch(() => ({ data: [] }));
        
        // Fetch company stats (new endpoint to be created)
        const companiesResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/company-stats`, {
          headers: { 'x-auth-token': user.token }
        }).catch(() => ({ data: [] }));
        
        // Fetch system activity over time (new endpoint to be created)
        const activityResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/activity-timeline`, {
          headers: { 'x-auth-token': user.token }
        }).catch(() => ({ 
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            applications: [5, 7, 10, 12, 15, 18],
            jobs: [2, 3, 5, 7, 8, 10]
          }
        }));

        setStats(statsResponse.data);
        setRecentUsers(usersResponse.data);
        setRecentJobs(jobsResponse.data);
        setSkillStats(skillsResponse.data || []);
        setCompanyStats(companiesResponse.data || []);
        setActivityData(activityResponse.data || {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          applications: [5, 7, 10, 12, 15, 18],
          jobs: [2, 3, 5, 7, 8, 10]
        });
        
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

  // Top Skills chart data
  const skillsData = {
    labels: skillStats.map(item => item.skill).slice(0, 7),
    datasets: [
      {
        label: 'Number of Candidates',
        data: skillStats.map(item => item.count).slice(0, 7),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Company Activity chart data
  const companyData = {
    labels: companyStats.map(item => item.company).slice(0, 5),
    datasets: [
      {
        label: 'Job Postings',
        data: companyStats.map(item => item.jobCount).slice(0, 5),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  // System activity over time (line chart)
  const activityChartData = {
    labels: activityData.labels,
    datasets: [
      {
        label: 'Applications',
        data: activityData.applications,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Job Postings',
        data: activityData.jobs,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Chart options with improved visibility for dark theme
  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: 'rgba(255, 255, 255, 0.8)' // Lighter color for y-axis labels
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)' // Subtle grid lines
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)' // Lighter color for x-axis labels
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)' // Subtle grid lines
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.8)' // Lighter color for legend labels
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1
      }
    }
  };

  // Pie chart options
  const pieOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
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
      <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="stats shadow bg-indigo-800 text-white">
              <div className="stat">
                <div className="stat-title text-indigo-200">Total Users</div>
                <div className="stat-value">{stats.totalUsers}</div>
              </div>
            </div>
            <div className="stats shadow bg-sky-800 text-white">
              <div className="stat">
                <div className="stat-title text-sky-200">Job Postings</div>
                <div className="stat-value">{stats.jobPostsCount}</div>
              </div>
            </div>
            <div className="stats shadow bg-emerald-800 text-white">
              <div className="stat">
                <div className="stat-title text-emerald-200">Applications</div>
                <div className="stat-value">{stats.applicationsCount}</div>
              </div>
            </div>
            <div className="stats shadow bg-amber-800 text-white">
              <div className="stat">
                <div className="stat-title text-amber-200">Resumes</div>
                <div className="stat-value">{stats.resumesCount || 0}</div>
              </div>
            </div>
          </div>

          {/* Charts Section - First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">User Distribution</h2>
              <div className="h-[300px] flex items-center justify-center">
                <Pie data={roleDistributionData} options={pieOptions} />
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Top Skills in Demand</h2>
              <div className="h-[300px] flex items-center justify-center">
                <Bar 
                  data={skillsData} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>

          {/* Charts Section - Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Most Active Companies</h2>
              <div className="h-[300px] flex items-center justify-center">
                <Bar 
                  data={companyData} 
                  options={chartOptions} 
                />
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">System Activity</h2>
              <div className="h-[300px] flex items-center justify-center">
                <Line 
                  data={activityChartData} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>

          {/* Management Navigation */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link to="/admin/users" className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none">
              Manage Users
            </Link>
            <Link to="/admin/jobs" className="btn bg-sky-600 hover:bg-sky-700 text-white border-none">
              Manage Job Posts
            </Link>
            <Link to="/admin/applications" className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none">
              Manage Applications
            </Link>
            <Link to="/admin/schemas" className="btn bg-amber-600 hover:bg-amber-700 text-white border-none">
              View Database Schemas
            </Link>
          </div>

          {/* Recent Users */}
          <div className="bg-gray-800 p-6 rounded-lg shadow mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Recent Users</h2>
            <div className="overflow-x-auto">
              <table className="table w-full bg-gray-800 text-white">
                <thead className="text-gray-300 bg-gray-700">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-700">
                      <td className="text-white">{user.name}</td>
                      <td className="text-gray-300">{user.email}</td>
                      <td>
                        <span className={`badge ${
                          user.role === 'Administrator' 
                            ? 'bg-amber-500 text-black' 
                            : user.role === 'Recruiter' 
                            ? 'bg-sky-500 text-black' 
                            : 'bg-emerald-500 text-black'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentUsers.length === 0 && (
                <div className="text-center py-4 text-gray-400">No users found</div>
              )}
            </div>
          </div>

          {/* Recent Job Posts */}
          <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Recent Job Posts</h2>
            <div className="overflow-x-auto">
              <table className="table w-full bg-gray-800 text-white">
                <thead className="text-gray-300 bg-gray-700">
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Department</th>
                    <th>Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job) => (
                    <tr key={job._id} className="border-b border-gray-700">
                      <td className="text-white">{job.jobTitle}</td>
                      <td className="text-gray-300">{job.company}</td>
                      <td>
                        <span className="badge bg-gray-600 text-white">
                          {job.department}
                        </span>
                      </td>
                      <td className="text-gray-300">{new Date(job.createdAt || job.postDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentJobs.length === 0 && (
                <div className="text-center py-4 text-gray-400">No jobs found</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;