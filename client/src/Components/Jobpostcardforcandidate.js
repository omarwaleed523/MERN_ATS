import React from 'react';
import { FiBriefcase, FiMapPin, FiDollarSign, FiArrowRight } from 'react-icons/fi';

const Jobpostcardforcandidate = ({ title, description, company, location, salary, requirements, department, onView }) => {
    // Format salary to include commas and dollar sign
    const formatSalary = (salary) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(salary);
    };

    return (
        <div className="rounded-lg bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full">
            <div className="card-body p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="card-title text-xl font-bold text-base-content">{title}</h2>
                        <div className="badge badge-primary mt-2">{department}</div>
                    </div>
                    <div className="badge badge-secondary badge-lg">{formatSalary(salary)}</div>
                </div>

                <div className="space-y-3">
                    {company && (
                        <div className="flex items-center gap-2">
                            <FiBriefcase className="h-5 w-5 text-base-content/70" />
                            <span className="text-base-content/70">{company}</span>
                        </div>
                    )}

                    {location && (
                        <div className="flex items-center gap-2">
                            <FiMapPin className="h-5 w-5 text-base-content/70" />
                            <span className="text-base-content/70">{location}</span>
                        </div>
                    )}
                </div>

                <div className="divider my-3"></div>

                <div className="space-y-3 flex-grow">
                    <p className="text-base-content/80 line-clamp-3">{description}</p>

                    {requirements && (
                        <div className="mt-4">
                            <p className="font-semibold mb-2 text-base-content/90">Required Skills:</p>
                            <div className="flex flex-wrap gap-2">
                                {requirements.split(',').map((req, index) => (
                                    <span key={index} className="badge badge-outline badge-primary">{req.trim()}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card-actions justify-end mt-6">
                    <button
                        onClick={onView}
                        className="btn btn-primary gap-2 w-full hover:scale-[1.02] transition-all duration-200"
                    >
                        View Details
                        <FiArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Jobpostcardforcandidate;