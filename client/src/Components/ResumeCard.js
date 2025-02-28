import React from 'react';
import { FiEdit2, FiTrash2, FiMail, FiPhone, FiBriefcase, FiTag, FiBookOpen, FiMapPin } from 'react-icons/fi';

const ResumeCard = ({ title, description, resume, onEdit, onDelete }) => {
    return (
        <div className="bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-visible border border-base-300 group">
            {/* Card Header with gradient accent */}
            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>

            <div className="card-body p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-grow">
                        {/* Title with hover effect */}
                        <h2 className="card-title text-base-content font-bold text-xl group-hover:text-primary transition-colors duration-300">
                            {title || "Unnamed Resume"}
                        </h2>

                        {/* Description content */}
                        <div className="mt-4 text-base-content/80">
                            {description}
                        </div>

                        {/* Education and Experience Sections */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Education Preview */}
                            {resume?.Education?.length > 0 && (
                                <div className="bg-base-300/40 p-3 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiBookOpen className="text-primary" />
                                        <h3 className="font-medium">Education</h3>
                                    </div>
                                    <ul className="text-sm space-y-2">
                                        {resume.Education.slice(0, 2).map((edu, index) => (
                                            <li key={index} className="border-l-2 border-primary/30 pl-2">
                                                <div className="font-medium">{edu.Degree || edu.degree}</div>
                                                <div className="text-xs flex items-center gap-1 text-base-content/70">
                                                    <FiMapPin size={10} />
                                                    {edu.University || edu.institution}
                                                </div>
                                            </li>
                                        ))}
                                        {resume.Education.length > 2 && (
                                            <li className="text-xs text-primary">+{resume.Education.length - 2} more</li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {/* Experience Preview */}
                            {resume?.Experience?.length > 0 && (
                                <div className="bg-base-300/40 p-3 rounded-md">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiBriefcase className="text-primary" />
                                        <h3 className="font-medium">Experience</h3>
                                    </div>
                                    <ul className="text-sm space-y-2">
                                        {resume.Experience.slice(0, 2).map((exp, index) => (
                                            <li key={index} className="border-l-2 border-primary/30 pl-2">
                                                <div className="font-medium">{exp.Title || exp.position}</div>
                                                <div className="text-xs text-base-content/70">
                                                    {exp.Company || exp.company}
                                                </div>
                                            </li>
                                        ))}
                                        {resume.Experience.length > 2 && (
                                            <li className="text-xs text-primary">+{resume.Experience.length - 2} more</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons - moved to the right side */}
                    <div className="flex md:flex-col gap-2 mt-2 md:mt-0">
                        <button
                            onClick={onEdit}
                            className="btn btn-sm btn-primary flex-1 md:w-24"
                            aria-label="Edit resume"
                        >
                            <FiEdit2 className="mr-1" /> Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="btn btn-sm btn-outline btn-error flex-1 md:w-24"
                            aria-label="Delete resume"
                        >
                            <FiTrash2 className="mr-1" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeCard;