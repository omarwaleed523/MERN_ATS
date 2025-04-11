import React, { useEffect, useState } from 'react';
import Jobpostcardforcandidate from "../Components/Jobpostcardforcandidate";
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiSearch, FiFilter, FiMapPin, FiDollarSign, FiTag, FiTrendingUp } from 'react-icons/fi';

const CandidateHome = () => {
    const [jobPosts, setJobPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department: 'all',
        salary: 'all',
        location: 'all'
    });
    const [visibleCount, setVisibleCount] = useState(6);
    const [activeFilter, setActiveFilter] = useState(null);
    const navigate = useNavigate();

    Cookies.get('userId');

    // Function to fetch job posts from the backend
    const fetchJobPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/jobposts');
            console.log('Job Posts:', response.data);
            setJobPosts(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching job posts:', error);
            setError('Failed to load job posts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle view job details
    const handleView = (jobPostId) => {
        navigate(`/viewjobpost/${jobPostId}`);
    };

    useEffect(() => {
        fetchJobPosts();
    }, []);

    // Filter jobs based on search term and filters
    const filteredJobs = jobPosts.filter(job => {
        // Search term filtering
        if (searchTerm && !job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !job.company.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Department filtering
        if (filters.department !== 'all' && job.department.toLowerCase() !== filters.department.toLowerCase()) {
            return false;
        }

        // Salary filtering
        if (filters.salary !== 'all') {
            const salary = parseInt(job.salary);
            if (filters.salary === 'under50k' && salary >= 50000) return false;
            if (filters.salary === '50to100k' && (salary < 50000 || salary > 100000)) return false;
            if (filters.salary === 'over100k' && salary <= 100000) return false;
        }

        // Location filtering
        if (filters.location !== 'all' && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
            return false;
        }

        return true;
    });

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    // Get unique departments for filter dropdown
    const departments = ['all', ...new Set(jobPosts.map(job => job.department.toLowerCase()))];

    // Get unique locations for filter dropdown
    const locations = ['all', ...new Set(jobPosts.map(job =>
        job.location.toLowerCase().split(',')[0].trim()
    ))];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="alert alert-error shadow-lg max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 mb-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-base-content mb-4">Find Your Perfect Job</h1>
                        <p className="text-lg text-base-content/70 mb-8">Explore opportunities that match your skills and career goals</p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-base-content/40" size={20} />
                            </div>
                            <input
                                type="text"
                                className="input input-bordered w-full pl-10 pr-16 h-14 text-lg shadow-md focus:ring-2 focus:ring-primary/50"
                                placeholder="Search jobs, companies, or keywords"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    className="absolute inset-y-0 right-4 flex items-center"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <span className="text-base-content/40 hover:text-base-content">✕</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-16">
                {/* Filter Controls - Revamped Section */}
                <div className="bg-base-200 rounded-xl p-6 mb-8 shadow-lg border border-base-300/50">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">

                        {/* Stats card */}
                        <div className="stats bg-base-100 shadow-md text-center rounded-lg w-full md:w-auto">
                            <div className="stat px-6 py-4">
                                <div className="stat-title font-medium text-base-content/70">Available Jobs</div>
                                <div className="stat-value text-primary text-3xl">{filteredJobs.length}</div>
                                <div className="stat-desc text-base-content/60">{jobPosts.length} total listings</div>
                            </div>
                        </div>

                        {/* Filter controls container */}
                        <div className="flex-grow w-full">
                            {/* Filter Header and Icon Buttons */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                <div className="text-sm font-medium text-base-content/70 flex items-center gap-2">
                                    <FiFilter size={16} className="text-primary" />
                                    Filter Results
                                </div>
                                {/* Icon Buttons for Filters */}
                                <div className="flex gap-2">
                                    <button
                                        className={`btn btn-sm btn-outline h-10 w-12 ${activeFilter === 'department' ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setActiveFilter(activeFilter === 'department' ? null : 'department')}
                                        aria-label="Filter by Department"
                                    >
                                        <FiTag size={18} />
                                    </button>
                                    <button
                                        className={`btn btn-sm btn-outline h-10 w-12 ${activeFilter === 'salary' ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setActiveFilter(activeFilter === 'salary' ? null : 'salary')}
                                        aria-label="Filter by Salary"
                                    >
                                        <FiDollarSign size={18} />
                                    </button>
                                    <button
                                        className={`btn btn-sm btn-outline h-10 w-12 ${activeFilter === 'location' ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setActiveFilter(activeFilter === 'location' ? null : 'location')}
                                        aria-label="Filter by Location"
                                    >
                                        <FiMapPin size={18} />
                                    </button>
                                    {/* Clear Filters Button */}
                                    {(filters.department !== 'all' || filters.salary !== 'all' || filters.location !== 'all' || searchTerm) && (
                                        <button
                                            className="btn btn-sm btn-error btn-outline hover:btn-error h-10 ml-2"
                                            onClick={() => {
                                                setFilters({ department: 'all', salary: 'all', location: 'all' });
                                                setSearchTerm('');
                                                setActiveFilter(null); // Close any open filter
                                            }}
                                        >
                                            <span className="hidden sm:inline mr-1 text-lg">×</span> Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Conditionally Rendered Filter Dropdowns */}
                            <div className="min-h-[60px] bg-base-100 rounded-lg shadow-inner p-4 border border-base-300/30">
                                {activeFilter === 'department' && (
                                    <div className="form-control">
                                        <label className="label pb-1 pt-0">
                                            <span className="label-text font-medium">Select Department</span>
                                        </label>
                                        <select
                                            className="select select-bordered select-sm w-full"
                                            value={filters.department}
                                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                        >
                                            <option value="all">All Departments</option>
                                            {departments.filter(d => d !== 'all').map(department => (
                                                <option key={department} value={department}>
                                                    {department.charAt(0).toUpperCase() + department.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {activeFilter === 'salary' && (
                                    <div className="form-control">
                                        <label className="label pb-1 pt-0">
                                            <span className="label-text font-medium">Select Salary Range</span>
                                        </label>
                                        <select
                                            className="select select-bordered select-sm w-full"
                                            value={filters.salary}
                                            onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                                        >
                                            <option value="all">All Salaries</option>
                                            <option value="under50k">Under $50K</option>
                                            <option value="50to100k">$50K - $100K</option>
                                            <option value="over100k">Over $100K</option>
                                        </select>
                                    </div>
                                )}
                                {activeFilter === 'location' && (
                                    <div className="form-control">
                                        <label className="label pb-1 pt-0">
                                            <span className="label-text font-medium">Select Location</span>
                                        </label>
                                        <select
                                            className="select select-bordered select-sm w-full"
                                            value={filters.location}
                                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                        >
                                            <option value="all">All Locations</option>
                                            {locations.filter(l => l !== 'all').map(location => (
                                                <option key={location} value={location}>
                                                    {location.charAt(0).toUpperCase() + location.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {!activeFilter && (
                                    <div className="flex items-center justify-center h-full text-base-content/50">
                                        <p>Select a filter category above</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active filters display */}
                    {(filters.department !== 'all' || filters.salary !== 'all' || filters.location !== 'all' || searchTerm) && (
                        <div className="mt-4 pt-4 border-t border-base-300">
                            <span className="text-sm font-medium text-base-content/70 mr-3">Active Filters:</span>
                            <div className="inline-flex flex-wrap gap-2">
                                {/* Search term badge */}
                                {searchTerm && (
                                    <div className="badge badge-primary badge-lg gap-1.5 py-3 shadow-sm">
                                        <span className="font-medium opacity-80">Search:</span> {searchTerm}
                                        <button className="btn btn-ghost btn-xs btn-circle ml-1" onClick={() => setSearchTerm('')}>✕</button>
                                    </div>
                                )}
                                {/* Department filter badge */}
                                {filters.department !== 'all' && (
                                    <div className="badge badge-primary badge-lg gap-1.5 py-3 shadow-sm">
                                        <FiTag size={12} className="opacity-70" />
                                        {filters.department.charAt(0).toUpperCase() + filters.department.slice(1)}
                                        <button className="btn btn-ghost btn-xs btn-circle ml-1" onClick={() => setFilters({ ...filters, department: 'all' })}>✕</button>
                                    </div>
                                )}
                                {/* Salary filter badge */}
                                {filters.salary !== 'all' && (
                                    <div className="badge badge-primary badge-lg gap-1.5 py-3 shadow-sm">
                                        <FiDollarSign size={12} className="opacity-70" />
                                        {filters.salary === 'under50k' ? 'Under $50K' : filters.salary === '50to100k' ? '$50K-$100K' : 'Over $100K'}
                                        <button className="btn btn-ghost btn-xs btn-circle ml-1" onClick={() => setFilters({ ...filters, salary: 'all' })}>✕</button>
                                    </div>
                                )}
                                {/* Location filter badge */}
                                {filters.location !== 'all' && (
                                    <div className="badge badge-primary badge-lg gap-1.5 py-3 shadow-sm">
                                        <FiMapPin size={12} className="opacity-70" />
                                        {filters.location.charAt(0).toUpperCase() + filters.location.slice(1)}
                                        <button className="btn btn-ghost btn-xs btn-circle ml-1" onClick={() => setFilters({ ...filters, location: 'all' })}>✕</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Job Results */}
                {filteredJobs.length === 0 ? (
                    <div className="card bg-base-200 p-12 text-center">
                        <div className="bg-base-300/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiBriefcase size={48} className="text-base-content/40" />
                        </div>
                        <h3 className="text-xl font-medium text-base-content mb-3">No job posts found</h3>
                        <p className="text-base-content/60 max-w-md mx-auto mb-6">
                            {searchTerm || filters.department !== 'all' || filters.salary !== 'all' || filters.location !== 'all' ?
                                `We couldn't find any jobs matching your current filters. Try adjusting your search criteria.` :
                                `No job posts available at the moment. Please check back later.`
                            }
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Top Trending jobs section */}
                        {(searchTerm === '' && filters.department === 'all' && filters.salary === 'all' && filters.location === 'all') && (
                            <div className="mb-12">
                                <div className="flex items-center gap-2 mb-6">
                                    <FiTrendingUp className="text-primary" size={24} />
                                    <h2 className="text-2xl font-bold">Trending Job Opportunities</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {jobPosts.slice(0, 3).map((job) => (
                                        <Jobpostcardforcandidate
                                            key={job._id}
                                            title={job.jobTitle}
                                            description={job.jobDescription}
                                            company={job.company}
                                            location={job.location}
                                            salary={job.salary}
                                            requirements={job.skills.join(', ')}
                                            department={job.department}
                                            createdAt={job.createdAt}
                                            onView={() => handleView(job._id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Jobs */}
                        <div>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <FiBriefcase className="text-primary" />
                                {searchTerm || filters.department !== 'all' || filters.salary !== 'all' || filters.location !== 'all' ?
                                    'Search Results' : 'All Job Listings'}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cards-container">
                                {filteredJobs.slice(0, visibleCount).map((job) => (
                                    <Jobpostcardforcandidate
                                        key={job._id}
                                        title={job.jobTitle}
                                        description={job.jobDescription}
                                        company={job.company}
                                        location={job.location}
                                        salary={job.salary}
                                        requirements={job.skills.join(', ')}
                                        department={job.department}
                                        createdAt={job.createdAt}
                                        onView={() => handleView(job._id)}
                                    />
                                ))}
                            </div>

                            {visibleCount < filteredJobs.length && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        className="btn btn-primary btn-wide"
                                        onClick={handleLoadMore}
                                    >
                                        Load More Jobs
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CandidateHome;
