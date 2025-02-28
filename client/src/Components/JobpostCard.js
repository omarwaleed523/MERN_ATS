import React from 'react';
import { FiEdit2, FiTrash2, FiBriefcase, FiBook, FiAward, FiDollarSign, FiMapPin } from 'react-icons/fi';
import './JobpostCards.css';
import axios from 'axios';

const JobpostCard = ({ job, onEdit, onDelete }) => {
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const formatSalary = (salary) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(salary);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/jobposts/${job._id}`);
        } catch (error) {
            console.error('Error deleting job post:', error);
        }
    };

    return (
        <div className="rounded-lg bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
            {/* Card Header */}
            <div className="p-6 border-b border-base-300">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-base-content mb-2">
                            {job.jobTitle}
                        </h3>
                        <div className="flex items-center justify-between text-base-content/70 w-full">
                            <span className="flex items-center badge badge-ghost gap-1">
                                <FiBriefcase className="mr-1" />
                                {job.department}
                            </span>
                            <span className="flex items-center badge badge-primary gap-1 ml-auto">
                                <FiDollarSign className="mr-1" />
                                {formatSalary(job.salary)}
                            </span>
                        </div>
                        {job.location && (
                            <div className="flex items-center text-base-content/70 mt-2">
                                <FiMapPin className="mr-2" />
                                {job.location}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 ml-4">
                        <button
                            onClick={() => onEdit(job._id)}
                            className="btn btn-ghost btn-sm btn-square"
                            title="Edit"
                        >
                            <FiEdit2 size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(job._id)}
                            className="btn btn-ghost btn-sm btn-square text-error"
                            title="Delete"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6 flex-grow">
                {/* Skills Section */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center">
                        <FiAward className="mr-2" /> Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {job.skills?.slice(0, 4).map((skill, index) => (
                            <span
                                key={index}
                                className="badge badge-primary badge-outline"
                            >
                                {skill}
                            </span>
                        ))}
                        {job.skills?.length > 4 && (
                            <span className="badge badge-ghost">
                                +{job.skills.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Experience Summary */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center">
                        <FiBriefcase className="mr-2" /> Experience Required
                    </h4>
                    <ul className="text-sm text-base-content/70 space-y-1">
                        {job.experience?.slice(0, 2).map((exp, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {truncateText(`${exp.title} for ${exp.dates}`, 50)}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Education Summary */}
                <div>
                    <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center">
                        <FiBook className="mr-2" /> Education Requirements
                    </h4>
                    <ul className="text-sm text-base-content/70 space-y-1">
                        {job.education?.slice(0, 2).map((edu, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                {truncateText(`${edu.degree} from ${edu.university}`, 50)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Card Footer */}
            <div className="card-actions p-4 bg-base-300/50 rounded-b-2xl mt-auto">
                <button
                    onClick={() => onEdit(job._id)}
                    className="btn btn-primary w-full"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default JobpostCard;