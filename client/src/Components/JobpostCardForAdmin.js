import React, { useState } from 'react';
import { 
    FiEdit2, FiTrash2, FiBriefcase, FiBook, FiAward, FiDollarSign, 
    FiMapPin, FiCalendar, FiUsers, FiEye, FiBarChart2, 
    FiStar, FiAlertCircle, FiChevronDown, FiChevronUp, FiCheckCircle
} from 'react-icons/fi';
import './JobpostCards.css';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const JobpostCardForAdmin = ({ job, onEdit, onDelete, onViewApplicants }) => {
    const [expanded, setExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    // Job age in days
    const getJobAge = () => {
        const posted = new Date(job.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today - posted);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Calculate job posting status
    const getJobStatus = () => {
        if (!job.isActive) return { label: 'Inactive', color: 'bg-neutral' };
        if (job.isFeatured) return { label: 'Featured', color: 'bg-warning' };
        if (job.isUrgent) return { label: 'Urgent', color: 'bg-error' };
        return { label: 'Active', color: 'bg-success' };
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await axios.delete(`http://localhost:5000/api/jobposts/${job._id}`);
            onDelete(job._id);
        } catch (error) {
            console.error('Error deleting job post:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const jobStatus = getJobStatus();
    const jobAge = getJobAge();
    const applicantCount = job.applicants?.length || 0;

    return (
        <motion.div 
            className="rounded-lg bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            layout
        >
            {/* Decorative gradient header */}
            <div className={`h-2 bg-gradient-to-r ${getDepartmentGradient(job.department)}`}></div>

            {/* Job Status Badge */}
            <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold text-white rounded-full ${jobStatus.color} flex items-center gap-1`}>
                <FiCheckCircle size={12} />
                {jobStatus.label}
            </div>

            {/* Visual accent element - diagonal line */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 bg-gradient-to-br from-primary to-transparent transform rotate-45 translate-x-10 -translate-y-10 pointer-events-none"></div>

            {/* Admin Stats Bar */}
            <div className="bg-base-300/40 px-4 py-2 flex justify-between items-center text-xs text-base-content/70">
                <div className="flex items-center gap-1">
                    <FiCalendar size={12} />
                    <span>{jobAge} {jobAge === 1 ? 'day' : 'days'} ago</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiUsers size={12} />
                    <span>{applicantCount} {applicantCount === 1 ? 'applicant' : 'applicants'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiEye size={12} />
                    <span>{job.views || 0} views</span>
                </div>
            </div>

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
                            onClick={handleDelete}
                            className={`btn btn-ghost btn-sm btn-square text-error hover:bg-error/10 transition-colors ${isDeleting ? 'loading' : ''}`}
                            title="Delete"
                            disabled={isDeleting}
                        >
                            {!isDeleting && <FiTrash2 size={18} />}
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

                {/* Admin Stats Panel */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="stat bg-base-300/20 p-3 rounded-md">
                        <div className="stat-title text-xs">Application Rate</div>
                        <div className="stat-value text-primary text-lg flex items-center">
                            <FiBarChart2 className="mr-2" />
                            {job.views ? Math.round((applicantCount / job.views) * 100) : 0}%
                        </div>
                    </div>
                    <div className="stat bg-base-300/20 p-3 rounded-md">
                        <div className="stat-title text-xs">Hiring Stage</div>
                        <div className="stat-value text-secondary text-lg flex items-center">
                            <FiUsers className="mr-2" />
                            {job.hiringStage || 'Sourcing'}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            {/* Skills Section with improved visuals */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center">
                                    <FiAward className="mr-2 text-primary" /> Required Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills?.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="badge badge-primary badge-outline hover:bg-primary hover:text-white transition-colors duration-300"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Experience Summary with improved styling */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-base-content/80 mb-2 flex items-center">
                                    <FiBriefcase className="mr-2 text-primary" /> Experience Required
                                </h4>
                                <ul className="text-sm text-base-content/70 space-y-1">
                                    {job.experience?.map((exp, index) => (
                                        <li key={index} className="flex items-start bg-base-300/20 p-2 rounded">
                                            <span className="mr-2 text-primary">•</span>
                                            {`${exp.title} for ${exp.dates}`}
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
                                    {job.education?.map((edu, index) => (
                                        <li key={index} className="flex items-start bg-base-300/20 p-2 rounded">
                                            <span className="mr-2 text-primary">•</span>
                                            {`${edu.degree} from ${edu.university}`}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Expand/collapse toggle */}
                <button 
                    className="btn btn-ghost btn-xs mt-3 w-full flex items-center justify-center gap-1"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? (
                        <>
                            <span>Show Less</span> 
                            <FiChevronUp />
                        </>
                    ) : (
                        <>
                            <span>Show More</span> 
                            <FiChevronDown />
                        </>
                    )}
                </button>
            </div>

            {/* Card Footer with admin actions */}
            <div className="card-actions p-4 bg-base-300/50 rounded-b-lg mt-auto border-t border-base-300">
                <div className="grid grid-cols-2 gap-3 w-full">
                    <button
                        onClick={() => onViewApplicants(job._id)}
                        className="btn btn-primary flex items-center justify-center gap-2"
                    >
                        <FiUsers />
                        <span>View Applicants</span>
                    </button>
                    <button
                        onClick={() => onEdit(job._id)}
                        className="btn btn-outline btn-secondary flex items-center justify-center gap-2"
                    >
                        <FiEdit2 />
                        <span>Edit Job</span>
                    </button>
                </div>
            </div>

            {/* Flagged items indicator */}
            {job.isFlagged && (
                <div className="absolute top-10 right-0 transform rotate-45 bg-error text-white py-1 px-8 text-xs shadow-lg">
                    <FiAlertCircle className="inline-block mr-1" />
                    Flagged
                </div>
            )}

            {/* Featured badge */}
            {job.isFeatured && (
                <div className="absolute top-1 left-1">
                    <div className="badge badge-warning gap-1">
                        <FiStar className="text-white" size={12} />
                        Featured
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default JobpostCardForAdmin;