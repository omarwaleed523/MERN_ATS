import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobpostCard from '../Components/JobpostCard';
import axios from 'axios';

const RecruiterHome = () => {
    const navigate = useNavigate();
    const [jobPosts, setJobPosts] = useState([]);

    useEffect(() => {
        const fetchJobPosts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/jobposts');
                setJobPosts(response.data);
            } catch (error) {
                console.error('Error fetching job posts:', error);
            }
        };
        fetchJobPosts();
    }, []);

    const handleEdit = (jobPost) => {
        navigate('/editjobpost', { state: { job: jobPost } });
    };

    const handleDelete = async (jobPostId) => {
        try {
            await axios.delete(`http://localhost:5000/api/jobposts/${jobPostId}`);
            const response = await axios.get('http://localhost:5000/api/jobposts');
            setJobPosts(response.data);
        } catch (error) {
            console.error('Error deleting job post:', error);
        }
    };

    const handleAddJobPost = () => {
        navigate('/editjobpost');
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>
            <div className="mb-6">
                <button className="button" onClick={handleAddJobPost}>
                    Add Job Post
                </button>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Existing Job Posts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {jobPosts.map(jobPost => (
                        <JobpostCard
                            key={jobPost._id}
                            title={jobPost.title}
                            description={jobPost.description}
                            jobPostId={jobPost._id}
                            onEdit={() => handleEdit(jobPost)}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecruiterHome;