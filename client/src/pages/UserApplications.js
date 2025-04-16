import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FiTrash2, FiBriefcase, FiCalendar, FiCheck, FiClock, FiX, FiFileText, FiSearch, FiFilter, FiRefreshCw, FiMapPin, FiDollarSign, FiStar, FiAward, FiBarChart2, FiInfo, FiSend, FiMessageSquare, FiMail, FiCheckCircle, FiAlertCircle, FiEdit3, FiUserCheck, FiUserX, FiAlertTriangle, FiCheckSquare, FiActivity } from 'react-icons/fi';

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
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

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
            case 'Draft':
                return <span className="badge badge-ghost gap-1"><FiFileText /> Draft</span>;
            case 'Submitted':
                return <span className="badge badge-info gap-1"><FiFileText /> Submitted</span>;
            case 'Under Review':
                return <span className="badge badge-primary gap-1"><FiClock /> Under Review</span>;
            case 'Shortlisted':
                return <span className="badge badge-secondary gap-1"><FiStar /> Shortlisted</span>;
            case 'Interview Scheduled':
                return <span className="badge badge-accent gap-1"><FiCalendar /> Interview Scheduled</span>;
            case 'Interviewed':
                return <span className="badge badge-info gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Interviewed</span>;
            case 'Assessment':
                return <span className="badge badge-warning gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Assessment</span>;
            case 'Reference Check':
                return <span className="badge badge-primary gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg> Reference Check</span>;
            case 'Offer Extended':
                return <span className="badge badge-secondary gap-1"><FiMail /> Offer Extended</span>;
            case 'Offer Accepted':
                return <span className="badge badge-success gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg> Offer Accepted</span>;
            case 'Offer Declined':
                return <span className="badge badge-warning gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="18" y1="8" x2="23" y2="13"></line><line x1="23" y1="8" x2="18" y2="13"></line></svg> Offer Declined</span>;
            case 'Hired':
                return <span className="badge badge-success gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Hired</span>;
            case 'Rejected':
                return <span className="badge badge-error gap-1"><FiX /> Rejected</span>;
            case 'Withdrawn':
                return <span className="badge badge-error gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg> Withdrawn</span>;
            default:
                return <span className="badge badge-info gap-1"><FiClock /> {status}</span>;
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

    // Function to show the status history
    const showStatusHistory = (application) => {
        setSelectedApplication(application);
        setShowHistoryModal(true);
    };

    // Function to get appropriate icon for each status
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Draft': return <FiEdit3 />;
            case 'Submitted': return <FiFileText />;
            case 'Under Review': return <FiClock />;
            case 'Shortlisted': return <FiStar />;
            case 'Interview Scheduled': return <FiCalendar />;
            case 'Interviewed': return <FiMessageSquare />;
            case 'Assessment': return <FiAlertCircle />;
            case 'Reference Check': return <FiCheckSquare />;
            case 'Offer Extended': return <FiMail />;
            case 'Offer Accepted': return <FiUserCheck />;
            case 'Offer Declined': return <FiAlertTriangle />;
            case 'Hired': return <FiCheckCircle />;
            case 'Rejected': return <FiUserX />;
            case 'Withdrawn': return <FiX />;
            default: return <FiInfo />;
        }
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
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div className="stat-title">Positive Status</div>
                            <div className="stat-value text-success">
                                {applications.filter(app => 
                                    ['Shortlisted', 'Interview Scheduled', 'Interviewed', 'Reference Check', 
                                     'Offer Extended', 'Offer Accepted', 'Hired'].includes(app.status)
                                ).length}
                            </div>
                            <div className="stat-desc">Shortlisted or further</div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-secondary">
                                <FiClock className="w-8 h-8" />
                            </div>
                            <div className="stat-title">In Process</div>
                            <div className="stat-value text-secondary">
                                {applications.filter(app => 
                                    ['Submitted', 'Under Review', 'Draft'].includes(app.status)
                                ).length}
                            </div>
                            <div className="stat-desc">Awaiting review</div>
                        </div>
                        
                        <div className="stat">
                            <div className="stat-figure text-error">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </div>
                            <div className="stat-title">Closed</div>
                            <div className="stat-value text-error">
                                {applications.filter(app => 
                                    ['Rejected', 'Withdrawn', 'Offer Declined'].includes(app.status)
                                ).length}
                            </div>
                            <div className="stat-desc">No longer active</div>
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
                                        <option value="all">All Statuses</option>
                                        <optgroup label="Initial Stage">
                                            <option value="Draft">Draft</option>
                                            <option value="Submitted">Submitted</option>
                                            <option value="Under Review">Under Review</option>
                                        </optgroup>
                                        <optgroup label="Screening Stage">
                                            <option value="Shortlisted">Shortlisted</option>
                                            <option value="Assessment">Assessment</option>
                                        </optgroup>
                                        <optgroup label="Interview Stage">
                                            <option value="Interview Scheduled">Interview Scheduled</option>
                                            <option value="Interviewed">Interviewed</option>
                                            <option value="Reference Check">Reference Check</option>
                                        </optgroup>
                                        <optgroup label="Offer Stage">
                                            <option value="Offer Extended">Offer Extended</option>
                                            <option value="Offer Accepted">Offer Accepted</option>
                                            <option value="Offer Declined">Offer Declined</option>
                                            <option value="Hired">Hired</option>
                                        </optgroup>
                                        <optgroup label="Closed">
                                            <option value="Rejected">Rejected</option>
                                            <option value="Withdrawn">Withdrawn</option>
                                        </optgroup>
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
                                                                                <div className="text-xs text-base-content/70 bg-base-200 p-2 rounded whitespace-pre-line">
                                                                                    {app.missingSkills}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {app.improvementSuggestions && (
                                                                            <div>
                                                                                <h5 className="text-sm font-semibold mb-1 text-base-content/80">How to Improve:</h5>
                                                                                <div className="text-xs text-base-content/70 bg-base-200 p-2 rounded whitespace-pre-line">
                                                                                    {app.improvementSuggestions}
                                                                                </div>
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
                                            <div className="flex gap-2">
                                                <Link to={`/viewjobpost/${app.jobPostId?._id}`} className="btn btn-primary btn-sm">
                                                    View Job
                                                </Link>
                                                <button
                                                    onClick={() => showStatusHistory(app)}
                                                    className="btn btn-outline btn-sm btn-secondary"
                                                >
                                                    <FiActivity className="mr-1" /> View Timeline
                                                </button>
                                            </div>
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

            {/* Status History Modal */}
            {showHistoryModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col animate-fadeIn">
                        <div className="p-4 border-b border-base-300 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Application History</h3>
                            <button
                                className="btn btn-sm btn-circle"
                                onClick={() => setShowHistoryModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-grow">
                            <div className="mb-4">
                                <h4 className="font-medium">
                                    {selectedApplication.jobPostId?.jobTitle || "Unknown Position"}
                                </h4>
                                <p className="text-sm text-base-content/70 mb-2">
                                    {selectedApplication.jobPostId?.company || "Unknown Company"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-base-content/60">Current Status:</span>
                                    {getStatusBadge(selectedApplication.status)}
                                </div>
                            </div>

                            <div className="divider my-4">Status Timeline</div>

                            {selectedApplication.statusHistory && selectedApplication.statusHistory.length > 0 ? (
                                <div className="relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-primary/20"></div>
                                    
                                    {/* Status history items */}
                                    <div className="space-y-6">
                                        {selectedApplication.statusHistory.slice().reverse().map((historyItem, index) => (
                                            <div key={index} className="relative pl-14">
                                                {/* Timeline dot */}
                                                <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-base-200 border-4 border-primary/20 flex items-center justify-center">
                                                    {getStatusIcon(historyItem.status)}
                                                </div>
                                                <div>
                                                    <div className="flex items-start justify-between mb-1">
                                                        <span className="font-medium text-lg">{historyItem.status}</span>
                                                        <span className="text-sm text-base-content/60">
                                                            {new Date(historyItem.changedAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    {historyItem.notes && (
                                                        <div className="bg-base-200 p-3 rounded-md text-sm text-base-content/70 mt-2">
                                                            {historyItem.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {/* Initial application */}
                                        <div className="relative pl-14">
                                            <div className="absolute left-0 top-1.5 w-10 h-10 rounded-full bg-base-200 border-4 border-primary/20 flex items-center justify-center">
                                                <FiSend />
                                            </div>
                                            <div>
                                                <div className="flex items-start justify-between mb-1">
                                                    <span className="font-medium text-lg">Application Submitted</span>
                                                    <span className="text-sm text-base-content/60">
                                                        {new Date(selectedApplication.appliedAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="bg-base-200 p-3 rounded-md text-sm text-base-content/70 mt-2">
                                                    Your application was successfully submitted to {selectedApplication.jobPostId?.company || "the company"}.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FiInfo className="mx-auto text-4xl text-base-content/30 mb-4" />
                                    <p className="text-base-content/60">No detailed status history is available for this application.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-base-300 flex justify-end">
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowHistoryModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserApplications;