import React, { useEffect, useState } from 'react';
import Jobpostcardforcandidate from "../Components/Jobpostcardforcandidate";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const CandidateHome = () => {
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    Cookies.get('userId');

    // Function to fetch job posts from the backend
    const fetchJobPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/jobposts');
            console.log('Job Posts:', response.data);
            setJobPosts(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching job posts:', error);
            setError('Failed to load job posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle view job details
    const handleView = (jobPostId) => {
        navigate(`/viewjobpost/${jobPostId}`);
    };

    useEffect(() => {
        fetchJobPosts();
    }, []);

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
                <div className="alert alert-error shadow-lg max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-base-content">Available Job Posts</h1>
                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title font-extrabold">Total Jobs</div>
                        <div className="stat-value text-primary">{jobPosts.length}</div>
                    </div>
                </div>
            </div>

            {jobPosts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-xl text-base-content/70">No job posts available at the moment.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobPosts.map((job) => (
                        <Jobpostcardforcandidate
                            key={job._id}
                            title={job.jobTitle}
                            description={job.jobDescription}
                            company={job.company}
                            location={job.location}
                            salary={job.salary}
                            requirements={job.skills.join(', ')}
                            department={job.department}
                            onView={() => handleView(job._id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidateHome;