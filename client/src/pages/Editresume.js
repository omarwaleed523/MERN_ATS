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

    // New education item state
    const [newEducation, setNewEducation] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        grade: ''
    });

    // New experience item state
    const [newExperience, setNewExperience] = useState({
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: ''
    });

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/resumes/${resumeId}`);
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

    // Handle education input changes
    const handleEducationChange = (e) => {
        const { name, value } = e.target;
        setNewEducation({ ...newEducation, [name]: value });
    };

    // Handle experience input changes
    const handleExperienceChange = (e) => {
        const { name, value } = e.target;
        setNewExperience({ ...newExperience, [name]: value });
    };

    // Add new education entry
    const addEducation = () => {
        const updatedEducation = [...resume.Education, newEducation];
        setResume({ ...resume, Education: updatedEducation });
        setNewEducation({
            institution: '',
            degree: '',
            fieldOfStudy: '',
            startDate: '',
            endDate: '',
            grade: ''
        });
    };

    // Add new experience entry
    const addExperience = () => {
        const updatedExperience = [...resume.Experience, newExperience];
        setResume({ ...resume, Experience: updatedExperience });
        setNewExperience({
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            description: ''
        });
    };

    // Delete education entry
    const deleteEducation = (index) => {
        const updatedEducation = resume.Education.filter((_, i) => i !== index);
        setResume({ ...resume, Education: updatedEducation });
    };

    // Delete experience entry
    const deleteExperience = (index) => {
        const updatedExperience = resume.Experience.filter((_, i) => i !== index);
        setResume({ ...resume, Experience: updatedExperience });
    };

    // Update education entry
    const updateEducation = (index, updatedData) => {
        const updatedEducation = [...resume.Education];

        // Map frontend field names to database field names
        const mappedData = {};
        if ('institution' in updatedData) mappedData.University = updatedData.institution;
        if ('degree' in updatedData) mappedData.Degree = updatedData.degree;
        if ('location' in updatedData) mappedData.Location = updatedData.location;

        updatedEducation[index] = { ...updatedEducation[index], ...mappedData };
        setResume({ ...resume, Education: updatedEducation });
    };

    // Update experience entry
    const updateExperience = (index, updatedData) => {
        const updatedExperience = [...resume.Experience];

        // Map frontend field names to database field names
        const mappedData = {};
        if ('company' in updatedData) mappedData.Company = updatedData.company;
        if ('position' in updatedData) mappedData.Title = updatedData.position;
        if ('dates' in updatedData) mappedData.Dates = updatedData.dates;
        if ('description' in updatedData) mappedData.description = updatedData.description;

        updatedExperience[index] = { ...updatedExperience[index], ...mappedData };
        setResume({ ...resume, Experience: updatedExperience });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/resumes/${resumeId}`, resume);
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
        <div className="max-w-4xl mx-auto p-8 bg-neutral rounded-lg shadow-lg mt-5 mb-10">
            {showAlert && (
                <div className="alert alert-success fixed top-4 right-4 w-1/3">
                    <div className="text-sm">
                        <span>{message}</span>
                    </div>
                </div>
            )}
            <h2 className="text-2xl text-center font-bold mb-6">Edit Resume</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div className="bg-base-100 p-4 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="form-control md:col-span-2">
                            <label className="label">
                                <span className="label-text">Skills (comma separated)</span>
                            </label>
                            <input
                                type="text"
                                name="Skills"
                                value={resume.Skills?.join(', ') || ''}
                                onChange={(e) => setResume({ ...resume, Skills: e.target.value.split(', ') })}
                                className="input input-bordered w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Education Section */}
                <div className="bg-base-100 p-4 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Education</h3>

                    {/* Display existing education entries */}
                    {resume.Education && resume.Education.length > 0 ? (
                        <div className="space-y-4 mb-6">
                            {resume.Education.map((edu, index) => (
                                <div key={index} className="bg-neutral p-4 rounded-md relative group">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">University</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={edu.University || ''}
                                                onChange={(e) => updateEducation(index, { institution: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Degree</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={edu.Degree || ''}
                                                onChange={(e) => updateEducation(index, { degree: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Field of Study</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={edu.fieldOfStudy || ''}
                                                onChange={(e) => updateEducation(index, { fieldOfStudy: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Grade/GPA</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={edu.grade || ''}
                                                onChange={(e) => updateEducation(index, { grade: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Start Date</label>
                                            <input
                                                type="date"
                                                className="input input-bordered w-full"
                                                value={edu.startDate || ''}
                                                onChange={(e) => updateEducation(index, { startDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">End Date</label>
                                            <input
                                                type="date"
                                                className="input input-bordered w-full"
                                                value={edu.endDate || ''}
                                                onChange={(e) => updateEducation(index, { endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-circle btn-error btn-sm absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => deleteEducation(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-4">No education entries yet. Add your first below.</p>
                    )}

                    {/* Add new education form */}
                    <div className="bg-base-200 p-4 rounded-md">
                        <h4 className="font-medium mb-3">Add New Education</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm">Institution</label>
                                <input
                                    type="text"
                                    name="institution"
                                    className="input input-bordered w-full"
                                    value={newEducation.institution}
                                    onChange={handleEducationChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm">Degree</label>
                                <input
                                    type="text"
                                    name="degree"
                                    className="input input-bordered w-full"
                                    value={newEducation.degree}
                                    onChange={handleEducationChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm">Field of Study</label>
                                <input
                                    type="text"
                                    name="fieldOfStudy"
                                    className="input input-bordered w-full"
                                    value={newEducation.fieldOfStudy}
                                    onChange={handleEducationChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm">Grade/GPA</label>
                                <input
                                    type="text"
                                    name="grade"
                                    className="input input-bordered w-full"
                                    value={newEducation.grade}
                                    onChange={handleEducationChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    className="input input-bordered w-full"
                                    value={newEducation.startDate}
                                    onChange={handleEducationChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="input input-bordered w-full"
                                    value={newEducation.endDate}
                                    onChange={handleEducationChange}
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm mt-3"
                            onClick={addEducation}
                        >
                            Add Education
                        </button>
                    </div>
                </div>

                {/* Experience Section */}
                <div className="bg-base-100 p-4 rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Experience</h3>

                    {/* Display existing experience entries */}
                    {resume.Experience && resume.Experience.length > 0 ? (
                        <div className="space-y-4 mb-6">
                            {resume.Experience.map((exp, index) => (
                                <div key={index} className="bg-neutral p-4 rounded-md relative group">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-sm font-medium">Company Name</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={exp.Company || ''}
                                                onChange={(e) => updateExperience(index, { company: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Job Title</label>
                                            <input
                                                type="text"
                                                className="input input-bordered w-full"
                                                value={exp.Title || ''}
                                                onChange={(e) => updateExperience(index, { position: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Start Date</label>
                                            <input
                                                type="date"
                                                className="input input-bordered w-full"
                                                value={exp.startDate || ''}
                                                onChange={(e) => updateExperience(index, { startDate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">End Date</label>
                                            <input
                                                type="date"
                                                className="input input-bordered w-full"
                                                value={exp.endDate || ''}
                                                onChange={(e) => updateExperience(index, { endDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium">Description</label>
                                            <textarea
                                                className="textarea textarea-bordered w-full"
                                                rows="3"
                                                value={exp.description || ''}
                                                onChange={(e) => updateExperience(index, { description: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-circle btn-error btn-sm absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => deleteExperience(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 mb-4">No experience entries yet. Add your first below.</p>
                    )}

                    {/* Add new experience form */}
                    <div className="bg-base-200 p-4 rounded-md">
                        <h4 className="font-medium mb-3">Add New Experience</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm">Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    className="input input-bordered w-full"
                                    value={newExperience.company}
                                    onChange={handleExperienceChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm">Position</label>
                                <input
                                    type="text"
                                    name="position"
                                    className="input input-bordered w-full"
                                    value={newExperience.position}
                                    onChange={handleExperienceChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    className="input input-bordered w-full"
                                    value={newExperience.startDate}
                                    onChange={handleExperienceChange}
                                />
                            </div>
                            <div>
                                <label className="text-sm">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="input input-bordered w-full"
                                    value={newExperience.endDate}
                                    onChange={handleExperienceChange}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm">Description</label>
                                <textarea
                                    name="description"
                                    className="textarea textarea-bordered w-full"
                                    rows="3"
                                    value={newExperience.description}
                                    onChange={handleExperienceChange}
                                ></textarea>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm mt-3"
                            onClick={addExperience}
                        >
                            Add Experience
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/parseresume')}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Save All Changes</button>
                </div>
            </form>
        </div>
    );
};

export default EditResume;