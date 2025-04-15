import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FiTrash2, FiBriefcase, FiCalendar, FiCheck, FiClock, FiX, FiFileText, FiSearch, FiFilter, FiRefreshCw, FiMapPin, FiDollarSign, FiStar, FiAward, FiBarChart2 } from 'react-icons/fi';

const UserApplications = () => {
    const { userId } = useParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMsg, setNotificationMsg] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:5000/api/applications/${userId}`);
                setApplications(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setError('Failed to fetch your applications. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [userId]);

    const handleDelete = async (applicationId) => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/api/applications/${applicationId}`);
            setApplications(applications.filter(app => app._id !== applicationId));
            setNotificationMsg('Application withdrawn successfully');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        } catch (error) {
            console.error('Error deleting application:', error);
            setNotificationMsg('Failed to withdraw application. Please try again.');
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Accepted':
                return <span className="badge badge-success gap-1"><FiCheck /> Accepted</span>;
            case 'Rejected':
                return <span className="badge badge-error gap-1"><FiX /> Rejected</span>;
            default:
                return <span className="badge badge-warning gap-1"><FiClock /> Pending</span>;
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const calculateDaysAgo = (dateString) => {
        const applied = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - applied);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    };

    // Filter and sort applications
    const filteredApplications = applications
        .filter(app => {
            // Status filter
            if (statusFilter !== 'all' && app.status !== statusFilter) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchText = searchTerm.toLowerCase();
                return (
                    (app.jobPostId?.jobTitle || '').toLowerCase().includes(searchText) ||
                    (app.jobPostId?.company || '').toLowerCase().includes(searchText) ||
                    (app.jobPostId?.department || '').toLowerCase().includes(searchText)
                );
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.appliedAt) - new Date(a.appliedAt);
                case 'match':
                    return (b.similarity || 0) - (a.similarity || 0);
                case 'company':
                    return (a.jobPostId?.company || '').localeCompare(b.jobPostId?.company || '');
                default:
                    return 0;
            }
        });


    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="alert alert-error max-w-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            {/* Toast Notification */}
            {showNotification && (
                <div className="toast toast-top toast-end z-50">
                    <div className="alert alert-info">
                        <span>{notificationMsg}</span>
                    </div>
                </div>
            )}

            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-10 mb-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-base-content mb-2">Your Applications</h2>
                    <p className="text-base-content/70">Track and manage your job applications</p>

                    <div className="stats shadow bg-base-100/80 mt-6">
                        <div className="stat">
                            <div className="stat-figure text-primary">
                                <FiBriefcase className="w-8 h-8" />
                            </div>
                            <div className="stat-title">Total Applications</div>
                            <div className="stat-value text-primary">{applications.length}</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-success">
                                <FiCheck className="w-8 h-8" />
                            </div>
                            <div className="stat-title">Accepted</div>
                            <div className="stat-value text-success">{applications.filter(app => app.status === 'Accepted').length}</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-warning">
                                <FiClock className="w-8 h-8" />
                            </div>
                            <div className="stat-title">Pending</div>
                            <div className="stat-value text-warning">{applications.filter(app => app.status === 'Pending').length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {/* Filters and Search */}
                {applications.length > 0 && (
                    <div className="bg-base-200 rounded-lg p-4 mb-6 shadow-md">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="relative grow max-w-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="text-base-content/40" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search jobs or companies..."
                                    className="input input-bordered w-full pl-10"
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

                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <FiFilter className="text-base-content/60" />
                                    <select
                                        className="select select-bordered select-sm"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <FiBarChart2 className="text-base-content/60" />
                                    <select
                                        className="select select-bordered select-sm"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="date">Recent First</option>
                                        <option value="match">Match Score</option>
                                        <option value="company">Company Name</option>
                                    </select>
                                </div>


                            </div>
                        </div>

                        <div className="text-sm text-base-content/60 mt-4">
                            Showing {filteredApplications.length} of {applications.length} applications
                        </div>
                    </div>
                )}

                {applications.length === 0 ? (
                    <div className="bg-base-200 rounded-lg p-12 text-center">
                        <div className="bg-base-300/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiBriefcase className="w-12 h-12 text-base-content/40" />
                        </div>
                        <h3 className="text-xl font-medium text-base-content mb-3">No Applications Yet</h3>
                        <p className="text-base-content/70 max-w-md mx-auto mb-6">
                            You haven't applied to any jobs yet. Start browsing available positions and submit your first application!
                        </p>
                        <Link to="/candidatehome" className="btn btn-primary">
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    <>
                        {filteredApplications.length === 0 ? (
                            <div className="bg-base-200 rounded-lg p-8 text-center">
                                <FiFilter className="w-12 h-12 mx-auto text-base-content/40" />
                                <h3 className="text-lg font-medium mt-4 mb-2">No matching applications</h3>
                                <p className="text-base-content/70 max-w-md mx-auto mb-4">
                                    We couldn't find any applications matching your current filters.
                                </p>
                                <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="btn btn-outline btn-sm">
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredApplications.map(app => (
                                    <div key={app._id} className="bg-base-200 rounded-lg shadow-lg overflow-hidden border border-base-300 hover:shadow-xl transition-all duration-300 hover:translate-y-[-2px] group relative">
                                        {/* Status indicator strip at the top */}
                                        <div className={`h-1 absolute top-0 inset-x-0 ${app.status === 'Accepted' ? 'bg-success' :
                                            app.status === 'Rejected' ? 'bg-error' :
                                                'bg-warning'
                                            }`}></div>

                                        {/* Card pattern for visual interest */}
                                        <div className="card-pattern absolute inset-0 pointer-events-none"></div>

                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-200">
                                                        {app.jobPostId?.jobTitle || "Unknown Job"}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                                        <p className="text-base-content/70">
                                                            {app.jobPostId?.company || "Unknown Company"}
                                                        </p>
                                                        <span className="badge badge-ghost badge-sm">
                                                            {app.jobPostId?.department || "Department"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                                    {getStatusBadge(app.status)}
                                                    <span className="text-sm text-base-content/60 flex items-center gap-1">
                                                        <FiCalendar className="text-primary/70" />
                                                        <span className="hidden md:inline">Applied on </span>
                                                        {formatDate(app.appliedAt)}
                                                        <span className="badge badge-sm badge-ghost ml-1">{calculateDaysAgo(app.appliedAt)}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-6 mt-4">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-base-content/80 mb-2 flex items-center">
                                                        <FiBriefcase className="mr-2 text-primary" /> Job Details
                                                    </h4>
                                                    <div className="bg-base-300/30 p-4 rounded-md">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                            {app.jobPostId?.location && (
                                                                <div className="flex gap-2 items-center text-sm">
                                                                    <FiMapPin className="text-primary/70" />
                                                                    <span>{app.jobPostId.location}</span>
                                                                </div>
                                                            )}
                                                            {app.jobPostId?.salary && (
                                                                <div className="flex gap-2 items-center text-sm">
                                                                    <FiDollarSign className="text-primary/70" />
                                                                    <span>${app.jobPostId.salary.toLocaleString()}/year</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 items-start mt-2">
                                                            <FiFileText className="text-primary mt-1 flex-shrink-0" />
                                                            <p className="text-sm line-clamp-2">
                                                                {app.jobPostId?.jobDescription?.substring(0, 120)}...
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-base-content/80 mb-2 flex items-center">
                                                        <FiStar className="mr-2 text-primary" /> Match Information
                                                    </h4>
                                                    <div className="bg-base-300/30 p-4 rounded-md">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <p className="font-medium">
                                                                <FiAward className="inline mr-2 text-primary/70" />
                                                                {app.resumeId?.Name || "Resume"}
                                                            </p>
                                                        </div>

                                                        {app.similarity > 0 ? (
                                                            <div className="mt-2">
                                                                <div className="flex justify-between mb-1">
                                                                    <p className="text-sm">Match Score:</p>
                                                                    <p className={`text-sm font-medium ${app.similarity > 70 ? 'text-success' :
                                                                        app.similarity > 40 ? 'text-warning' :
                                                                            'text-error'
                                                                        }`}>
                                                                        {Math.round(app.similarity)}%
                                                                    </p>
                                                                </div>
                                                                <div className="w-full bg-base-300 rounded-full h-2.5">
                                                                    <div
                                                                        className={`h-2.5 rounded-full ${app.similarity > 70 ? 'bg-success' :
                                                                            app.similarity > 40 ? 'bg-warning' :
                                                                                'bg-error'
                                                                            }`}
                                                                        style={{ width: `${app.similarity}%` }}
                                                                    ></div>
                                                                </div>
                                                                <p className="text-xs mt-2 text-base-content/60">
                                                                    {app.similarity > 70 ? 'Great match for this position!' :
                                                                        app.similarity > 40 ? 'Moderate match for this role' :
                                                                            'Consider updating your resume for better matching'}
                                                                </p>
                                                                
                                                                {/* Display improvement feedback if similarity is less than 100% */}
                                                                {app.similarity < 100 && app.similarity > 0 && (
                                                                    <div className="mt-3 border-t border-base-300 pt-3">
                                                                        {app.missingSkills && (
                                                                            <div className="mb-2">
                                                                                <h5 className="text-sm font-semibold mb-1 text-base-content/80">Missing Requirements:</h5>
                                                                                <p className="text-xs text-base-content/70 bg-base-200 p-2 rounded">
                                                                                    {app.missingSkills}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {app.improvementSuggestions && (
                                                                            <div>
                                                                                <h5 className="text-sm font-semibold mb-1 text-base-content/80">How to Improve:</h5>
                                                                                <p className="text-xs text-base-content/70 bg-base-200 p-2 rounded">
                                                                                    {app.improvementSuggestions}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-center p-2">
                                                                <button 
                                                                    className="btn btn-sm btn-ghost text-primary/70"
                                                                    disabled={true}
                                                                >
                                                                    <FiRefreshCw className="mr-2" /> Match score not calculated yet
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-base-300/30 p-4 flex justify-between items-center">
                                            <Link to={`/viewjobpost/${app.jobPostId?._id}`} className="btn btn-primary btn-sm">
                                                View Job
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(app._id)}
                                                className="btn btn-error btn-sm btn-outline group-hover:btn-error group-hover:text-white transition-all"
                                            >
                                                <FiTrash2 className="mr-1" /> Withdraw Application
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserApplications;