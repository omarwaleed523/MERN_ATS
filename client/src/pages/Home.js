import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiUserPlus, FiBriefcase, FiPieChart, FiSearch, FiCpu, FiCheck, FiChevronRight, FiUsers, FiSettings, FiShield } from 'react-icons/fi';
import { UserContext } from '../context/UserContext';
import Cookies from 'js-cookie';

const Home = () => {
    // Get user context and check if user is logged in
    const { user } = useContext(UserContext);
    const isLoggedIn = !!Cookies.get('userId');
    
    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-content/5 to-secondary-content/5 z-0">
                    <div className="absolute inset-0" style={{ 
                        backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)', 
                        backgroundSize: '30px 30px',
                        opacity: 0.15
                    }}></div>
                </div>

                <div className="container mx-auto px-6 py-20 relative z-10">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 md:pr-10">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-base-content">
                                Streamline Your <span className="text-primary">Hiring</span> Process
                            </h1>
                            <p className="text-lg md:text-xl opacity-80 mb-8">
                                Our intelligent Applicant Tracking System matches the right candidates with the right roles through advanced AI-powered resume parsing and job matching.
                            </p>
                            
                            {/* Show action buttons only if not logged in */}
                            {!isLoggedIn && (
                                <>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link to="/signup" className="btn btn-primary btn-lg">
                                            Get Started
                                            <FiChevronRight className="ml-1" />
                                        </Link>
                                        <Link to="/login" className="btn btn-outline btn-lg">
                                            Sign In
                                        </Link>
                                    </div>
                                    <div className="mt-6 flex items-center text-sm opacity-70">
                                        <FiCheck className="mr-2 text-primary" /> No credit card required
                                    </div>
                                </>
                            )}
                            
                            {/* If user is logged in, show a different CTA based on their role */}
                            {isLoggedIn && (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {user.role === 'Recruiter' ? (
                                        <Link to="/recruiterhome" className="btn btn-primary btn-lg">
                                            Go to Dashboard
                                            <FiChevronRight className="ml-1" />
                                        </Link>
                                    ) : user.role === 'Administrator' ? (
                                        <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                                            Admin Dashboard
                                            <FiChevronRight className="ml-1" />
                                        </Link>
                                    ) : (
                                        <Link to="/candidatehome" className="btn btn-primary btn-lg">
                                            Browse Jobs
                                            <FiChevronRight className="ml-1" />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="md:w-1/2 mt-10 md:mt-0">
                            <div className="relative">
                                {/* Abstract illustration representing ATS */}
                                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-1 rounded-lg shadow-xl">
                                    <div className="bg-base-100 rounded-lg p-6 border border-base-300/50">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <FiUsers className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">Smart Candidate Matching</h3>
                                                <p className="text-sm opacity-70">AI-powered resume analysis</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="bg-base-200 h-16 rounded flex items-center px-4 gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0"></div>
                                                <div className="w-full">
                                                    <div className="h-3 bg-primary/10 rounded-full w-3/4"></div>
                                                    <div className="h-2 bg-primary/10 rounded-full w-1/2 mt-2"></div>
                                                </div>
                                                <div className="badge badge-primary">95%</div>
                                            </div>
                                            <div className="bg-base-200 h-16 rounded flex items-center px-4 gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex-shrink-0"></div>
                                                <div className="w-full">
                                                    <div className="h-3 bg-secondary/10 rounded-full w-2/3"></div>
                                                    <div className="h-2 bg-secondary/10 rounded-full w-2/5 mt-2"></div>
                                                </div>
                                                <div className="badge badge-secondary">82%</div>
                                            </div>
                                            <div className="bg-base-200 h-16 rounded flex items-center px-4 gap-3">
                                                <div className="w-8 h-8 rounded-full bg-accent/20 flex-shrink-0"></div>
                                                <div className="w-full">
                                                    <div className="h-3 bg-accent/10 rounded-full w-1/2"></div>
                                                    <div className="h-2 bg-accent/10 rounded-full w-3/5 mt-2"></div>
                                                </div>
                                                <div className="badge badge-accent">76%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Customized based on user role */}
            <section className="py-16 bg-base-200">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">
                            {isLoggedIn && user.role === 'Administrator' 
                                ? 'Administration Tools' 
                                : 'Powerful ATS Features'
                            }
                        </h2>
                        <p className="max-w-2xl mx-auto opacity-70">
                            {isLoggedIn && user.role === 'Administrator' 
                                ? 'Comprehensive tools to manage users, monitor system performance, and ensure smooth operation of your ATS platform.'
                                : 'Everything you need to streamline your hiring process, from posting jobs to selecting the perfect candidate.'
                            }
                        </p>
                    </div>

                    {/* Show admin-specific features for administrators */}
                    {isLoggedIn && user.role === 'Administrator' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Admin Feature Card 1 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center mb-5">
                                    <FiShield className="h-6 w-6 text-warning" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">System Dashboard</h3>
                                <p className="opacity-70 mb-5">
                                    Monitor key metrics, system performance, and user activity across the entire platform.
                                </p>
                                <div className="flex items-center text-warning text-sm font-medium">
                                    <Link to="/admin/dashboard" className="flex items-center">
                                        Go to Dashboard <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Admin Feature Card 2 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                                    <FiUsers className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">User Management</h3>
                                <p className="opacity-70 mb-5">
                                    Create, edit and manage all users including administrators, recruiters, and candidates.
                                </p>
                                <div className="flex items-center text-primary text-sm font-medium">
                                    <Link to="/admin/users" className="flex items-center">
                                        Manage Users <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Admin Feature Card 3 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-5">
                                    <FiSettings className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">System Configuration</h3>
                                <p className="opacity-70 mb-5">
                                    Configure system settings, view database schemas, and manage global parameters.
                                </p>
                                <div className="flex items-center text-secondary text-sm font-medium">
                                    <Link to="/admin/schemas" className="flex items-center">
                                        View Schemas <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Admin Feature Card 4 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                                    <FiBriefcase className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Job Post Management</h3>
                                <p className="opacity-70 mb-5">
                                    Review, approve, or modify job postings across all recruiters and companies.
                                </p>
                                <div className="flex items-center text-accent text-sm font-medium">
                                    <Link to="/admin/jobs" className="flex items-center">
                                        Manage Jobs <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Admin Feature Card 5 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center mb-5">
                                    <FiPieChart className="h-6 w-6 text-info" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Analytics</h3>
                                <p className="opacity-70 mb-5">
                                    Access comprehensive system analytics, user activities, and platform usage patterns.
                                </p>
                                <div className="flex items-center text-info text-sm font-medium">
                                    <Link to="/admin/dashboard" className="flex items-center">
                                        View Analytics <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Admin Feature Card 6 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-error/10 flex items-center justify-center mb-5">
                                    <FiCpu className="h-6 w-6 text-error" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Application Management</h3>
                                <p className="opacity-70 mb-5">
                                    Review and manage all job applications submitted through the platform.
                                </p>
                                <div className="flex items-center text-error text-sm font-medium">
                                    <Link to="/admin/applications" className="flex items-center">
                                        View Applications <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature Card 1 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                                    <FiBriefcase className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Job Posting</h3>
                                <p className="opacity-70 mb-5">
                                    Easily create and manage job listings with custom requirements and application workflows.
                                </p>
                                <div className="flex items-center text-primary text-sm font-medium">
                                    <Link to={isLoggedIn ? (user.role === 'Recruiter' ? '/recruiterhome' : '/candidatehome') : '/signup'} className="flex items-center">
                                        Learn More <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Feature Card 2 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-5">
                                    <FiUserPlus className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Resume Parsing</h3>
                                <p className="opacity-70 mb-5">
                                    Advanced AI technology that extracts and analyzes candidate information from uploaded resumes.
                                </p>
                                <div className="flex items-center text-secondary text-sm font-medium">
                                    <Link to={isLoggedIn ? '/parseresume' : '/signup'} className="flex items-center">
                                        Learn More <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Feature Card 3 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                                    <FiCpu className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">AI Matching</h3>
                                <p className="opacity-70 mb-5">
                                    Smart algorithms that match candidate skills and experience with job requirements.
                                </p>
                                <div className="flex items-center text-accent text-sm font-medium">
                                    <Link to={isLoggedIn ? (user.role === 'Candidate' ? '/applications/' + Cookies.get('userId') : '/recruiterapplications') : '/signup'} className="flex items-center">
                                        Learn More <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Feature Card 4 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                                    <FiSearch className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Advanced Search</h3>
                                <p className="opacity-70 mb-5">
                                    Quickly find the best candidates with powerful filtering and searching capabilities.
                                </p>
                                <div className="flex items-center text-primary text-sm font-medium">
                                    <Link to={isLoggedIn ? '/candidatehome' : '/signup'} className="flex items-center">
                                        Learn More <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Feature Card 5 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-5">
                                    <FiPieChart className="h-6 w-6 text-secondary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
                                <p className="opacity-70 mb-5">
                                    Get insights into your hiring process with comprehensive analytics and reporting tools.
                                </p>
                                <div className="flex items-center text-secondary text-sm font-medium">
                                    <Link to={isLoggedIn && user.role === 'Recruiter' ? '/recruiterhome' : '/signup'} className="flex items-center">
                                        Learn More <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>

                            {/* Feature Card 6 */}
                            <div className="bg-base-100 p-6 rounded-xl shadow-md border border-base-300/50 hover:shadow-lg transition-shadow">
                                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-5">
                                    <FiUsers className="h-6 w-6 text-accent" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">Candidate Management</h3>
                                <p className="opacity-70 mb-5">
                                    Track and manage applications through your customized hiring workflow with ease.
                                </p>
                                <div className="flex items-center text-accent text-sm font-medium">
                                    <Link to={isLoggedIn ? (user.role === 'Recruiter' ? '/recruiterapplications' : '/applications/' + Cookies.get('userId')) : '/signup'} className="flex items-center">
                                        Learn More <FiChevronRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action Section - Modified based on login status & role */}
            <section className="py-20 bg-base-100">
                <div className="container mx-auto px-6">
                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-10 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                        
                        <div className="max-w-3xl mx-auto text-center relative z-10">
                            {!isLoggedIn ? (
                                <>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Hiring Process?</h2>
                                    <p className="text-lg md:text-xl opacity-80 mb-10 max-w-2xl mx-auto">
                                        Join thousands of companies finding the perfect candidates faster and more efficiently with our AI-powered ATS.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link to="/signup" className="btn btn-primary btn-lg">
                                            Get Started For Free
                                        </Link>
                                        <Link to="/login" className="btn btn-outline btn-lg">
                                            Existing User? Sign In
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                        {user.role === 'Recruiter' 
                                            ? 'Ready to Find Your Next Great Hire?' 
                                            : user.role === 'Administrator'
                                            ? 'Manage Your ATS Platform'
                                            : 'Ready to Find Your Dream Job?'}
                                    </h2>
                                    <p className="text-lg md:text-xl opacity-80 mb-10 max-w-2xl mx-auto">
                                        {user.role === 'Recruiter' 
                                            ? 'Use our AI-powered tools to find the perfect candidates for your open positions.'
                                            : user.role === 'Administrator'
                                            ? 'Access comprehensive admin tools to ensure smooth operation of your applicant tracking system.'
                                            : 'Browse available positions and let our AI match your skills with the perfect job.'}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        {user.role === 'Recruiter' ? (
                                            <>
                                                <Link to="/recruiterhome" className="btn btn-primary btn-lg">
                                                    View Dashboard
                                                </Link>
                                                <Link to="/recruiterapplications" className="btn btn-outline btn-lg">
                                                    Manage Applications
                                                </Link>
                                            </>
                                        ) : user.role === 'Administrator' ? (
                                            <>
                                                <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                                                    Admin Dashboard
                                                </Link>
                                                <Link to="/admin/users" className="btn btn-outline btn-lg">
                                                    Manage Users
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/candidatehome" className="btn btn-primary btn-lg">
                                                    Browse Jobs
                                                </Link>
                                                <Link to="/parseresume" className="btn btn-outline btn-lg">
                                                    Upload Resume
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;