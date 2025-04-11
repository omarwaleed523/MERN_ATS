import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FiSave, FiPlus, FiTrash2, FiBriefcase, FiMapPin, FiDollarSign, FiTag, FiFileText, FiList, FiUser, FiCalendar, FiBookOpen } from 'react-icons/fi';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);

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
            // Show error notification or message
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-base-100 min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2 flex items-center">
                        <FiBriefcase className="mr-3" /> Edit Job Post
                    </h1>
                    <p className="text-base-content/60">Update job details and requirements</p>
                </div>

                {/* Form Card */}
                <div className="card bg-base-200 shadow-lg">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Job Info Section */}
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title text-secondary flex items-center text-lg">
                                        <FiFileText className="mr-2" /> Basic Job Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Job Title */}
                                        <div className="form-control w-full">
                                            <label className="label">
                                                <span className="label-text flex items-center">
                                                    <FiBriefcase className="mr-2 text-primary/70" />
                                                    Job Title
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                value={formData.jobTitle}
                                                onChange={handleInputChange}
                                                className="input input-bordered w-full focus:input-primary"
                                                required
                                                placeholder="e.g. Senior Software Engineer"
                                            />
                                        </div>

                                        {/* Company */}
                                        <div className="form-control w-full">
                                            <label className="label">
                                                <span className="label-text flex items-center">
                                                    <FiUser className="mr-2 text-primary/70" />
                                                    Company
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleInputChange}
                                                className="input input-bordered w-full focus:input-primary"
                                                required
                                                placeholder="e.g. Acme Corporation"
                                            />
                                        </div>

                                        {/* Location */}
                                        <div className="form-control w-full">
                                            <label className="label">
                                                <span className="label-text flex items-center">
                                                    <FiMapPin className="mr-2 text-primary/70" />
                                                    Location
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                className="input input-bordered w-full focus:input-primary"
                                                required
                                                placeholder="e.g. New York, NY"
                                            />
                                        </div>

                                        {/* Salary */}
                                        <div className="form-control w-full">
                                            <label className="label">
                                                <span className="label-text flex items-center">
                                                    <FiDollarSign className="mr-2 text-primary/70" />
                                                    Salary
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                name="salary"
                                                value={formData.salary}
                                                onChange={handleInputChange}
                                                className="input input-bordered w-full focus:input-primary"
                                                required
                                                placeholder="e.g. 75000"
                                            />
                                        </div>

                                        {/* Department */}
                                        <div className="form-control w-full md:col-span-2">
                                            <label className="label">
                                                <span className="label-text flex items-center">
                                                    <FiTag className="mr-2 text-primary/70" />
                                                    Department
                                                </span>
                                            </label>
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className="select select-bordered w-full focus:select-primary"
                                                required
                                            >
                                                <option value="">Select Department</option>
                                                {VALID_DEPARTMENTS.map(dept => (
                                                    <option key={dept} value={dept}>
                                                        {dept.replace(/-/g, ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Job Description Section */}
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <h2 className="card-title text-secondary flex items-center text-lg">
                                        <FiFileText className="mr-2" /> Job Description
                                    </h2>

                                    {/* Job Description */}
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">Detailed Job Description</span>
                                        </label>
                                        <textarea
                                            name="jobDescription"
                                            value={formData.jobDescription}
                                            onChange={handleInputChange}
                                            className="textarea textarea-bordered h-40 focus:textarea-primary"
                                            required
                                            placeholder="Describe the role, responsibilities, benefits, etc."
                                        />
                                    </div>

                                    {/* Skills */}
                                    <div className="form-control w-full mt-4">
                                        <label className="label">
                                            <span className="label-text flex items-center">
                                                <FiList className="mr-2 text-primary/70" />
                                                Skills (comma separated)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="skills"
                                            value={formData.skills}
                                            onChange={handleInputChange}
                                            className="input input-bordered w-full focus:input-primary"
                                            placeholder="e.g. React.js, Node.js, MongoDB"
                                            required
                                        />
                                        <label className="label">
                                            <span className="label-text-alt text-base-content/60">
                                                List all required skills separated by commas
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Experience Section */}
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <div className="flex justify-between items-center">
                                        <h2 className="card-title text-secondary flex items-center text-lg">
                                            <FiCalendar className="mr-2" /> Required Experience
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={addExperience}
                                            className="btn btn-sm btn-primary gap-2"
                                        >
                                            <FiPlus size={16} /> Add Experience
                                        </button>
                                    </div>

                                    <div className="space-y-6 mt-4">
                                        {formData.experience.map((exp, index) => (
                                            <div key={index} className="card bg-base-200 shadow-sm">
                                                <div className="card-body">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium">Experience #{index + 1}</h3>
                                                        {formData.experience.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeExperience(index)}
                                                                className="btn btn-sm btn-outline btn-error btn-square"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="form-control w-full">
                                                            <label className="label">
                                                                <span className="label-text">Title</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={exp.title}
                                                                onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                                                                className="input input-bordered w-full focus:input-primary"
                                                                placeholder="e.g. Software Developer"
                                                            />
                                                        </div>
                                                        <div className="form-control w-full">
                                                            <label className="label">
                                                                <span className="label-text">Company</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={exp.company}
                                                                onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                                className="input input-bordered w-full focus:input-primary"
                                                                placeholder="e.g. ABC Company"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="form-control w-full">
                                                        <label className="label">
                                                            <span className="label-text">Dates</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={exp.dates}
                                                            onChange={(e) => handleExperienceChange(index, 'dates', e.target.value)}
                                                            className="input input-bordered w-full focus:input-primary"
                                                            placeholder="e.g. 2020-2022 or 2+ years"
                                                        />
                                                    </div>

                                                    <div className="form-control w-full">
                                                        <label className="label">
                                                            <span className="label-text">Description</span>
                                                        </label>
                                                        <textarea
                                                            value={exp.description}
                                                            onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                                                            className="textarea textarea-bordered w-full focus:textarea-primary"
                                                            rows="3"
                                                            placeholder="Describe the required experience"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Education Section */}
                            <div className="card bg-base-100 shadow-sm">
                                <div className="card-body">
                                    <div className="flex justify-between items-center">
                                        <h2 className="card-title text-secondary flex items-center text-lg">
                                            <FiBookOpen className="mr-2" /> Required Education
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={addEducation}
                                            className="btn btn-sm btn-primary gap-2"
                                        >
                                            <FiPlus size={16} /> Add Education
                                        </button>
                                    </div>

                                    <div className="space-y-6 mt-4">
                                        {formData.education.map((edu, index) => (
                                            <div key={index} className="card bg-base-200 shadow-sm">
                                                <div className="card-body">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-medium">Education #{index + 1}</h3>
                                                        {formData.education.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeEducation(index)}
                                                                className="btn btn-sm btn-outline btn-error btn-square"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="form-control w-full">
                                                            <label className="label">
                                                                <span className="label-text">Degree</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={edu.degree}
                                                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                                className="input input-bordered w-full focus:input-primary"
                                                                placeholder="e.g. Bachelor's in Computer Science"
                                                            />
                                                        </div>
                                                        <div className="form-control w-full">
                                                            <label className="label">
                                                                <span className="label-text">University</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={edu.university}
                                                                onChange={(e) => handleEducationChange(index, 'university', e.target.value)}
                                                                className="input input-bordered w-full focus:input-primary"
                                                                placeholder="e.g. State University"
                                                            />
                                                        </div>
                                                        <div className="form-control w-full">
                                                            <label className="label">
                                                                <span className="label-text">Location</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={edu.location}
                                                                onChange={(e) => handleEducationChange(index, 'location', e.target.value)}
                                                                className="input input-bordered w-full focus:input-primary"
                                                                placeholder="e.g. New York, NY"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/recruiterhome')}
                                    className="btn btn-outline btn-neutral mr-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`btn btn-primary gap-2 ${isSubmitting ? 'loading' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    {!isSubmitting && <FiSave size={18} />}
                                    {isSubmitting ? 'Saving...' : 'Save Job Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditJobPost;