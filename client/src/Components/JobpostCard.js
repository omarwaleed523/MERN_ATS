import React from 'react';
import { FiEdit2, FiTrash2, FiBriefcase, FiBook, FiAward } from 'react-icons/fi';
import './JobpostCards.css';
import axios from 'axios';

const JobpostCard = ({ job, onEdit, onDelete }) => {
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/jobposts/${job._id}`);
        } catch (error) {
            console.error('Error deleting job post:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {job.jobTitle}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(job._id)}
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                        >
                            <FiEdit2 size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(job._id)}
                            className="btn btn-ghost btn-sm text-error"
                            title="Delete"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                    <FiBriefcase className="mr-2" />
                    <span>{job.department}</span>
                </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
                {/* Skills Section */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FiAward className="mr-2" /> Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {job.skills?.slice(0, 4).map((skill, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                        {job.skills?.length > 4 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-sm rounded-full">
                                +{job.skills.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Experience Summary */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FiBriefcase className="mr-2" /> Experience Required
                    </h4>
                    <ul className="text-sm text-gray-600">
                        {job.experience?.slice(0, 2).map((exp, index) => (
                            <li key={index} className="mb-1">
                                • {truncateText(`${exp.title} at ${exp.company}`, 50)}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Education Summary */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FiBook className="mr-2" /> Education Requirements
                    </h4>
                    <ul className="text-sm text-gray-600">
                        {job.education?.slice(0, 2).map((edu, index) => (
                            <li key={index} className="mb-1">
                                • {truncateText(`${edu.degree} from ${edu.university}`, 50)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                <button
                    onClick={() => onEdit(job._id)}
                    className="btn btn-primary btn-sm w-full"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default JobpostCard;