import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const VALID_DEPARTMENTS = [
    "ACCOUNTANT", "ADVOCATE", "AGRICULTURE", "APPAREL", "ARTS", "AUTOMOBILE",
    "AVIATION", "BANKING", "BPO", "BUSINESS-DEVELOPMENT", "CHEF", "CONSTRUCTION",
    "CONSULTANT", "DESIGNER", "DIGITAL-MEDIA", "ENGINEERING", "FINANCE", "FITNESS",
    "HEALTHCARE", "HR", "INFORMATION-TECHNOLOGY", "PUBLIC-RELATIONS", "SALES", "TEACHER"
];

const EditJobPost = () => {
    const { state } = useLocation();
    const { job } = state || {};
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        jobTitle: job?.jobTitle || '',
        salary: job?.salary || '',
        location: job?.location || '',
        jobDescription: job?.jobDescription || '',
        company: job?.company || '',
        department: job?.department || '',
        skills: job?.skills?.filter(skill => skill !== 'null' && skill).join(', ') || '',
        experience: job?.experience?.filter(exp => exp.title !== 'null' && exp.title) ||
            [{ title: '', company: '', dates: '', description: '' }],
        education: job?.education?.filter(edu => edu.degree !== 'null' && edu.degree) ||
            [{ degree: '', university: '', location: '' }]
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleExperienceChange = (index, field, value) => {
        const newExperiences = [...formData.experience];
        newExperiences[index][field] = value;
        setFormData(prev => ({
            ...prev,
            experience: newExperiences
        }));
    };

    const handleEducationChange = (index, field, value) => {
        const newEducations = [...formData.education];
        newEducations[index][field] = value;
        setFormData(prev => ({
            ...prev,
            education: newEducations
        }));
    };

    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, { title: '', company: '', dates: '', description: '' }]
        }));
    };

    const removeExperience = (index) => {
        if (formData.experience.length > 1) {
            setFormData(prev => ({
                ...prev,
                experience: formData.experience.filter((_, i) => i !== index)
            }));
        }
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { degree: '', university: '', location: '' }]
        }));
    };

    const removeEducation = (index) => {
        if (formData.education.length > 1) {
            setFormData(prev => ({
                ...prev,
                education: formData.education.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = Cookies.get('userId');
            const skillsArray = formData.skills.split(',').map(item => item.trim()).filter(item => item);

            await axios.put(`http://localhost:5000/api/jobposts/${job._id}`, {
                jobTitle: formData.jobTitle,
                salary: formData.salary,
                location: formData.location,
                jobDescription: formData.jobDescription,
                company: formData.company,
                department: formData.department,
                skills: skillsArray,
                experience: formData.experience.filter(exp => exp.title.trim()),
                education: formData.education.filter(edu => edu.degree.trim()),
                userId
            });
            navigate('/recruiterhome');
        } catch (error) {
            console.error('Error saving job post:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-[#9C4C7C] mb-6">Edit Job Post</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-6">
                {/* Job Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full bg-pink-50 border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        required
                    />
                </div>

                {/* Company */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full bg-pink-100 text-gray-700 border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        required
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full  bg-pink-100 border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        required
                    />
                </div>

                {/* Salary */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                    <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full bg-pink-100 border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        required
                    />
                </div>

                {/* Department */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full bg-pink-100 border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        required
                    >
                        <option value="">Select Department</option>
                        {VALID_DEPARTMENTS.map(dept => (
                            <option key={dept} value={dept}>{dept.replace(/-/g, ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* Job Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                    <textarea
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-2xl bg-pink-100 border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        rows="4"
                        required
                    />
                </div>

                {/* Skills */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma separated)</label>
                    <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-full bg-pink-100 border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        placeholder="e.g., Project management, Communication skills"
                        required
                    />
                </div>

                {/* Experience Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">Experience</label>
                        <button
                            type="button"
                            onClick={addExperience}
                            className="px-4 py-1 rounded-full bg-pink-500 text-white text-sm hover:bg-pink-600 transition-colors"
                        >
                            Add Experience
                        </button>
                    </div>
                    {formData.experience.map((exp, index) => (
                        <div key={index} className="mb-6 p-4 bg-pink-50 rounded-2xl">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={exp.title}
                                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                        className="w-full px-4 py-2 rounded-full bg-white border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                        className="w-full px-4 py-2 rounded-full bg-white border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dates</label>
                                <input
                                    type="text"
                                    value={exp.dates}
                                    onChange={(e) => handleExperienceChange(index, 'dates', e.target.value)}
                                    className="w-full px-4 py-2 rounded-full bg-white border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={exp.description}
                                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                    className="w-full px-4 py-2 rounded-2xl bg-white border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                    rows="3"
                                />
                            </div>
                            {formData.experience.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeExperience(index)}
                                    className="mt-4 px-4 py-1 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Education Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">Education</label>
                        <button
                            type="button"
                            onClick={addEducation}
                            className="px-4 py-1 rounded-full bg-pink-500 text-white text-sm hover:bg-pink-600 transition-colors"
                        >
                            Add Education
                        </button>
                    </div>
                    {formData.education.map((edu, index) => (
                        <div key={index} className="mb-6 p-4 bg-pink-50 rounded-2xl">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                        className="w-full px-4 py-2 rounded-full bg-white border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                                    <input
                                        type="text"
                                        value={edu.university}
                                        onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                                        className="w-full px-4 py-2 rounded-full bg-white border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={edu.location}
                                        onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                                        className="w-full px-4 py-2 rounded-full bg-white border-transparent focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                                    />
                                </div>
                            </div>
                            {formData.education.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeEducation(index)}
                                    className="mt-4 px-4 py-1 rounded-full bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors"
                >
                    Save Job Post
                </button>
            </form>
        </div>
    );
};

export default EditJobPost;