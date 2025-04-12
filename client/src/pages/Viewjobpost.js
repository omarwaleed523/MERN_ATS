import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, isCookie } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FiBriefcase, FiMapPin, FiDollarSign, FiCalendar, FiStar, FiAward, FiCheckCircle, FiFile, FiMail, FiPhone, FiAlertCircle, FiUser } from 'react-icons/fi';

const Viewjobpost = () => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [applying, setApplying] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const { id } = useParams();
    const navigate = useNavigate();

    // Get current user from cookies

    const userId = Cookies.get('userId') ? Cookies.get('userId') : null;
    console.log(userId);
    // Fetch job details
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/jobposts/${id}`);
                setJob(response.data);
            } catch (err) {
                console.error('Error fetching job:', err);
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    // Fetch user's resumes when modal is opened
    const handleOpenModal = async () => {
        if (!userId) {
            setNotification({
                show: true,
                message: 'Please log in to apply for jobs',
                type: 'error'
            });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        setIsModalOpen(true);
        setLoadingResumes(true);

        try {
            const response = await axios.get('http://localhost:5000/api/resumes/user/' + userId);
            setResumes(response.data);
        } catch (error) {
            console.error('Error fetching resumes:', error);
        } finally {
            setLoadingResumes(false);
        }
    };

    const handleResumeSelect = (resumeId) => {
        setSelectedResumeId(resumeId);
    };

    const handleApply = async () => {
        if (!selectedResumeId) {
            setNotification({
                show: true,
                message: 'Please select a resume',
                type: 'error'
            });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        setApplying(true);

        try {
            await axios.post('http://localhost:5000/api/applications/apply', {
                userId: userId,
                recruiterId: job.userId, // Add the recruiter ID from the job posting
                resumeId: selectedResumeId,
                jobPostId: id
            });

            // Close modal and show success notification
            setIsModalOpen(false);
            setNotification({
                show: true,
                message: 'Application submitted successfully!',
                type: 'success'
            });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error applying for job:', error);
            setNotification({
                show: true,
                message: 'Failed to submit application. Please try again.',
                type: 'error'
            });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } finally {
            setApplying(false);
            setSelectedResumeId(null);
        }
    };

    const formatSalary = (salary) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(salary);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="alert alert-error">
                    <FiAlertCircle className="h-6 w-6" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8">
            {/* Notification Toast */}
            {notification.show && (
                <div className={`toast toast-top toast-end z-50`}>
                    <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Application Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
                    <div className="bg-base-100 rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Apply for {job.jobTitle}</h3>
                            <p className="text-base-content/70 mb-6">Select a resume to apply with:</p>

                            {loadingResumes ? (
                                <div className="flex justify-center py-8">
                                    <span className="loading loading-spinner loading-md text-primary"></span>
                                </div>
                            ) : resumes.length === 0 ? (
                                <div className="text-center py-6 bg-base-200 rounded-lg">
                                    <FiFile className="mx-auto text-4xl text-base-content/40 mb-2" />
                                    <p className="text-base-content/70">You don't have any resumes yet.</p>
                                    <button
                                        className="btn btn-primary btn-sm mt-4"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            navigate('/parseresume');
                                        }}
                                    >
                                        Upload Resume
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {resumes.map((resume) => (
                                        <div
                                            key={resume._id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary ${selectedResumeId === resume._id ? 'border-primary bg-primary/5' : ''}`}
                                            onClick={() => handleResumeSelect(resume._id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-6 h-6 rounded-full border ${selectedResumeId === resume._id ? 'border-primary' : 'border-gray-300'} flex items-center justify-center flex-shrink-0 mt-1`}>
                                                    {selectedResumeId === resume._id && (
                                                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-base-content">{resume.Name || 'Unnamed Resume'}</h4>
                                                    <p className="text-sm text-base-content/70 flex items-center gap-1 mt-1">
                                                        <FiMail className="text-xs" /> {resume.Email}
                                                    </p>
                                                    {resume.Skills && resume.Skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {resume.Skills.slice(0, 3).map((skill, idx) => (
                                                                <span key={idx} className="badge badge-xs badge-outline">{skill}</span>
                                                            ))}
                                                            {resume.Skills.length > 3 && (
                                                                <span className="badge badge-xs">+{resume.Skills.length - 3}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-base-200 p-4 rounded-b-lg flex justify-end gap-3">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setIsModalOpen(false)}
                                disabled={applying}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleApply}
                                disabled={!selectedResumeId || applying || resumes.length === 0}
                            >
                                {applying ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Applying...
                                    </>
                                ) : (
                                    'Apply Now'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="bg-base-200 py-12 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="avatar">
                                    <div className="w-16 h-16 rounded-xl">
                                        <img src={`https://ui-avatars.com/api/?name=${job?.company}&background=random`} alt={job?.company} />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-base-content mb-2">{job?.jobTitle}</h1>
                                    <p className="text-base-content/70 text-lg">{job?.company}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <span className="badge badge-primary badge-lg gap-2">
                                    <FiDollarSign /> {formatSalary(job?.salary)}
                                </span>
                                <span className="badge badge-ghost badge-lg gap-2">
                                    <FiBriefcase /> {job?.department}
                                </span>
                                {job?.location && (
                                    <span className="badge badge-ghost badge-lg gap-2">
                                        <FiMapPin /> {job?.location}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button
                                className="btn btn-primary flex-1 md:flex-none"
                                onClick={handleOpenModal}
                            >
                                Apply now
                            </button>
                            <button className="btn btn-outline btn-primary flex-1 md:flex-none">Save Job</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <div className="bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title text-2xl text-base-content mb-4">About the role</h2>
                                <p className="text-base-content/80 whitespace-pre-line">{job?.jobDescription}</p>
                            </div>
                        </div>

                        {/* Requirements Section */}
                        <div className="bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title text-2xl text-base-content mb-4">Required Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {job?.skills?.map((skill, index) => (
                                        <span key={index} className="badge text-base badge-primary badge-outline">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className="bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title text-2xl text-base-content mb-4">Experience Requirements</h2>
                                <ul className="space-y-4">
                                    {job?.experience?.map((exp, index) => (
                                        <li key={index} className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <span className="badge badge-primary badge-outline p-3">{index + 1}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-base-content">{exp.title}</h3>
                                                <p className="text-base-content/70">{exp.description}</p>
                                                <p className="text-sm text-base-content/60 mt-1">{exp.dates}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Education Section */}
                        <div className="bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title text-2xl text-base-content mb-4">Education Requirements</h2>
                                <ul className="space-y-4">
                                    {job?.education?.map((edu, index) => (
                                        <li key={index} className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <FiAward className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-base-content">{edu.degree}</h3>
                                                <p className="text-base-content/70">{edu.university}</p>
                                                {edu.location && (
                                                    <p className="text-sm text-base-content/60 mt-1">{edu.location}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Company Info & Quick Actions */}
                    <div className="space-y-6">
                        {/* Company Card */}
                        <div className="bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title text-2xl text-base-content mb-4">About {job?.company}</h2>
                                <div className="space-y-4">
                                    {/* Recruiter Information */}
                                    <div className="flex items-center gap-3">
                                        <FiUser className="text-primary" />
                                        <div>
                                            <p className="text-sm text-base-content/60">Posted by</p>
                                            <p className="text-base-content">{job?.userId?.name || 'Unknown Recruiter'}</p>
                                            {job?.userId?.company && (
                                                <span className="badge badge-outline mt-1">{job.userId.company}</span>
                                            )}
                                        </div>
                                    </div>
                                    {job?.userId?.email && (
                                        <div className="flex items-center gap-3">
                                            <FiMail className="text-primary" />
                                            <div>
                                                <p className="text-sm text-base-content/60">Contact</p>
                                                <a href={`mailto:${job.userId.email}`} className="text-base-content hover:text-primary transition-colors">
                                                    {job.userId.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <FiCalendar className="text-primary" />
                                        <div>
                                            <p className="text-sm text-base-content/60">Founded</p>
                                            <p className="text-base-content">January 11, 2005</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FiMapPin className="text-primary" />
                                        <div>
                                            <p className="text-sm text-base-content/60">Location</p>
                                            <p className="text-base-content">{job?.location || 'Remote'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FiStar className="text-primary" />
                                        <div>
                                            <p className="text-sm text-base-content/60">Department</p>
                                            <p className="text-base-content">{job?.department}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Apply Card */}
                        <div className="bg-primary text-primary-content">
                            <div className="card-body">
                                <h3 className="card-title text-2xl mb-4">Quick Apply</h3>
                                <p className="mb-6">Submit your application now and hear back in 2-3 business days</p>
                                <button
                                    className="btn btn-secondary w-full"
                                    onClick={handleOpenModal}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>

                        {/* Similar Jobs Card */}
                        <div className="bg-base-200">
                            <div className="card-body">
                                <h3 className="card-title text-2xl text-base-content mb-4">Similar Jobs</h3>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((_, index) => (
                                        <button key={index} className="btn btn-ghost w-full justify-start gap-4">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral text-neutral-content rounded-lg w-12">
                                                    <span>JD</span>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">Similar Position</p>
                                                <p className="text-sm text-base-content/60">Company Name</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Viewjobpost;