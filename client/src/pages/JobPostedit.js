import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const JobPostEdit = () => {
    const location = useLocation();
    const { job } = location.state || {};
    const [title, setTitle] = useState(job?.title || '');
    const [description, setDescription] = useState(job?.description || '');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = Cookies.get('userId'); // Retrieve userId from cookies

            if (!userId) {
                console.error('User ID not found in cookies');
                return;
            }

            if (job) {
                // Update existing job post
                await axios.put(`http://localhost:5000/api/jobposts/${job._id}`, { title, description, userId });
            } else {
                // Create new job post
                await axios.post('http://localhost:5000/api/jobposts', { title, description, userId });
            }
            navigate('/recruiterhome'); // Redirect after submission
        } catch (error) {
            console.error('Error saving job post:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-5">
            <h2 className="text-2xl text-center font-bold mb-6">{job ? 'Edit Job Post' : 'Add Job Post'}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-m font-medium mb-1">Job Title</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-m font-medium mb-1">Job Description</label>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="button">
                        {job ? 'Update Job Post' : 'Create Job Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default JobPostEdit;