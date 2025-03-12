import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiFile, FiAlertCircle, FiCheckCircle, FiPlus, FiFolder, FiInfo, FiMail, FiPhone, FiBriefcase, FiTag } from 'react-icons/fi';
import ResumeCard from '../Components/ResumeCard';

const Resumeparsing = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [resumes, setResumes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState('');
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
                showMessage('Failed to retrieve resumes.', 'error');
            }
        }
    };

    // Function to display messages with type
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);

        // Auto-hide message after 5 seconds
        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 5000);
    };

    // Function to handle resume deletion
    const handleDeleteResume = async (resumeId) => {
        try {
            await axios.delete(`http://localhost:5000/api/resumes/${resumeId}`);
            fetchResumes();
            showMessage('Resume deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting resume:', error);
            showMessage('Failed to delete resume.', 'error');
        }
    };

    useEffect(() => {
        fetchResumes();
    }, [userId]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        if (selectedFile) {
            setFileName(selectedFile.name);
        } else {
            setFileName('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            showMessage('Please select a file to upload.', 'error');
            return;
        }

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
            showMessage('Resume uploaded and parsed successfully!', 'success');
            setFile(null);
            setFileName('');
            document.getElementById('resumeUpload').value = '';
            fetchResumes(); // Refresh the list
        } catch (error) {
            showMessage('Failed to upload and parse resume.', 'error');
            console.error(error);
        } finally {
            setIsLoading(false); // Hide loading overlay
        }
    };

    const handleEditResume = (resumeId) => {
        navigate(`/editresume/${resumeId}`); // Navigate to edit page
    };

    return (
        <div className="min-h-screen bg-base-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-base-content mb-3">Resume Management</h1>
                    <p className="text-base-content/70 text-lg max-w-2xl mx-auto">
                        Upload and manage your professional profiles to match with the perfect job opportunities
                    </p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'} mb-8 shadow-xl max-w-3xl mx-auto`}>
                        {messageType === 'success' ? <FiCheckCircle className="h-6 w-6" /> : <FiAlertCircle className="h-6 w-6" />}
                        <span>{message}</span>
                    </div>
                )}

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-base-300 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-base-100 shadow-xl p-8">
                            <div className="flex flex-col items-center">
                                <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                                <p className="text-base-content text-lg font-medium">Processing resume...</p>
                                <p className="text-base-content/70 mt-2">This may take a moment</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-base-200 shadow-xl h-max">
                            <div className="card-body">
                                <h2 className="card-title text-xl text-base-content mb-6 flex items-center">
                                    <FiUpload className="mr-2 text-primary" /> Upload New Resume
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text font-medium">Upload Resume (PDF/DOCX)</span>
                                        </label>

                                        <input
                                            type="file"
                                            id="resumeUpload"
                                            onChange={handleFileChange}
                                            accept=".pdf,.docx"
                                            className="file-input file-input-bordered file-input-primary w-full"
                                            required
                                        />

                                        {fileName && (
                                            <div className="mt-3 p-3 bg-base-300/50 rounded-lg flex items-center text-sm">
                                                <FiFile className="mr-2 text-primary" /> {fileName}
                                            </div>
                                        )}
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full">
                                        <FiUpload className="mr-2" /> Upload Resume
                                    </button>
                                </form>

                                <div className="mt-6 p-4 bg-info/10 rounded-lg">
                                    <div className="flex items-start">
                                        <FiInfo className="text-info mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-base-content mb-1">Resume Parsing</h3>
                                            <p className="text-sm text-base-content/70">
                                                Our AI will automatically extract your information, skills, and experience to help you match with relevant job opportunities.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resume Portfolio Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-base-200 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title text-xl mb-6 text-base-content flex items-center">
                                    <FiFolder className="mr-2 text-primary" /> Your Resume Portfolio
                                </h2>

                                {resumes.length === 0 ? (
                                    <div className="py-12 text-center bg-base-300/30 rounded-xl">
                                        <div className="text-6xl mb-4 opacity-30 flex justify-center text-base-content">
                                            <FiFile />
                                        </div>
                                        <h3 className="text-xl font-medium text-base-content mb-2">No resumes yet</h3>
                                        <p className="text-base-content/70 max-w-md mx-auto">
                                            Upload your first resume to get started with job matching and applications.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {resumes.map((resume) => (
                                            <ResumeCard
                                                key={resume._id}
                                                title={resume.Name}
                                                resume={resume}
                                                description={
                                                    <>
                                                        <div className="space-y-2">
                                                            <p className="flex items-center">
                                                                <FiMail className="mr-2 text-primary/70" />
                                                                <span className="text-base-content/90">{resume.Email}</span>
                                                            </p>
                                                            <p className="flex items-center">
                                                                <FiPhone className="mr-2 text-primary/70" />
                                                                <span className="text-base-content/90">{resume.Phone}</span>
                                                            </p>
                                                            {resume.Department && (
                                                                <p className="flex items-center">
                                                                    <FiBriefcase className="mr-2 text-primary/70" />
                                                                    <span className="text-base-content/90">{resume.Department}</span>
                                                                </p>
                                                            )}
                                                        </div>

                                                        {resume.Skills && resume.Skills.length > 0 && (
                                                            <div className="mt-4">
                                                                <p className="flex items-center mb-2">
                                                                    <FiTag className="mr-2 text-primary/70" />
                                                                    <span className="font-medium">Skills</span>
                                                                </p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {resume.Skills.slice(0, 5).map((skill, idx) => (
                                                                        <span key={idx} className="badge badge-sm badge-primary badge-outline">{skill}</span>
                                                                    ))}
                                                                    {resume.Skills.length > 5 && (
                                                                        <span className="badge badge-sm badge-primary">+{resume.Skills.length - 5} more</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                }
                                                onEdit={() => handleEditResume(resume._id)}
                                                onDelete={() => handleDeleteResume(resume._id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Resumeparsing;