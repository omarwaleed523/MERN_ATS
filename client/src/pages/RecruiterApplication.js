import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFilter, FiSearch, FiChevronDown, FiStar, FiMail, FiPhone, FiDownload, FiCheck, FiX, FiClock, FiFileText, FiBriefcase } from 'react-icons/fi';

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

    // Fetch all applications
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/applications/');
                setApplications(response.data);

                // Extract unique job posts
                const uniqueJobs = [...new Set(response.data.map(app =>
                    app.jobPostId?._id
                ))]
                    .filter(Boolean)
                    .map(jobId => {
                        const app = response.data.find(a => a.jobPostId?._id === jobId);
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
            await axios.patch(`http://localhost:5000/api/applications/${applicationId}/status`, {
                status: newStatus
            });

            // Update local state
            setApplications(applications.map(app =>
                app._id === applicationId ? { ...app, status: newStatus } : app
            ));

            if (activeApplication && activeApplication._id === applicationId) {
                setActiveApplication({ ...activeApplication, status: newStatus });
            }
        } catch (err) {
            console.error('Error updating application status:', err);
            alert('Failed to update status. Please try again.');
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
            <div className="bg-base-200 py-8 mb-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-base-content">Applicant Management</h1>
                    <p className="text-base-content/70 mt-2">Review and manage all job applications</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {/* Filters Bar */}
                <div className="bg-base-200 p-4 rounded-lg mb-8 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-1 flex-col sm:flex-row gap-3">
                            <div className="form-control flex-1">
                                <div className="input-group">
                                    <span className="bg-base-300">
                                        <FiSearch />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search candidates..."
                                        className="input input-bordered w-full"
                                        value={filters.searchTerm}
                                        onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <select
                                    className="select select-bordered"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="all">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Accepted">Accepted</option>
                                    <option value="Rejected">Rejected</option>
                                </select>

                                <select
                                    className="select select-bordered"
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
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-base-content/70">Sort by:</span>
                            <select
                                className="select select-bordered select-sm"
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            >
                                <option value="date">Recent First</option>
                                <option value="match">Best Match</option>
                                <option value="name">Candidate Name</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-base-content/70">
                            Showing {filteredApplications.length} of {applications.length} applications
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
                            </h2>

                            <div className="bg-base-200 rounded-lg overflow-hidden shadow-md">
                                <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                                    {sortedApplications.map(application => (
                                        <div
                                            key={application._id}
                                            onClick={() => setActiveApplication(application)}
                                            className={`border-b border-base-300 p-4 cursor-pointer hover:bg-base-300/50 transition-colors ${activeApplication?._id === application._id ? 'bg-primary/10 border-l-4 border-l-primary' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
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
                                    <div className="bg-base-200 rounded-lg shadow-md">
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
                                                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                                            <li><button onClick={() => handleStatusChange(activeApplication._id, 'Pending')}>Mark as Pending</button></li>
                                                            <li><button onClick={() => handleStatusChange(activeApplication._id, 'Accepted')}>Accept Candidate</button></li>
                                                            <li><button onClick={() => handleStatusChange(activeApplication._id, 'Rejected')}>Reject Candidate</button></li>
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
                                        </div>
                                    </div>

                                    <div className="bg-base-200 p-6 rounded-lg shadow-md">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <FiBriefcase className="text-primary" /> Job Details
                                        </h3>
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
