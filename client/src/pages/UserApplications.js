import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FiTrash2, FiBriefcase, FiCalendar, FiCheck, FiClock, FiX, FiFileText } from 'react-icons/fi';

const UserApplications = () => {
    const { userId } = useParams();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        } catch (error) {
            console.error('Error deleting application:', error);
            alert('Failed to withdraw application. Please try again.');
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
        <div className="min-h-screen bg-base-100 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-base-content mb-8">Your Applications</h2>

                {applications.length === 0 ? (
                    <div className="bg-base-200 rounded-lg p-12 text-center">
                        <FiBriefcase className="w-16 h-16 mx-auto text-base-content opacity-30" />
                        <h3 className="text-xl font-medium mt-4 mb-2">No Applications Yet</h3>
                        <p className="text-base-content/70 max-w-md mx-auto mb-6">
                            You haven't applied to any jobs yet. Start browsing available positions and submit your first application!
                        </p>
                        <Link to="/candidatehome" className="btn btn-primary">
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map(app => (
                            <div key={app._id} className="bg-base-200 rounded-lg shadow-lg overflow-hidden border border-base-300 group">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold">
                                                {app.jobPostId?.jobTitle || "Unknown Job"}
                                            </h3>
                                            <p className="text-base-content/70">
                                                {app.jobPostId?.company || "Unknown Company"}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                            {getStatusBadge(app.status)}
                                            <span className="text-sm text-base-content/60 flex items-center gap-1">
                                                <FiCalendar /> Applied on {formatDate(app.appliedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6 mt-4">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-base-content/80 mb-2">Job Details</h4>
                                            <div className="bg-base-300/50 p-3 rounded-md">
                                                {app.jobPostId?.department && (
                                                    <div className="flex gap-2 items-center mb-2">
                                                        <FiBriefcase className="text-primary" />
                                                        <span>{app.jobPostId.department}</span>
                                                    </div>
                                                )}
                                                <div className="flex gap-2 items-center">
                                                    <FiFileText className="text-primary" />
                                                    <span>
                                                        {app.jobPostId?.jobDescription?.substring(0, 100)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-base-content/80 mb-2">Resume Used</h4>
                                            <div className="bg-base-300/50 p-3 rounded-md">
                                                <p className="font-medium">
                                                    {app.resumeId?.Name || "Resume"}
                                                </p>
                                                {app.similarity > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-sm mb-1">Match Score:</p>
                                                        <div className="w-full bg-base-300 rounded-full h-2.5">
                                                            <div
                                                                className="bg-primary h-2.5 rounded-full"
                                                                style={{ width: `${app.similarity}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-right mt-1">{app.similarity}% match</p>
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
                                        className="btn btn-error btn-sm btn-outline"
                                    >
                                        <FiTrash2 className="mr-1" /> Withdraw Application
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserApplications;