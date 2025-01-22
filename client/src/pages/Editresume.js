import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditResume = () => {
    const { resumeId } = useParams();
    const [resume, setResume] = useState({
        Education: [],
        Experience: [],
        Name: '',
        Email: '',
        Phone: '',
        Skills: [],
        Department: ''
    });
    const [message, setMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/resumes/${resumeId}`);
                setResume(response.data);
            } catch (error) {
                console.error('Error fetching resume:', error);
                setMessage('Failed to load resume.');
            }
        };
        fetchResume();
    }, [resumeId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setResume({ ...resume, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/resumes/${resumeId}`, resume);
            setMessage('Changes saved successfully!');
            setShowAlert(true);
            setTimeout(() => {
                setShowAlert(false);
                navigate('/parseresume'); // Redirect to /parseresume
            }, 3000); // Alert disappears after 3 seconds
        } catch (error) {
            setMessage('Failed to update resume.');
            console.error(error);
        }
    };

    if (!resume) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-5">
            {showAlert && (
                <div className="alert alert-success fixed top-4 right-4 w-1/3">
                    <div className="text-sm">
                        <span>{message}</span>
                    </div>
                </div>
            )}
            <h2 className="text-2xl text-center font-bold mb-6">Edit Resume</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Name</span>
                    </label>
                    <input
                        type="text"
                        name="Name"
                        value={resume.Name || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full"
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Email</span>
                    </label>
                    <input
                        type="email"
                        name="Email"
                        value={resume.Email || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full"
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Phone</span>
                    </label>
                    <input
                        type="text"
                        name="Phone"
                        value={resume.Phone || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full"
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Department</span>
                    </label>
                    <input
                        type="text"
                        name="Department"
                        value={resume.Department || ''}
                        onChange={handleInputChange}
                        className="input input-bordered w-full"
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Skills</span>
                    </label>
                    <input
                        type="text"
                        name="Skills"
                        value={resume.Skills?.join(', ') || ''}
                        onChange={(e) => setResume({ ...resume, Skills: e.target.value.split(', ') })}
                        className="input input-bordered w-full"
                    />
                </div>
                {/* <div className="form-control">
                    <label className="label">
                        <span className="label-text">Education</span>
                    </label>
                    {Array.isArray(resume.Education) && resume.Education.map((edu, index) => (
                        <div key={index} className="mb-2">
                            <p><strong>Degree:</strong> {edu.Degree}</p>
                            <p><strong>University:</strong> {edu.University}</p>
                            <p><strong>Location:</strong> {edu.Location}</p>
                        </div>
                    ))}
                    <textarea
                        name="Education"
                        value={resume.Education.map(edu => `${edu.Degree}, ${edu.University}, ${edu.Location}`).join('\n') || ''}
                        onChange={handleInputChange}
                        className="textarea textarea-bordered w-full"
                        placeholder="Enter education details"
                        rows={3}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Experience</span>
                    </label>
                    {Array.isArray(resume.Experience) && resume.Experience.map((exp, index) => (
                        <div key={index} className="mb-2">
                            <p><strong>Title:</strong> {exp.Title}</p>
                            <p><strong>Company:</strong> {exp.Company}</p>
                            <p><strong>Dates:</strong> {exp.Dates}</p>
                            <p><strong>Description:</strong> {exp.description}</p>
                        </div>
                    ))}
                    <textarea
                        name="Experience"
                        value={resume.Experience.map(exp => `${exp.Title}, ${exp.Company}, ${exp.Dates}`).join('\n') || ''}
                        onChange={handleInputChange}
                        className="textarea textarea-bordered w-full"
                        placeholder="Enter experience details"
                        rows={3}
                    />
                </div>*/}
                <button type="submit" className="btn btn-success w-full">Save Changes</button>
            </form>
        </div>
    );
};

export default EditResume;