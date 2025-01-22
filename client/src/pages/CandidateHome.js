import React, { useEffect, useState } from 'react';
import Jobpostcardforcandidate from "../Components/Jobpostcardforcandidate";
import axios from 'axios';
import Cookies from 'js-cookie';
import ResumeCard from '../Components/ResumeCard';

const CandidateHome = () => {
    const [jobPosts, setJobPosts] = useState([]);
    const [resumes, setResumes] = useState([]);

    // Function to fetch job posts from the backend
    const fetchJobPosts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/jobposts');
            setJobPosts(response.data);
        } catch (error) {
            console.error('Error fetching job posts:', error);
        }
    };

    // Function to fetch resumes from the backend
    const fetchResumes = async () => {
        try {
            const userId = Cookies.get('userId'); // Retrieve userId from cookies
            if (!userId) {
                console.error('User ID not found in cookies');
                return;
            }

            const response = await axios.get(`http://localhost:5000/api/resumes?userId=${userId}`);
            setResumes(response.data);
        } catch (error) {
            console.error('Error fetching resumes:', error);
        }
    };

    // Function to handle application submission
    const handleApply = async (jobPostId) => {
        try {
            const userId = Cookies.get('userId'); // Retrieve userId from cookies
            if (!userId) {
                console.error('User ID not found in cookies');
                return;
            }

            // Post the application to the backend
            await axios.post('http://localhost:5000/api/applications/apply', {
                jobPostId,
                userId,
                resumeId: 'your_resume_id_here' // Replace with actual resume ID or logic to get it
            });

            alert('Application submitted successfully!');
        } catch (error) {
            console.error('Error applying for job:', error);
            alert('Failed to apply for job.');
        }
    };

    // Function to handle resume deletion
    const handleDeleteResume = async (resumeId) => {
        try {
            await axios.delete(`http://localhost:5000/api/resumes/${resumeId}`);
            fetchResumes(); // Fetch resumes again to update the list
        } catch (error) {
            console.error('Error deleting resume:', error);
        }
    };

    // Fetch job posts and resumes when the component mounts
    useEffect(() => {
        fetchJobPosts();
        fetchResumes();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Avaliable Jobposts</h1>
            <div>
                <h2 className="text-xl font-semibold mb-2">Existing Job Posts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {jobPosts.map((job, index) => (
                        <Jobpostcardforcandidate
                            key={index}
                            title={job.title}
                            description={job.description}
                            jobPostId={job._id}
                            onApply={() => handleApply(job._id)} // Pass the apply handler
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CandidateHome;