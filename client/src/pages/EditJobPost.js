import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const EditJobPost = () => {
    const { state } = useLocation();
    const { job } = state || {};
    const navigate = useNavigate();

    const [jobTitle, setJobTitle] = useState(job?.jobTitle || '');
    const [department, setDepartment] = useState(job?.department || '');
    const [skills, setSkills] = useState(job?.skills?.filter(skill => skill !== 'null' && skill).join(', ') || '');

    // Initialize experience as an array of objects
    const [experiences, setExperiences] = useState(
        job?.experience?.filter(exp => exp.title !== 'null' && exp.title) ||
        [{ title: '', company: '', dates: '', description: '' }]
    );

    // Initialize education as an array of objects
    const [educations, setEducations] = useState(
        job?.education?.filter(edu => edu.degree !== 'null' && edu.degree) ||
        [{ degree: '', university: '', location: '' }]
    );

    const handleExperienceChange = (index, field, value) => {
        const newExperiences = [...experiences];
        newExperiences[index][field] = value;
        setExperiences(newExperiences);
    };

    const handleEducationChange = (index, field, value) => {
        const newEducations = [...educations];
        newEducations[index][field] = value;
        setEducations(newEducations);
    };

    const addExperience = () => {
        setExperiences([...experiences, { title: '', company: '', dates: '', description: '' }]);
    };

    const removeExperience = (index) => {
        if (experiences.length > 1) {
            setExperiences(experiences.filter((_, i) => i !== index));
        }
    };

    const addEducation = () => {
        setEducations([...educations, { degree: '', university: '', location: '' }]);
    };

    const removeEducation = (index) => {
        if (educations.length > 1) {
            setEducations(educations.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = Cookies.get('userId');
            const skillsArray = skills.split(',').map(item => item.trim()).filter(item => item);

            await axios.put(`http://localhost:5000/api/jobposts/${job._id}`, {
                jobTitle,
                skills: skillsArray,
                experience: experiences.filter(exp => exp.title.trim()),
                education: educations.filter(edu => edu.degree.trim()),
                department,
                userId
            });
            navigate('/recruiterhome');
        } catch (error) {
            console.error('Error saving job post:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4">Edit Job Post</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md space-y-6">
                {/* Job Title */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Job Title</label>
                    <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>

                {/* Department */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                    <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>

                {/* Skills */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Skills (comma separated)</label>
                    <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="e.g., JavaScript, Node.js, React"
                    />
                </div>

                {/* Experience Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 text-sm font-bold">Experience</label>
                        <button type="button" onClick={addExperience} className="btn btn-sm btn-primary">
                            Add Experience
                        </button>
                    </div>
                    {experiences.map((exp, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded mb-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={exp.title}
                                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                        className="input input-bordered w-full"
                                        placeholder="Job Title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Company</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                        className="input input-bordered w-full"
                                        placeholder="Company Name"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm mb-1">Dates</label>
                                <input
                                    type="text"
                                    value={exp.dates}
                                    onChange={(e) => handleExperienceChange(index, 'dates', e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="e.g., 2018-2020"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-sm mb-1">Description</label>
                                <textarea
                                    value={exp.description}
                                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Job Description"
                                    rows="3"
                                />
                            </div>
                            {experiences.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeExperience(index)}
                                    className="btn btn-sm btn-error"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Education Section */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-gray-700 text-sm font-bold">Education</label>
                        <button type="button" onClick={addEducation} className="btn btn-sm btn-primary">
                            Add Education
                        </button>
                    </div>
                    {educations.map((edu, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded mb-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Degree</label>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                        className="input input-bordered w-full"
                                        placeholder="Degree"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">University</label>
                                    <input
                                        type="text"
                                        value={edu.university}
                                        onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                                        className="input input-bordered w-full"
                                        placeholder="University"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={edu.location}
                                        onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                                        className="input input-bordered w-full"
                                        placeholder="Location"
                                    />
                                </div>
                            </div>
                            {educations.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeEducation(index)}
                                    className="btn btn-sm btn-error mt-2"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-primary w-full">Save Job Post</button>
            </form>
        </div>
    );
};

export default EditJobPost;