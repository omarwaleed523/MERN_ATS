import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFile } from 'react-icons/fi';

const UploadJobPost = () => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [jobData, setJobData] = useState({
        jobTitle: '',
        company: '',
        location: '',
        salary: '',
        department: '',
        jobDescription: '',
        skills: ''
    });
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJobData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'application/pdf' ||
            selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please select a valid PDF or DOCX file');
            setFile(null);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const userId = Cookies.get('userId');
            const response = await axios.post('http://localhost:5000/api/jobposts', {
                ...jobData,
                skills: jobData.skills.split(',').map(skill => skill.trim()),
                userId
            });

            setMessage('Job post created successfully!');
            setTimeout(() => navigate('/recruiterhome'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create job post');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('jobfile', file);
        formData.append('userId', Cookies.get('userId'));

        try {
            const response = await axios.post('http://localhost:5000/api/jobposts/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMessage('Job post uploaded successfully!');
            setTimeout(() => navigate('/recruiterhome'), 1500);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload job post');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Create New Job Post</h1>

            <div className="grid md:grid-cols-2 gap-8">
                {/* File Upload Section */}
                <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Upload Job Description File</h2>
                    <form onSubmit={handleFileSubmit} className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                accept=".pdf,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <span className="mt-2 block text-sm font-medium text-gray-600">
                                    {file ? file.name : 'Choose a PDF or DOCX file'}
                                </span>
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading || !file}
                        >
                            {isLoading ? <span className="loading loading-spinner"></span> : "Upload File"}
                        </button>
                    </form>
                </div>

                {/* Manual Input Section */}
                <div className="bg-base-100 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Manual Input</h2>
                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div className="form-control">
                            <input
                                type="text"
                                name="jobTitle"
                                placeholder="Job Title"
                                className="input input-bordered"
                                value={jobData.jobTitle}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <input
                                type="text"
                                name="company"
                                placeholder="Company"
                                className="input input-bordered"
                                value={jobData.company}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <input
                                type="text"
                                name="location"
                                placeholder="Location"
                                className="input input-bordered"
                                value={jobData.location}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <input
                                type="number"
                                name="salary"
                                placeholder="Salary"
                                className="input input-bordered"
                                value={jobData.salary}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <input
                                type="text"
                                name="department"
                                placeholder="Department"
                                className="input input-bordered"
                                value={jobData.department}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <textarea
                                name="jobDescription"
                                placeholder="Job Description"
                                className="textarea textarea-bordered h-24"
                                value={jobData.jobDescription}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>
                        <div className="form-control">
                            <input
                                type="text"
                                name="skills"
                                placeholder="Skills (comma-separated)"
                                className="input input-bordered"
                                value={jobData.skills}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="loading loading-spinner"></span> : "Create Job Post"}
                        </button>
                    </form>
                </div>
            </div>

            {(error || message) && (
                <div className={`mt-4 alert ${error ? 'alert-error' : 'alert-success'}`}>
                    <span>{error || message}</span>
                </div>
            )}
        </div>
    );
};

export default UploadJobPost;