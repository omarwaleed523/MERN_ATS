import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiCalendar, FiStar, FiAward, FiCheckCircle } from 'react-icons/fi';

const Viewjobpost = () => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJob = async () => {
            try {
                console.log('Fetching job details for ID:', id);
                const response = await axios.get(`http://localhost:5000/api/jobposts/${id}`);
                console.log('Job details fetched:', response.data);
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
                    <FiCheckCircle className="h-6 w-6" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-8">
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
                            <button className="btn btn-primary flex-1 md:flex-none">Apply now</button>
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
                                <button className="btn btn-secondary w-full">Apply Now</button>
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