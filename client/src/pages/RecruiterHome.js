import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobpostCard from '../Components/JobpostCard';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FiPlus, FiBriefcase, FiUsers } from 'react-icons/fi';

const RecruiterHome = () => {
    const [jobPosts, setJobPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchJobPosts = async () => {
        try {
            setLoading(true);
            const userId = Cookies.get('userId');
            const response = await axios.get(`http://localhost:5000/api/jobposts?userId=${userId}`);
            setJobPosts(response.data);
        } catch (error) {
            console.error('Error fetching job posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobPosts();
    }, []);

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

    const handleAddJobPost = () => {
        navigate('/addjobpost');
    };

    const filteredJobs = jobPosts.filter(job =>
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        totalJobs: jobPosts.length,
        activeJobs: jobPosts.filter(job => !job.isClosed).length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                <FiBriefcase size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-500">Total Job Posts</p>
                                <h3 className="text-2xl font-semibold text-gray-900">{stats.totalJobs}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600">
                                <FiUsers size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-500">Active Jobs</p>
                                <h3 className="text-2xl font-semibold text-gray-900">{stats.activeJobs}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Search job posts..."
                            className="input input-bordered w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => navigate('/addjobpost')}
                        className="btn btn-primary gap-2"
                    >
                        <FiPlus size={20} />
                        Add New Job Post
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <JobpostCard
                                key={job._id}
                                job={job}
                                onEdit={() => handleEdit(job)}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {!loading && filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                        <FiBriefcase size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No job posts found</h3>
                        <p className="text-gray-500">Get started by creating your first job post</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterHome;