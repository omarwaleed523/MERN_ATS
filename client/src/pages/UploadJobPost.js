import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const UploadJobPost = () => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("Please select a file.");
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('jobfile', file);
        // Append the recruiter ID (retrieved from cookies)
        const userId = Cookies.get('userId');
        formData.append('userId', userId);
        try {
            const response = await axios.post('http://localhost:5000/api/jobposts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage("Job post uploaded successfully!");
            // Redirect to recruiter home page (which lists job posts) after upload
            navigate('/recruiterhome');
        } catch (error) {
            console.error("Error uploading job post:", error);
            setMessage("Failed to upload job post.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Upload Job Post File</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Choose Job Post File (PDF or DOCX)
                    </label>
                    <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        className="file-input file-input-bordered w-full max-w-xs"
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                >
                    {isLoading ? <span className="loading loading-spinner"></span> : "Upload"}
                </button>
            </form>
            {message && <p className="mt-4 text-center">{message}</p>}
        </div>
    );
};

export default UploadJobPost;