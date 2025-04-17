import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FiFilter, FiSearch, FiChevronDown, FiStar, FiMail, FiPhone, FiDownload, FiCheck, FiX, FiClock, FiFileText, FiBriefcase, FiRefreshCw, FiEdit2, FiSave, FiAlertCircle, FiCalendar, FiClock as FiClockO, FiEdit3, FiUserCheck, FiUserX, FiMessageSquare, FiCheckCircle, FiAlertTriangle, FiCheckSquare } from 'react-icons/fi';

const RecruiterApplication = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        job: 'all',
        searchTerm: '',
        sortBy: 'date'
    });
    const [jobPosts, setJobPosts] = useState([]);
    const [activeApplication, setActiveApplication] = useState(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    
    // State for feedback editing
    const [isEditingMissingSkills, setIsEditingMissingSkills] = useState(false);
    const [isEditingImprovements, setIsEditingImprovements] = useState(false);
    const [editedMissingSkills, setEditedMissingSkills] = useState('');
    const [editedImprovements, setEditedImprovements] = useState('');
    const [savingFeedback, setSavingFeedback] = useState(false);
    
    // New state for bulk actions
    const [selectedApplications, setSelectedApplications] = useState([]);
    const [isBulkActionEnabled, setIsBulkActionEnabled] = useState(false);
    const [bulkStatus, setBulkStatus] = useState('');
    const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
    const [processingBulkAction, setProcessingBulkAction] = useState(false);

    // Fetch all applications for jobs created by this recruiter
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                // Get the current recruiter's ID from cookies
                const recruiterId = Cookies.get('userId');

                // First, get all job posts created by this recruiter
                const jobPostsResponse = await axios.get(`http://localhost:5000/api/jobposts?userId=${recruiterId}`);
                const recruiterJobPosts = jobPostsResponse.data;

                // Get all applications
                const applicationsResponse = await axios.get('http://localhost:5000/api/applications/');

                // Filter applications to only include those for jobs created by this recruiter
                const filteredApplications = applicationsResponse.data.filter(app =>
                    recruiterJobPosts.some(job => job._id === app.jobPostId?._id)
                );

                setApplications(filteredApplications);

                // Extract unique job posts from the filtered applications
                const uniqueJobs = [...new Set(filteredApplications.map(app =>
                    app.jobPostId?._id
                ))]
                    .filter(Boolean)
                    .map(jobId => {
                        const app = filteredApplications.find(a => a.jobPostId?._id === jobId);
                        return {
                            id: jobId,
                            title: app.jobPostId?.jobTitle || 'Unknown Job',
                            company: app.jobPostId?.company || 'Unknown Company'
                        };
                    });

                setJobPosts(uniqueJobs);
                setError(null);
            } catch (err) {
                console.error('Error fetching applications:', err);
                setError('Failed to load applications. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    // Handle status change
    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            setLoading(true);
            await axios.put(`http://localhost:5000/api/applications/${applicationId}/status`, {
                status: newStatus
            });

            // Update local state
            setApplications(applications.map(app =>
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));

            if (activeApplication && activeApplication._id === applicationId) {
                setActiveApplication({ ...activeApplication, status: newStatus });
            }

            const statusMessages = {
                'Accepted': 'Candidate has been accepted!',
                'Rejected': 'Candidate has been rejected.',
                'Pending': 'Application has been marked as pending.'
            };

            setNotification({
                show: true,
                message: statusMessages[newStatus] || `Status updated to ${newStatus}`,
                type: newStatus === 'Accepted' ? 'success' : 'info'
            });
            setTimeout(() => setNotification({ show: false }), 3000);
        } catch (err) {
            console.error('Error updating application status:', err);
            setNotification({
                show: true,
                message: 'Failed to update status. Please try again.',
                type: 'error'
            });
            setTimeout(() => setNotification({ show: false }), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Handle bulk status change
    const handleBulkStatusChange = async () => {
        if (selectedApplications.length === 0 || !bulkStatus) {
            setNotification({
                show: true,
                message: 'Please select applications and a status to update',
                type: 'error'
            });
            setTimeout(() => setNotification({ show: false }), 3000);
            return;
        }

        try {
            setProcessingBulkAction(true);
            
            // Call the bulk update API
            const result = await axios.put('http://localhost:5000/api/applications/bulk-status-update', {
                applicationIds: selectedApplications,
                status: bulkStatus
            });

            // Update local state
            setApplications(applications.map(app =>
                selectedApplications.includes(app._id) ? { ...app, status: bulkStatus } : app
            ));

            // Update active application if it's part of the bulk update
            if (activeApplication && selectedApplications.includes(activeApplication._id)) {
                setActiveApplication({ ...activeApplication, status: bulkStatus });
            }

            // Reset selections
            setSelectedApplications([]);
            setIsBulkActionEnabled(false);
            setShowBulkStatusModal(false);
            setBulkStatus('');

            // Check if there were any email failures
            if (result.data.emailErrors && result.data.emailErrors.length > 0) {
                setNotification({
                    show: true,
                    message: `Status updated, but ${result.data.emailErrors.length} email(s) failed to send. The system will retry sending emails automatically.`,
                    type: 'warning'
                });
            } else {
                setNotification({
                    show: true,
                    message: `Updated ${selectedApplications.length} application(s) to "${bulkStatus}"`,
                    type: 'success'
                });
            }
            setTimeout(() => setNotification({ show: false }), 3000);
        } catch (err) {
            console.error('Error updating application statuses in bulk:', err);
            setNotification({
                show: true,
                message: 'Failed to update applications. Please try again.',
                type: 'error'
            });
            setTimeout(() => setNotification({ show: false }), 3000);
        } finally {
            setProcessingBulkAction(false);
        }
    };

    // Toggle application selection
    const toggleApplicationSelection = (applicationId) => {
        setSelectedApplications(prevSelected => {
            if (prevSelected.includes(applicationId)) {
                return prevSelected.filter(id => id !== applicationId);
            } else {
                return [...prevSelected, applicationId];
            }
        });
    };

    // Toggle bulk action mode
    const toggleBulkActionMode = () => {
        setIsBulkActionEnabled(!isBulkActionEnabled);
        if (isBulkActionEnabled) {
            // Clear selections when disabling bulk mode
            setSelectedApplications([]);
        }
    };

    // Calculate similarity for matching
    const calculateSimilarity = async (jobId = null) => {
        try {
            // If a specific job ID is provided, filter applications for that job
            // Otherwise, process all applications for this recruiter's jobs
            const applicationsToProcess = jobId
                ? applications.filter(app => app.jobPostId?._id === jobId)
                : applications;

            if (applicationsToProcess.length === 0) {
                setNotification({
                    show: true,
                    message: 'No applications found to process',
                    type: 'error'
                });
                setTimeout(() => setNotification({ show: false }), 3000);
                return;
            }

            // Set loading state
            setLoading(true);

            // Call the process matching endpoint
            await axios.post('http://localhost:5000/api/applications/process-matching', {
                applicationIds: applicationsToProcess.map(app => app._id)
            });

            // Refresh applications to get updated similarity scores
            const response = await axios.get('http://localhost:5000/api/applications/');

            // Get current recruiter's ID
            const recruiterId = Cookies.get('userId');

            // Get all job posts created by this recruiter
            const jobPostsResponse = await axios.get(`http://localhost:5000/api/jobposts?userId=${recruiterId}`);
            const recruiterJobPosts = jobPostsResponse.data;

            // Filter applications again
            const updatedApplications = response.data.filter(app =>
                recruiterJobPosts.some(job => job._id === app.jobPostId?._id)
            );

            setApplications(updatedApplications);

            // Update the active application if it exists
            if (activeApplication) {
                const updatedActiveApp = updatedApplications.find(app => app._id === activeApplication._id);
                if (updatedActiveApp) {
                    setActiveApplication(updatedActiveApp);
                }
            }

            setNotification({
                show: true,
                message: 'Similarity scores calculated successfully!',
                type: 'success'
            });
            setTimeout(() => setNotification({ show: false }), 3000);
        } catch (error) {
            console.error('Error calculating similarity:', error);
            setNotification({
                show: true,
                message: 'Failed to calculate similarity scores. Please try again.',
                type: 'error'
            });
            setTimeout(() => setNotification({ show: false }), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Filter applications based on current filters
    const filteredApplications = applications.filter(app => {
        // Filter by status
        if (filters.status !== 'all' && app.status !== filters.status) {
            return false;
        }

        // Filter by job
        if (filters.job !== 'all' && app.jobPostId?._id !== filters.job) {
            return false;
        }

        // Filter by search term (candidate name or email)
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            const candidateName = app.resumeId?.Name?.toLowerCase() || '';
            const candidateEmail = app.resumeId?.Email?.toLowerCase() || '';

            return candidateName.includes(searchLower) || candidateEmail.includes(searchLower);
        }

        return true;
    });

    // Sort applications
    const sortedApplications = [...filteredApplications].sort((a, b) => {
        switch (filters.sortBy) {
            case 'date':
                return new Date(b.appliedAt) - new Date(a.appliedAt);
            case 'match':
                return (b.similarity || 0) - (a.similarity || 0);
            case 'name':
                return (a.resumeId?.Name || '').localeCompare(b.resumeId?.Name || '');
            default:
                return 0;
        }
    });

    // Get status badge with enhanced styling for our new statuses
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Draft':
                return <span className="badge badge-ghost gap-1"><FiEdit3 /> Draft</span>;
            case 'Submitted':
                return <span className="badge badge-info gap-1"><FiFileText /> Submitted</span>;
            case 'Under Review':
                return <span className="badge badge-primary gap-1"><FiClockO /> Under Review</span>;
            case 'Shortlisted':
                return <span className="badge badge-secondary gap-1"><FiStar /> Shortlisted</span>;
            case 'Interview Scheduled':
                return <span className="badge badge-accent gap-1"><FiCalendar /> Interview Scheduled</span>;
            case 'Interviewed':
                return <span className="badge badge-info gap-1"><FiMessageSquare /> Interviewed</span>;
            case 'Assessment':
                return <span className="badge badge-warning gap-1"><FiAlertCircle /> Assessment</span>;
            case 'Reference Check':
                return <span className="badge badge-primary gap-1"><FiCheckSquare /> Reference Check</span>;
            case 'Offer Extended':
                return <span className="badge badge-secondary gap-1"><FiMail /> Offer Extended</span>;
            case 'Offer Accepted':
                return <span className="badge badge-success gap-1"><FiUserCheck /> Offer Accepted</span>;
            case 'Offer Declined':
                return <span className="badge badge-warning gap-1"><FiAlertTriangle /> Offer Declined</span>;
            case 'Hired':
                return <span className="badge badge-success gap-1"><FiCheckCircle /> Hired</span>;
            case 'Rejected':
                return <span className="badge badge-error gap-1"><FiUserX /> Rejected</span>;
            case 'Withdrawn':
                return <span className="badge badge-error gap-1"><FiX /> Withdrawn</span>;
            default:
                return <span className="badge badge-info gap-1"><FiClock /> {status}</span>;
        }
    };

    // Get the next logical statuses for the current status
    const getNextStatuses = (currentStatus) => {
        switch (currentStatus) {
            case 'Draft':
                return ['Submitted'];
            case 'Submitted':
                return ['Under Review'];
            case 'Under Review':
                return ['Shortlisted', 'Rejected'];
            case 'Shortlisted':
                return ['Interview Scheduled', 'Assessment'];
            case 'Assessment':
                return ['Shortlisted', 'Interview Scheduled', 'Rejected'];
            case 'Interview Scheduled':
                return ['Interviewed'];
            case 'Interviewed':
                return ['Reference Check', 'Assessment', 'Rejected'];
            case 'Reference Check':
                return ['Offer Extended', 'Rejected'];
            case 'Offer Extended':
                return ['Offer Accepted', 'Offer Declined'];
            case 'Offer Accepted':
                return ['Hired'];
            case 'Offer Declined':
                return ['Rejected'];
            case 'Hired':
                return []; // Terminal state
            case 'Rejected':
                return []; // Terminal state
            case 'Withdrawn':
                return []; // Terminal state
            default:
                return [];
        }
    };

    // Get the description for each status transition
    const getStatusTransitionDescription = (targetStatus) => {
        switch (targetStatus) {
            case 'Submitted':
                return 'Confirm application is complete and ready for review';
            case 'Under Review':
                return 'Begin evaluating candidate qualifications';
            case 'Shortlisted':
                return 'Candidate meets basic qualifications and moves to next stage';
            case 'Assessment':
                return 'Assign technical or skill assessment to candidate';
            case 'Interview Scheduled':
                return 'Schedule initial or next round interview';
            case 'Interviewed':
                return 'Mark interview as completed';
            case 'Reference Check':
                return 'Begin checking candidate references';
            case 'Offer Extended':
                return 'Send job offer to candidate';
            case 'Offer Accepted':
                return 'Candidate has accepted the offer';
            case 'Offer Declined':
                return 'Candidate has declined the offer';
            case 'Hired':
                return 'Complete onboarding process for the new hire';
            case 'Rejected':
                return 'Remove candidate from consideration';
            case 'Withdrawn':
                return 'Candidate has withdrawn their application';
            default:
                return '';
        }
    };

    // Function to render next step buttons
    const renderNextStepButtons = (application, handleStatusChange) => {
        const nextStatuses = getNextStatuses(application.status);
        
        if (nextStatuses.length === 0) {
            return (
                <div className="opacity-70 italic text-sm mt-1">
                    This application is in a terminal state.
                </div>
            );
        }
        
        return (
            <div className="mt-4">
                <div className="text-xs font-semibold mb-2 text-base-content/70">Continue to iterate?</div>
                <div className="flex flex-wrap gap-2">
                    {nextStatuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(application._id, status)}
                            className={`btn btn-sm gap-1 ${
                                status === 'Rejected' || status === 'Withdrawn' || status === 'Offer Declined' 
                                    ? 'btn-error' 
                                    : status === 'Hired' || status === 'Offer Accepted' || status === 'Shortlisted'
                                        ? 'btn-success'
                                        : 'btn-primary'
                            }`}
                            title={getStatusTransitionDescription(status)}
                        >
                            {status === 'Rejected' && <FiUserX />}
                            {status === 'Shortlisted' && <FiStar />}
                            {status === 'Interview Scheduled' && <FiCalendar />}
                            {status === 'Interviewed' && <FiMessageSquare />}
                            {status === 'Assessment' && <FiAlertCircle />}
                            {status === 'Reference Check' && <FiCheckSquare />}
                            {status === 'Offer Extended' && <FiMail />}
                            {status === 'Offer Accepted' && <FiUserCheck />}
                            {status === 'Hired' && <FiCheckCircle />}
                            <span>Move to {status}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

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
            {notification.show && (
                <div className="toast toast-top toast-end z-50">
                    <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Bulk Status Update Modal */}
            {showBulkStatusModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="modal-box bg-base-100 p-6 rounded-lg shadow-xl max-w-md">
                        <h3 className="font-bold text-lg mb-4">Bulk Update Application Status</h3>
                        <p className="mb-4">Update status for {selectedApplications.length} selected application(s)</p>
                        
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text">New Status</span>
                            </label>
                            <select 
                                className="select select-bordered w-full" 
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                            >
                                <option value="" disabled>Select a status</option>
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
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                className="btn btn-outline" 
                                onClick={() => setShowBulkStatusModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleBulkStatusChange}
                                disabled={!bulkStatus || processingBulkAction}
                            >
                                {processingBulkAction ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : 'Update Applications'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-base-200 py-8 mb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-base-content">Applicant Management</h1>
                    <p className="text-base-content/70 mt-2">Review and manage all job applications</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {/* Filters Bar - Improved alignment and UI */}
                <div className="bg-gradient-to-r from-base-200 to-base-300 p-5 rounded-xl mb-8 shadow-lg">
                    {/* Top row with search and filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search bar with improved styling */}
                        <div className="relative grow min-w-[240px]">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-base-content/60">
                                <FiSearch size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search candidates by name or email..."
                                className="input input-bordered w-full pl-10 h-12 bg-base-100/90 focus:bg-base-100 transition-all"
                                value={filters.searchTerm}
                                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                            />
                        </div>

                        {/* Filter dropdown group - all same height */}
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[140px]">
                                <select
                                    className="select select-bordered w-full h-12 appearance-none pl-4 pr-10 bg-base-100/90 hover:bg-base-100 transition-all"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-base-content/60">
                                    <FiChevronDown size={16} />
                                </div>
                            </div>

                            <div className="relative min-w-[160px]">
                                <select
                                    className="select select-bordered w-full h-12 appearance-none pl-4 pr-10 bg-base-100/90 hover:bg-base-100 transition-all"
                                    value={filters.job}
                                    onChange={(e) => setFilters({ ...filters, job: e.target.value })}
                                >
                                    <option value="all">All Jobs</option>
                                    {jobPosts.map(job => (
                                        <option key={job.id} value={job.id}>
                                            {job.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-base-content/60">
                                    <FiChevronDown size={16} />
                                </div>
                            </div>

                            {/* Sort dropdown with label */}
                            <div className="flex items-center gap-2 min-w-[180px]">
                                <span className="text-sm text-base-content/70 whitespace-nowrap">Sort by:</span>
                                <div className="relative flex-1">
                                    <select
                                        className="select select-bordered w-full h-12 appearance-none pl-4 pr-10 bg-base-100/90 hover:bg-base-100 transition-all"
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    >
                                        <option value="date">Recent First</option>
                                        <option value="match">Best Match</option>
                                        <option value="name">Candidate Name</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-base-content/60">
                                        <FiChevronDown size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="ml-auto flex gap-2">
                            <button
                                className={`btn ${isBulkActionEnabled ? 'btn-error' : 'btn-secondary'} btn-sm`}
                                onClick={toggleBulkActionMode}
                            >
                                {isBulkActionEnabled ? (
                                    <>Cancel Bulk Select</>
                                ) : (
                                    <>Bulk Actions</>
                                )}
                            </button>
                            
                            {isBulkActionEnabled && selectedApplications.length > 0 && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setShowBulkStatusModal(true)}
                                >
                                    Update {selectedApplications.length} Selected
                                </button>
                            )}
                            
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => calculateSimilarity(filters.job !== 'all' ? filters.job : null)}
                                disabled={loading || applications.length === 0}
                            >
                                <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Calculate similarity
                            </button>
                        </div>
                    </div>

                    {/* Bottom row with results count and filter badge */}
                    <div className="flex items-center justify-between mt-4 text-sm">
                        <div className="text-base-content/70 flex items-center gap-2">
                            <FiFilter size={14} />
                            <span>Showing <span className="font-medium text-primary">{filteredApplications.length}</span> of {applications.length} applications</span>
                        </div>

                        {/* Optional: Add filter badges */}
                        <div className="flex gap-2">
                            {filters.status !== 'all' && (
                                <span className="badge badge-primary badge-sm">
                                    Status: {filters.status}
                                    <button className="ml-1" onClick={() => setFilters({ ...filters, status: 'all' })}>×</button>
                                </span>
                            )}
                            {filters.job !== 'all' && (
                                <span className="badge badge-primary badge-sm">
                                    Job: {jobPosts.find(j => j.id === filters.job)?.title || 'Selected Job'}
                                    <button className="ml-1" onClick={() => setFilters({ ...filters, job: 'all' })}>×</button>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {sortedApplications.length === 0 ? (
                    <div className="text-center py-16 bg-base-200 rounded-lg">
                        <FiFileText className="mx-auto text-5xl text-base-content/30" />
                        <h3 className="mt-4 text-xl font-medium">No applications found</h3>
                        <p className="text-base-content/70 max-w-md mx-auto mt-2">
                            No candidates match your current filters. Try adjusting your search criteria.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Applications List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FiFileText className="text-primary" /> Applications
                                {isBulkActionEnabled && (
                                    <span className="text-sm font-normal text-base-content/70">
                                        ({selectedApplications.length} selected)
                                    </span>
                                )}
                            </h2>

                            <div className="bg-base-200 rounded-lg overflow-hidden shadow-md">
                                <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                                    {sortedApplications.map(application => (
                                        <div
                                            key={application._id}
                                            onClick={() => isBulkActionEnabled 
                                                ? toggleApplicationSelection(application._id) 
                                                : setActiveApplication(application)
                                            }
                                            className={`border-b border-base-300 p-4 cursor-pointer hover:bg-base-300/50 transition-colors ${
                                                isBulkActionEnabled && selectedApplications.includes(application._id) 
                                                    ? 'bg-primary/20 border-l-4 border-l-primary' 
                                                    : !isBulkActionEnabled && activeApplication?._id === application._id
                                                    ? 'bg-primary/10 border-l-4 border-l-primary'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    {isBulkActionEnabled && (
                                                        <input 
                                                            type="checkbox" 
                                                            className="checkbox checkbox-sm checkbox-primary"
                                                            checked={selectedApplications.includes(application._id)}
                                                            onChange={() => toggleApplicationSelection(application._id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="font-medium">
                                                            {application.resumeId?.Name || "Unknown Candidate"}
                                                        </h3>
                                                        <p className="text-sm text-base-content/70">
                                                            {application.jobPostId?.jobTitle || "Unknown Position"}
                                                        </p>
                                                        <p className="text-xs text-base-content/50 mt-1">
                                                            Applied {formatDate(application.appliedAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    {getStatusBadge(application.status)}
                                                    {application.similarity > 0 && (
                                                        <span className="text-xs mt-1 text-primary font-medium">
                                                            {Math.round(application.similarity)}% match
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Application Details */}
                        <div className="lg:col-span-2">
                            {activeApplication ? (
                                <div className="space-y-6">
                                    <div className={`bg-base-200 rounded-lg shadow-md ${activeApplication.status === 'Accepted' ? 'border-l-4 border-success' :
                                        activeApplication.status === 'Rejected' ? 'border-l-4 border-error' :
                                            'border-l-4 border-warning'
                                        }`}>
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                                                <div>
                                                    <h2 className="text-2xl font-bold">
                                                        {activeApplication.resumeId?.Name || "Unknown Candidate"}
                                                    </h2>
                                                    <p className="text-primary">
                                                        {activeApplication.jobPostId?.jobTitle || "Unknown Position"}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="dropdown dropdown-end">
                                                        <label tabIndex={0} className="btn btn-primary">
                                                            Update Status <FiChevronDown className="ml-1" />
                                                        </label>
                                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto">
                                                            <li className="menu-title pt-2 pb-1">
                                                                <span>Initial Stage</span>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Submitted')}>
                                                                    <FiFileText className="text-info" />Submitted
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Under Review')}>
                                                                    <FiClockO className="text-primary" />Under Review
                                                                </button>
                                                            </li>
                                                            
                                                            <li className="menu-title pt-3 pb-1">
                                                                <span>Screening Stage</span>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Shortlisted')}>
                                                                    <FiStar className="text-secondary" />Shortlisted
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Assessment')}>
                                                                    <FiAlertCircle className="text-warning" />Assessment
                                                                </button>
                                                            </li>
                                                            
                                                            <li className="menu-title pt-3 pb-1">
                                                                <span>Interview Stage</span>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Interview Scheduled')}>
                                                                    <FiCalendar className="text-accent" />Interview Scheduled
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Interviewed')}>
                                                                    <FiMessageSquare className="text-info" />Interviewed
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Reference Check')}>
                                                                    <FiCheckSquare className="text-primary" />Reference Check
                                                                </button>
                                                            </li>
                                                            
                                                            <li className="menu-title pt-3 pb-1">
                                                                <span>Offer Stage</span>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Offer Extended')}>
                                                                    <FiMail className="text-secondary" />Offer Extended
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Offer Accepted')}>
                                                                    <FiUserCheck className="text-success" />Offer Accepted
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Offer Declined')}>
                                                                    <FiAlertTriangle className="text-warning" />Offer Declined
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Hired')}>
                                                                    <FiCheckCircle className="text-success" />Hired
                                                                </button>
                                                            </li>
                                                            
                                                            <li className="menu-title pt-3 pb-1">
                                                                <span>Closed</span>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Rejected')}>
                                                                    <FiUserX className="text-error" />Rejected
                                                                </button>
                                                            </li>
                                                            <li>
                                                                <button className="flex items-center gap-2"
                                                                    onClick={() => handleStatusChange(activeApplication._id, 'Withdrawn')}>
                                                                    <FiX className="text-error" />Withdrawn
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-base-content/80 mb-2">Contact Information</h3>
                                                    <div className="bg-base-300/50 p-4 rounded-md">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FiMail className="text-primary" />
                                                            <a href={`mailto:${activeApplication.resumeId?.Email}`} className="hover:underline">
                                                                {activeApplication.resumeId?.Email || "No email provided"}
                                                            </a>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FiPhone className="text-primary" />
                                                            <span>{activeApplication.resumeId?.Phone || "No phone provided"}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-base-content/80 mb-2">Application Details</h3>
                                                    <div className="bg-base-300/50 p-4 rounded-md">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-base-content/70">Status:</span>
                                                            {getStatusBadge(activeApplication.status)}
                                                        </div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-base-content/70">Applied On:</span>
                                                            <span>{formatDate(activeApplication.appliedAt)}</span>
                                                        </div>
                                                        {activeApplication.similarity > 0 && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-base-content/70">Match Score:</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-32 bg-base-300 rounded-full h-2">
                                                                        <div className="bg-primary h-2 rounded-full" style={{ width: `${activeApplication.similarity}%` }}></div>
                                                                    </div>
                                                                    <span className="text-sm">{Math.round(activeApplication.similarity)}%</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Show missing skills and improvement suggestions if similarity is less than 100% */}
                                                        {activeApplication.similarity > 0 && activeApplication.similarity < 100 && (
                                                            <div className="mt-4 border-t border-base-300 pt-4">
                                                                {/* Missing Skills Section with Edit Button */}
                                                                <div className="mb-3">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className="text-sm font-semibold text-base-content/80">Missing Requirements:</span>
                                                                        <button 
                                                                            className="btn btn-xs btn-ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditedMissingSkills(activeApplication.missingSkills || '');
                                                                                setIsEditingMissingSkills(true);
                                                                            }}
                                                                        >
                                                                            <FiEdit2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                    {!isEditingMissingSkills ? (
                                                                        <div className="bg-base-200 p-2 rounded text-xs text-base-content/70 whitespace-pre-line">
                                                                            {activeApplication.missingSkills || "No missing skills identified."}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            <textarea
                                                                                className="textarea textarea-bordered w-full text-xs"
                                                                                value={editedMissingSkills}
                                                                                onChange={(e) => setEditedMissingSkills(e.target.value)}
                                                                                rows={4}
                                                                                placeholder="Enter missing skills..."
                                                                            ></textarea>
                                                                            <div className="flex justify-end gap-2">
                                                                                <button 
                                                                                    className="btn btn-xs btn-ghost"
                                                                                    onClick={() => setIsEditingMissingSkills(false)}
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                                <button 
                                                                                    className="btn btn-xs btn-primary"
                                                                                    onClick={async () => {
                                                                                        try {
                                                                                            setSavingFeedback(true);
                                                                                            await axios.put(
                                                                                                `http://localhost:5000/api/applications/${activeApplication._id}/feedback`,
                                                                                                { missingSkills: editedMissingSkills }
                                                                                            );
                                                                                            
                                                                                            // Update local state
                                                                                            const updatedApp = { ...activeApplication, missingSkills: editedMissingSkills };
                                                                                            setActiveApplication(updatedApp);
                                                                                            
                                                                                            setApplications(applications.map(app => 
                                                                                                app._id === activeApplication._id ? updatedApp : app
                                                                                            ));
                                                                                            
                                                                                            setIsEditingMissingSkills(false);
                                                                                            setNotification({
                                                                                                show: true,
                                                                                                message: 'Missing skills updated successfully',
                                                                                                type: 'success'
                                                                                            });
                                                                                            setTimeout(() => setNotification({ show: false }), 3000);
                                                                                        } catch (error) {
                                                                                            console.error('Error updating missing skills:', error);
                                                                                            setNotification({
                                                                                                show: true,
                                                                                                message: 'Failed to update missing skills',
                                                                                                type: 'error'
                                                                                            });
                                                                                            setTimeout(() => setNotification({ show: false }), 3000);
                                                                                        } finally {
                                                                                            setSavingFeedback(false);
                                                                                        }
                                                                                    }}
                                                                                    disabled={savingFeedback}
                                                                                >
                                                                                    {savingFeedback ? (
                                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                                    ) : (
                                                                                        <FiSave size={14} className="mr-1" />
                                                                                    )}
                                                                                    Save
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Improvement Suggestions Section with Edit Button */}
                                                                <div>
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <span className="text-sm font-semibold text-base-content/80">Candidate Feedback:</span>
                                                                        <button 
                                                                            className="btn btn-xs btn-ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setEditedImprovements(activeApplication.improvementSuggestions || '');
                                                                                setIsEditingImprovements(true);
                                                                            }}
                                                                        >
                                                                            <FiEdit2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                    {!isEditingImprovements ? (
                                                                        <div className="bg-base-200 p-2 rounded text-xs text-base-content/70 whitespace-pre-line">
                                                                            {activeApplication.improvementSuggestions || "No improvement suggestions available."}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            <textarea
                                                                                className="textarea textarea-bordered w-full text-xs"
                                                                                value={editedImprovements}
                                                                                onChange={(e) => setEditedImprovements(e.target.value)}
                                                                                rows={4}
                                                                                placeholder="Enter improvement suggestions..."
                                                                            ></textarea>
                                                                            <div className="flex justify-end gap-2">
                                                                                <button 
                                                                                    className="btn btn-xs btn-ghost"
                                                                                    onClick={() => setIsEditingImprovements(false)}
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                                <button 
                                                                                    className="btn btn-xs btn-primary"
                                                                                    onClick={async () => {
                                                                                        try {
                                                                                            setSavingFeedback(true);
                                                                                            await axios.put(
                                                                                                `http://localhost:5000/api/applications/${activeApplication._id}/feedback`,
                                                                                                { improvementSuggestions: editedImprovements }
                                                                                            );
                                                                                            
                                                                                            // Update local state
                                                                                            const updatedApp = { ...activeApplication, improvementSuggestions: editedImprovements };
                                                                                            setActiveApplication(updatedApp);
                                                                                            
                                                                                            setApplications(applications.map(app => 
                                                                                                app._id === activeApplication._id ? updatedApp : app
                                                                                            ));
                                                                                            
                                                                                            setIsEditingImprovements(false);
                                                                                            setNotification({
                                                                                                show: true,
                                                                                                message: 'Improvement suggestions updated successfully',
                                                                                                type: 'success'
                                                                                            });
                                                                                            setTimeout(() => setNotification({ show: false }), 3000);
                                                                                        } catch (error) {
                                                                                            console.error('Error updating improvement suggestions:', error);
                                                                                            setNotification({
                                                                                                show: true,
                                                                                                message: 'Failed to update improvement suggestions',
                                                                                                type: 'error'
                                                                                            });
                                                                                            setTimeout(() => setNotification({ show: false }), 3000);
                                                                                        } finally {
                                                                                            setSavingFeedback(false);
                                                                                        }
                                                                                    }}
                                                                                    disabled={savingFeedback}
                                                                                >
                                                                                    {savingFeedback ? (
                                                                                        <span className="loading loading-spinner loading-xs"></span>
                                                                                    ) : (
                                                                                        <FiSave size={14} className="mr-1" />
                                                                                    )}
                                                                                    Save
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Skills Section */}
                                            {activeApplication.resumeId?.Skills?.length > 0 && (
                                                <div className="mb-6">
                                                    <h3 className="text-sm font-medium text-base-content/80 mb-2">Skills</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {activeApplication.resumeId.Skills.map((skill, idx) => (
                                                            <span key={idx} className="badge badge-outline">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Resume Sections */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Education Section */}
                                                {activeApplication.resumeId?.Education?.length > 0 && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-base-content/80 mb-2">Education</h3>
                                                        <div className="bg-base-300/30 p-4 rounded-md">
                                                            {activeApplication.resumeId.Education.map((edu, idx) => (
                                                                <div key={idx} className={idx !== 0 ? "mt-4 pt-4 border-t border-base-300" : ""}>
                                                                    <p className="font-medium">{edu.Degree || edu.degree}</p>
                                                                    <p className="text-sm">{edu.University || edu.institution}</p>
                                                                    {(edu.startDate || edu.endDate) && (
                                                                        <p className="text-xs text-base-content/60 mt-1">
                                                                            {edu.startDate && formatDate(edu.startDate)}
                                                                            {edu.startDate && edu.endDate && " - "}
                                                                            {edu.endDate && formatDate(edu.endDate)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Experience Section */}
                                                {activeApplication.resumeId?.Experience?.length > 0 && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-base-content/80 mb-2">Experience</h3>
                                                        <div className="bg-base-300/30 p-4 rounded-md">
                                                            {activeApplication.resumeId.Experience.map((exp, idx) => (
                                                                <div key={idx} className={idx !== 0 ? "mt-4 pt-4 border-t border-base-300" : ""}>
                                                                    <p className="font-medium">{exp.Title || exp.position}</p>
                                                                    <p className="text-sm">{exp.Company || exp.company}</p>
                                                                    {exp.description && (
                                                                        <p className="text-xs mt-1 text-base-content/70">{exp.description}</p>
                                                                    )}
                                                                    {(exp.startDate || exp.endDate) && (
                                                                        <p className="text-xs text-base-content/60 mt-1">
                                                                            {exp.startDate && formatDate(exp.startDate)}
                                                                            {exp.startDate && exp.endDate && " - "}
                                                                            {exp.endDate && formatDate(exp.endDate)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-medium text-base-content/80 mb-2">Status History</h3>
                                                <div className="bg-base-300/50 p-4 rounded-md">
                                                    {activeApplication.statusHistory && activeApplication.statusHistory.length > 0 ? (
                                                        <div className="relative">
                                                            {/* Timeline line */}
                                                            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-base-content/20"></div>
                                                            
                                                            {/* Status history items */}
                                                            <div className="space-y-4 ml-6">
                                                                {activeApplication.statusHistory.slice().reverse().map((historyItem, index) => (
                                                                    <div key={index} className="relative">
                                                                        {/* Timeline dot */}
                                                                        <div className="absolute -left-[22px] mt-1 w-4 h-4 rounded-full bg-primary"></div>
                                                                        <div className="mb-1 flex items-start justify-between">
                                                                            <span className="font-medium">{historyItem.status}</span>
                                                                            <span className="text-xs text-base-content/60">
                                                                                {new Date(historyItem.changedAt).toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        {historyItem.notes && (
                                                                            <p className="text-xs text-base-content/70">{historyItem.notes}</p>
                                                                        )}
                                                                        {historyItem.changedBy && historyItem.changedBy.name && (
                                                                            <p className="text-xs text-base-content/60 mt-1">
                                                                                By: {historyItem.changedBy.name}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-base-content/60">No status history available</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-between mt-8">
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => setShowResumeModal(true)}
                                                >
                                                    <FiFileText className="mr-2" /> View Full Resume
                                                </button>

                                                <div className="flex gap-2">
                                                    <button className="btn btn-primary btn-outline">
                                                        <FiMail className="mr-2" /> Email Candidate
                                                    </button>
                                                    <button className="btn btn-primary">
                                                        <FiStar className="mr-2" /> Schedule Interview
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Render next step buttons */}
                                            {renderNextStepButtons(activeApplication, handleStatusChange)}
                                        </div>
                                    </div>

                                    <div className="bg-base-200 p-6 rounded-lg shadow-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2">
                                                <FiBriefcase className="text-primary" /> Job Details
                                            </h3>

                                            {/* Add Calculate Similarity button */}
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => calculateSimilarity(activeApplication?.jobPostId?._id)}
                                                disabled={loading || !activeApplication?.jobPostId?._id}
                                            >
                                                <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                                                Calculate Similarity
                                            </button>
                                        </div>

                                        {/* Rest of the job details section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-medium mb-2">{activeApplication.jobPostId?.jobTitle}</h4>
                                                <p className="text-sm text-base-content/70 mb-4">{activeApplication.jobPostId?.company}</p>

                                                {activeApplication.jobPostId?.skills?.length > 0 && (
                                                    <div className="mb-4">
                                                        <h5 className="text-sm font-medium mb-2">Required Skills:</h5>
                                                        <div className="flex flex-wrap gap-1">
                                                            {activeApplication.jobPostId.skills.map((skill, idx) => (
                                                                <span key={idx} className="badge badge-sm">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-base-300/30 p-4 rounded-md">
                                                <h5 className="text-sm font-medium mb-2">Job Description:</h5>
                                                <p className="text-sm text-base-content/80">
                                                    {activeApplication.jobPostId?.jobDescription?.substring(0, 300)}
                                                    {activeApplication.jobPostId?.jobDescription?.length > 300 ? "..." : ""}
                                                </p>
                                                <button className="btn btn-sm btn-ghost mt-2">Read More</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-96 bg-base-200 rounded-lg">
                                    <FiFileText className="text-6xl text-base-content/20 mb-4" />
                                    <h3 className="text-xl font-medium text-base-content/70">Select an application to view details</h3>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Resume View Modal */}
            {showResumeModal && activeApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-base-300 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Resume: {activeApplication.resumeId?.Name}</h3>
                            <button
                                className="btn btn-sm btn-circle"
                                onClick={() => setShowResumeModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-grow">
                            {/* Resume Content */}
                            <div className="max-w-3xl mx-auto">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold">{activeApplication.resumeId?.Name}</h2>
                                    <p className="text-base-content/70">{activeApplication.resumeId?.Email} • {activeApplication.resumeId?.Phone}</p>
                                    {activeApplication.resumeId?.Department && (
                                        <p className="text-base-content/70">{activeApplication.resumeId.Department}</p>
                                    )}
                                </div>

                                {/* Skills */}
                                {activeApplication.resumeId?.Skills?.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold border-b pb-2 mb-4">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {activeApplication.resumeId.Skills.map((skill, idx) => (
                                                <span key={idx} className="badge badge-lg">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Experience */}
                                {activeApplication.resumeId?.Experience?.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold border-b pb-2 mb-4">Professional Experience</h3>
                                        {activeApplication.resumeId.Experience.map((exp, idx) => (
                                            <div key={idx} className="mb-6">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-lg font-semibold">
                                                        {exp.Title || exp.position}
                                                    </h4>
                                                    <span className="text-sm text-base-content/70">
                                                        {exp.startDate && formatDate(exp.startDate)}
                                                        {exp.startDate && exp.endDate && " - "}
                                                        {exp.endDate && formatDate(exp.endDate)}
                                                    </span>
                                                </div>
                                                <h5 className="text-base font-medium text-primary">
                                                    {exp.Company || exp.company}
                                                </h5>
                                                {exp.description && (
                                                    <p className="mt-2 text-base-content/80">{exp.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Education */}
                                {activeApplication.resumeId?.Education?.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold border-b pb-2 mb-4">Education</h3>
                                        {activeApplication.resumeId.Education.map((edu, idx) => (
                                            <div key={idx} className="mb-6">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-lg font-semibold">
                                                        {edu.Degree || edu.degree}
                                                    </h4>
                                                    <span className="text-sm text-base-content/70">
                                                        {edu.startDate && formatDate(edu.startDate)}
                                                        {edu.startDate && edu.endDate && " - "}
                                                        {edu.endDate && formatDate(edu.endDate)}
                                                    </span>
                                                </div>
                                                <h5 className="text-base font-medium text-primary">
                                                    {edu.University || edu.institution}
                                                </h5>
                                                {edu.grade && (
                                                    <p className="mt-1 text-sm text-base-content/70">GPA: {edu.grade}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-base-300 flex justify-between">
                            <button className="btn btn-outline" onClick={() => setShowResumeModal(false)}>
                                Close
                            </button>
                            <button className="btn btn-primary">
                                <FiDownload className="mr-2" /> Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterApplication;
