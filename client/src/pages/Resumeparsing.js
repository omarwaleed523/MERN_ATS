import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import Jobpostcardforcandidate from '../Components/Jobpostcardforcandidate';
import ResumeCard from '../Components/ResumeCard';

const Resumeparsing = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [resumes, setResumes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const userId = Cookies.get('userId'); // Retrieve user ID from cookies

    // Fetch resumes for the user
    const fetchResumes = async () => {
        if (userId) {
            try {
                const response = await axios.get(`http://localhost:5000/api/resumes/user/${userId}`);
                setResumes(response.data);

            } catch (error) {
                console.error('Error fetching resumes:', error);
                setMessage('Failed to retrieve resumes.');
            }
        }
    };

    // Function to handle resume deletion
    const handleDeleteResume = async (resumeId) => {
        try {
            await axios.delete(`http://localhost:5000/api/resumes/${resumeId}`);
            fetchResumes();
        } catch (error) {
            console.error('Error deleting resume:', error);
            setMessage('Failed to delete resume.');
        }
    };

    useEffect(() => {
        fetchResumes();
    }, [userId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Show loading overlay
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('userId', userId);

        try {
            const response = await axios.post('http://localhost:5000/api/resumes/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Resume uploaded and parsed successfully!');
            fetchResumes(); // Refresh the list
        } catch (error) {
            setMessage('Failed to upload and parse resume.');
            console.error(error);
        } finally {
            setIsLoading(false); // Hide loading overlay
        }
    };

    const handleEditResume = (resumeId) => {
        navigate(`/editresume/${resumeId}`); // Navigate to edit page
    };

    return (
        <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-5 relative">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            )}

            <h2 className="text-2xl text-center font-bold mb-6">Upload and Manage Resumes</h2>

            {/* Upload Section */}
            <div className="mb-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Upload Resume (PDF/DOCX)</span>
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.docx"
                            className="file-input file-input-bordered file-input-primary w-full"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Upload and Parse</button>
                </form>
                {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
            </div>

            {/* List of Uploaded Resumes */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Your Resumes</h3>
                <div className="space-y-4 flex">
                    {resumes.map((resume) => (
                        <ResumeCard
                            key={resume._id}
                            title={resume.Name}
                            description={
                                <>
                                    <p><strong>Email:</strong> {resume.Email}</p>
                                    <p><strong>Phone:</strong> {resume.Phone}</p>
                                    <p><strong>Department:</strong> {resume.Department}</p>
                                    <p><strong>Skills:</strong> {resume.Skills?.join(', ')}</p>
                                </>
                            }
                            onEdit={() => handleEditResume(resume._id)}
                            onDelete={() => handleDeleteResume(resume._id)}
                        />
                    ))}{console.log(resumes)}
                </div>
            </div>
        </div>
    );
};

export default Resumeparsing;