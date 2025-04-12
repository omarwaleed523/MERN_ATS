import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobpostCard from '../Components/JobpostCard';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FiPlus, FiBriefcase, FiUsers, FiSearch, FiFilter, FiRefreshCw, FiClock, FiCheckCircle, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

const RecruiterHome = () => {
    const [jobPosts, setJobPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [filterOption, setFilterOption] = useState('all');
    const [sortOption, setSortOption] = useState('newest');
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        recentApplicants: 0
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();

    const fetchJobPosts = async () => {
        try {
            setLoading(true);
            const userId = Cookies.get('userId');
            
            // Fetch job posts created by this recruiter
            const jobResponse = await axios.get(`http://localhost:5000/api/jobposts?userId=${userId}`);
            
            if (!jobResponse.data || !Array.isArray(jobResponse.data)) {
                console.error('Invalid job posts data:', jobResponse.data);
                setJobPosts([]);
                setStats({
                    totalJobs: 0,
                    activeJobs: 0,
                    totalApplications: 0,
                    recentApplicants: 0
                });
                setLoading(false);
                return;
            }
            
            setJobPosts(jobResponse.data);
            
            // Create array of job IDs for filtering applications
            const jobIds = jobResponse.data.map(job => job._id);
            
            try {
                // Get all applications - this will be filtered on the client side
                // We should create a server endpoint to filter by jobIds in the future for better performance
                const applicationsResponse = await axios.get('http://localhost:5000/api/applications/');
                
                if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
                    // Filter applications to only include those for jobs created by this recruiter
                    const recruiterApplications = applicationsResponse.data.filter(app => {
                        // Check if jobPostId exists and is an object with _id property
                        if (app.jobPostId && typeof app.jobPostId === 'object' && app.jobPostId._id) {
                            return jobIds.includes(app.jobPostId._id);
                        } 
                        // If jobPostId is just an ID string
                        else if (typeof app.jobPostId === 'string') {
                            return jobIds.includes(app.jobPostId);
                        }
                        return false;
                    });
                    
                    // Calculate recent applicants (last 7 days)
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    
                    const recentApps = recruiterApplications.filter(app => {
                        const appDate = new Date(app.appliedAt || app.createdAt || Date.now());
                        return appDate >= sevenDaysAgo;
                    });
                    
                    // Calculate stats
                    setStats({
                        totalJobs: jobResponse.data.length,
                        activeJobs: jobResponse.data.filter(job => !job.isClosed).length,
                        totalApplications: recruiterApplications.length,
                        recentApplicants: recentApps.length
                    });
                } else {
                    console.error('Invalid applications data:', applicationsResponse.data);
                    // Set stats with just job data
                    setStats({
                        totalJobs: jobResponse.data.length,
                        activeJobs: jobResponse.data.filter(job => !job.isClosed).length,
                        totalApplications: 0,
                        recentApplicants: 0
                    });
                }
            } catch (appError) {
                console.error('Error fetching applications:', appError);
                // Set stats with just job data if applications fetch fails
                setStats({
                    totalJobs: jobResponse.data.length,
                    activeJobs: jobResponse.data.filter(job => !job.isClosed).length,
                    totalApplications: 0,
                    recentApplicants: 0
                });
            }
            
        } catch (error) {
            console.error('Error fetching job posts:', error);
            setJobPosts([]);
            setStats({
                totalJobs: 0,
                activeJobs: 0,
                totalApplications: 0,
                recentApplicants: 0
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobPosts();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchJobPosts();
        setTimeout(() => setIsRefreshing(false), 600);
    };

    const handleEdit = (job) => {
        navigate('/editjobpost', { state: { job } });
    };

    const handleDelete = async (jobPostId) => {
        try {
            await axios.delete(`http://localhost:5000/api/jobposts/${jobPostId}`);
            fetchJobPosts();
        } catch (error) {
            console.error('Error deleting job post:', error);
        }
    };

    // Filter and sort jobs
    let filteredJobs = jobPosts.filter(job =>
        (job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.department.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterOption === 'all' ||
            (filterOption === 'active' && !job.isClosed) ||
            (filterOption === 'department' && job.department === 'ENGINEERING'))
    );

    // Sort jobs
    filteredJobs = filteredJobs.sort((a, b) => {
        if (sortOption === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortOption === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortOption === 'alphabetical') {
            return a.jobTitle.localeCompare(b.jobTitle);
        }
        return 0;
    });


    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <h1 className="text-3xl font-bold text-base-content mb-2">Recruiter Dashboard</h1>
                    <p className="text-base-content/70">Manage your job postings and track applicants</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Section*/}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow"
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="card-body p-5">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-primary/20 text-primary">
                                    <FiBriefcase size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-base-content/60">Total Job Posts</p>
                                    <h3 className="text-2xl font-semibold text-base-content">{stats.totalJobs}</h3>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow"
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="card-body p-5">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-success/20 text-success">
                                    <FiCheckCircle size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-base-content/60">Active Jobs</p>
                                    <h3 className="text-2xl font-semibold text-base-content">{stats.activeJobs}</h3>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow"
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="card-body p-5">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-info/20 text-info">
                                    <FiUsers size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-base-content/60">Total Applicants</p>
                                    <h3 className="text-2xl font-semibold text-base-content">{stats.totalApplications}</h3>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow"
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <div className="card-body p-5">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-secondary/20 text-secondary">
                                    <FiTrendingUp size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-base-content/60">Recent Applicants</p>
                                    <h3 className="text-2xl font-semibold text-base-content">{stats.recentApplicants}</h3>
                                    <p className="text-xs text-base-content/40 mt-1">Last 7 days</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Search and Filters Section*/}
                <div className="bg-base-200 rounded-xl p-5 mb-8 shadow-md">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-base-content/40" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search job posts..."
                                className="input input-bordered w-full pl-10 bg-base-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <span className="text-base-content/40 hover:text-base-content">✕</span>
                                </button>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate('/addjobpost')}
                            className="btn btn-primary gap-2"
                        >
                            <FiPlus size={20} />
                            Add New Job
                        </motion.button>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center">
                            <FiFilter className="mr-2 text-base-content/60" />
                            <span className="text-sm font-medium mr-2">Filter:</span>
                            <select
                                className="select select-sm select-bordered bg-base-100"
                                value={filterOption}
                                onChange={(e) => setFilterOption(e.target.value)}
                            >
                                <option value="all">All Jobs</option>
                                <option value="active">Active Jobs</option>
                                <option value="department">Engineering</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <FiCalendar className="mr-2 text-base-content/60" />
                            <span className="text-sm font-medium mr-2">Sort:</span>
                            <select
                                className="select select-sm select-bordered bg-base-100"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                        </div>

                        <div className="ml-auto">
                            <motion.button
                                whileHover={{ rotate: isRefreshing ? 0 : 45 }}
                                animate={{ rotate: isRefreshing ? 360 : 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                onClick={handleRefresh}
                                className="btn btn-sm btn-ghost btn-circle"
                                disabled={isRefreshing}
                            >
                                <FiRefreshCw size={18} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 text-sm text-base-content/60">
                        Showing {filteredJobs.length} of {jobPosts.length} job posts
                    </div>
                </div>

                {/* Job Listings Section */}
                {loading ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="card bg-base-200 shadow animate-pulse">
                                <div className="card-body">
                                    <div className="h-6 bg-base-300 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-base-300 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-base-300 rounded w-1/3 mb-4"></div>
                                    <div className="h-20 bg-base-300 rounded mb-4"></div>
                                    <div className="flex justify-between mt-4">
                                        <div className="h-10 bg-base-300 rounded w-1/3"></div>
                                        <div className="h-10 bg-base-300 rounded w-1/3"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                <JobpostCard
                                    job={job}
                                    onEdit={() => handleEdit(job)}
                                    onDelete={handleDelete}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    // Enhanced empty state
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card bg-base-200 p-12 text-center"
                    >
                        <div className="bg-base-300/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiBriefcase size={48} className="text-base-content/40" />
                        </div>
                        <h3 className="text-xl font-medium text-base-content mb-3">No job posts found</h3>
                        <p className="text-base-content/60 max-w-md mx-auto mb-6">
                            {searchTerm ?
                                `We couldn't find any jobs matching "${searchTerm}". Try adjusting your search or filters.` :
                                "Get started by creating your first job post to attract the perfect candidates."}
                        </p>
                        <div className="flex justify-center">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/addjobpost')}
                                className="btn btn-primary"
                            >
                                <FiPlus className="mr-2" />
                                Create Job Post
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Quick Actions Floating Button (mobile only) */}
                <div className="md:hidden fixed bottom-6 right-6">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/addjobpost')}
                        className="btn btn-primary btn-circle shadow-lg w-14 h-14"
                    >
                        <FiPlus size={24} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default RecruiterHome;