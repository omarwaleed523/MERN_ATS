import React from 'react';
import { FiBriefcase, FiMapPin, FiDollarSign, FiArrowRight, FiCalendar, FiStar } from 'react-icons/fi';

const Jobpostcardforcandidate = ({ title, description, company, location, salary, requirements, department, createdAt, onView }) => {
    // Format salary to include commas and dollar sign
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
        const date = createdAt ? new Date(createdAt) : new Date();
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="rounded-lg bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-y-[-3px] flex flex-col h-full group relative overflow-hidden">
            {/* Decorative gradient header */}
            <div className={`h-2 bg-gradient-to-r ${getDepartmentGradient(department)}`}></div>

            {/* Visual accent element */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 bg-gradient-to-br from-primary to-transparent transform rotate-45 translate-x-10 -translate-y-10 pointer-events-none"></div>

            <div className="card-body p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="card-title text-xl font-bold text-base-content group-hover:text-primary transition-colors duration-300">{title}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="badge badge-primary">{department}</div>
                            <div className="flex items-center text-xs text-base-content/60">
                                <FiCalendar className="mr-1" />
                                Posted: {getPostedDate()}
                            </div>
                        </div>
                    </div>
                    <div className="badge badge-secondary badge-lg">{formatSalary(salary)}</div>
                </div>

                {/* Highlight box for description */}
                <div className="bg-base-300/30 p-3 rounded-md my-3">
                    <p className="text-base-content/80 italic line-clamp-3">{description}</p>
                </div>

                <div className="space-y-3 mt-3">
                    {company && (
                        <div className="flex items-center gap-2">
                            <FiBriefcase className="h-5 w-5 text-primary" />
                            <span className="text-base-content/70">{company}</span>
                        </div>
                    )}

                    {location && (
                        <div className="flex items-center gap-2">
                            <FiMapPin className="h-5 w-5 text-primary" />
                            <span className="text-base-content/70">{location}</span>
                        </div>
                    )}
                </div>

                <div className="divider my-3"></div>

                <div className="space-y-3 flex-grow">
                    {requirements && (
                        <div className="mt-2">
                            <p className="font-semibold mb-2 text-base-content/90 flex items-center">
                                <FiStar className="mr-2 text-primary" />
                                Required Skills:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {requirements.split(',').map((req, index) => (
                                    <span
                                        key={index}
                                        className="badge badge-outline badge-primary hover:bg-primary hover:text-white transition-colors duration-300"
                                    >
                                        {req.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card-actions justify-end mt-6">
                    <button
                        onClick={onView}
                        className="btn btn-primary gap-2 w-full hover:scale-[1.02] transition-all duration-200 group-hover:shadow-md"
                    >
                        View Details
                        <FiArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Jobpostcardforcandidate;