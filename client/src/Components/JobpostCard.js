import React from 'react';
import { FiEdit2, FiTrash2, FiBriefcase, FiBook, FiAward, FiDollarSign, FiMapPin, FiCalendar, FiClock } from 'react-icons/fi';
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

    // Get appropriate gradient based on department
    const getDepartmentGradient = (department) => {
        if (!department) return 'from-primary to-secondary';

        switch (department.toLowerCase()) {
            case 'engineering': return 'from-blue-500 to-cyan-400';
            case 'marketing': return 'from-purple-500 to-pink-400';
            case 'finance': return 'from-green-500 to-emerald-400';
            case 'human resources': return 'from-orange-500 to-amber-400';
            case 'sales': return 'from-red-500 to-orange-400';
            case 'design': return 'from-indigo-500 to-violet-400';
            default: return 'from-primary to-secondary';
        }
    };

    // Format posting date
    const getPostedDate = () => {
        const date = job.createdAt ? new Date(job.createdAt) : new Date();
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const handleDelete = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/jobposts/${job._id}`);
        } catch (error) {
            console.error('Error deleting job post:', error);
        }
    };

    return (
        <div className="rounded-lg bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-5px] flex flex-col h-full relative overflow-hidden group">
            {/* Decorative gradient header */}
            <div className={`h-2 bg-gradient-to-r ${getDepartmentGradient(job.department)}`}></div>

            {/* Visual accent element - diagonal line */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 bg-gradient-to-br from-primary to-transparent transform rotate-45 translate-x-10 -translate-y-10 pointer-events-none"></div>

            {/* Card Header */}
            <div className="p-6 border-b border-base-300 relative">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-base-content mb-2 group-hover:text-primary transition-colors duration-300">
                            {job.jobTitle}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-base-content/70 w-full">
                            <span className="flex items-center badge badge-ghost gap-1">
                                <FiBriefcase className="mr-1" />
                                {job.department}
                            </span>
                            <span className="flex items-center badge badge-primary gap-1">
                                <FiDollarSign className="mr-1" />
                                {formatSalary(job.salary)}
                            </span>
                            <span className="flex items-center text-xs text-base-content/60 ml-auto">
                                <FiCalendar className="mr-1" />
                                Posted: {getPostedDate()}
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
                            className="btn btn-ghost btn-sm btn-square hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Edit"
                        >
                            <FiEdit2 size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(job._id)}
                            className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10 transition-colors"
                            title="Delete"
                        >
                            <FiTrash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Card Body with improved styling */}
            <div className="p-6 flex-grow">
                {/* Brief Description */}
                {job.description && (
                    <div className="mb-4 bg-base-300/30 p-3 rounded-md">
                        <p className="text-sm text-base-content/80 italic line-clamp-2">
                            "{truncateText(job.description, 120)}"
                        </p>
                    </div>
                )}

                {/* Skills Section with improved visuals */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center">
                        <FiAward className="mr-2 text-primary" /> Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {job.skills?.slice(0, 4).map((skill, index) => (
                            <span
                                key={index}
                                className="badge badge-primary badge-outline hover:bg-primary hover:text-white transition-colors duration-300"
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

                {/* Experience Summary with improved styling */}
                <div className="mb-4">
                    <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center">
                        <FiBriefcase className="mr-2 text-primary" /> Experience Required
                    </h4>
                    <ul className="text-sm text-base-content/70 space-y-1">
                        {job.experience?.slice(0, 2).map((exp, index) => (
                            <li key={index} className="flex items-start bg-base-300/20 p-2 rounded">
                                <span className="mr-2 text-primary">•</span>
                                {truncateText(`${exp.title} for ${exp.dates}`, 50)}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Education Summary with improved styling */}
                <div>
                    <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center">
                        <FiBook className="mr-2 text-primary" /> Education Requirements
                    </h4>
                    <ul className="text-sm text-base-content/70 space-y-1">
                        {job.education?.slice(0, 2).map((edu, index) => (
                            <li key={index} className="flex items-start bg-base-300/20 p-2 rounded">
                                <span className="mr-2 text-primary">•</span>
                                {truncateText(`${edu.degree} from ${edu.university}`, 50)}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Card Footer with improved styling */}
            <div className="card-actions p-4 bg-base-300/50 rounded-b-lg mt-auto border-t border-base-300">
                <button
                    onClick={() => onEdit(job._id)}
                    className="btn btn-primary w-full group-hover:bg-opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <span>View Details</span>
                    <FiClock className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
            </div>
        </div>
    );
};

export default JobpostCard;