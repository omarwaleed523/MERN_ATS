import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Cookies from 'js-cookie';

const Navbar = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');
    const themes = ["light", "aqua", "dark", "valentine", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk"];
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profileImageError, setProfileImageError] = useState(false);
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

    useEffect(() => {
        const userId = Cookies.get('userId');
        const profileImage = Cookies.get('profileImage');
        const role = Cookies.get('role');
        const name = Cookies.get('name');
        const token = Cookies.get('token');
        const savedTheme = localStorage.getItem('theme') || 'light';
        
        document.querySelector('html').setAttribute('data-theme', savedTheme);
        setCurrentTheme(savedTheme);

        if (userId && token) {
            // Format profile image URL if it doesn't start with http
            const formattedProfileImage = profileImage && !profileImage.startsWith('http') 
                ? `http://localhost:5000${profileImage}` 
                : profileImage;
                
            setUser({ profileImage: formattedProfileImage, role, userId, name, token });
            setIsLoggedIn(true);
            // Reset profile image error state when user context changes
            setProfileImageError(false);
        } else {
            setIsLoggedIn(false);
        }
    }, [setUser]);

    const handleThemeChange = (theme) => {
        document.querySelector('html').setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        setCurrentTheme(theme);
        setIsThemeDropdownOpen(false);
    };

    const handleLogout = () => {
        Cookies.remove('userId');
        Cookies.remove('profileImage');
        Cookies.remove('role');
        Cookies.remove('name');
        Cookies.remove('token');
        setUser({ profileImage: '', role: '', userId: '', name: '' });
        setIsLoggedIn(false);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const toggleThemeDropdown = () => {
        setIsThemeDropdownOpen(!isThemeDropdownOpen);
    };

    const handleManageProfile = () => {
        setIsDropdownOpen(false);
        navigate('/manageprofile');
    };

    const handleLogoutClick = () => {
        setIsDropdownOpen(false);
        handleLogout();
    };
    
    // Handle profile image load error
    const handleImageError = () => {
        setProfileImageError(true);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.profile-dropdown')) {
                setIsDropdownOpen(false);
            }
            if (isThemeDropdownOpen && !event.target.closest('.theme-dropdown')) {
                setIsThemeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen, isThemeDropdownOpen]);

    // Force re-evaluate login status when cookies change
    useEffect(() => {
        const checkLoginStatus = () => {
            const userId = Cookies.get('userId');
            setIsLoggedIn(!!userId);
        };
        
        // Check immediately and set up interval
        checkLoginStatus();
        const interval = setInterval(checkLoginStatus, 5000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="navbar bg-base-100 shadow-md">
            <div className="navbar-start">
                <div className="dropdown">
                    <label tabIndex={0} className="btn btn-ghost lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </label>
                    {isMenuOpen && (
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            {user.role === 'Recruiter' && (
                                <>
                                    <li><Link to='/recruiterhome' className="button">Recruiter Dashboard</Link></li>
                                    <li><Link to='/recruiterapplications' className="button">Recruiter Applications</Link></li>
                                    <li><Link to='/recruiterinterviews' className="button">Interviews</Link></li>
                                </>
                            )}
                            {user.role === 'Candidate' && (
                                <>
                                    <li><Link to='/candidatehome' className="button">Job Posts</Link></li>
                                    <li><Link to='/parseresume' className="button">Parse Resume</Link></li>
                                    <li><Link to={`/applications/${Cookies.get('userId')}`} className="button">Applications</Link></li>
                                    <li><Link to='/candidateinterviews' className="button">Interviews</Link></li>
                                </>
                            )}
                            {user.role === 'Administrator' && (
                                <>
                                    <li><Link to='/admin/dashboard' className="button">Admin Dashboard</Link></li>
                                    <li><Link to='/admin/users' className="button">Manage Users</Link></li>
                                    <li><Link to='/admin/interviews' className="button">Interviews</Link></li>
                                </>
                            )}
                        </ul>
                    )}
                </div>
                <Link to='/' className="btn btn-ghost normal-case text-xl">MLAR</Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 space-x-2">
                    {user.role === 'Recruiter' && (
                        <>
                            <li><Link to='/recruiterhome' className="button">Recruiter Dashboard</Link></li>
                            <li><Link to='/recruiterapplications' className="button">Recruiter Applications</Link></li>
                            <li><Link to='/recruiterinterviews' className="button">Interviews</Link></li>
                        </>
                    )}
                    {user.role === 'Candidate' && (
                        <>
                            <li><Link to='/candidatehome' className="button">Job Posts</Link></li>
                            <li><Link to='/parseresume' className="button">Parse Resume</Link></li>
                            <li><Link to={`/applications/${Cookies.get('userId')}`} className="button">Applications</Link></li>
                            <li><Link to='/candidateinterviews' className="button">Interviews</Link></li>
                        </>
                    )}
                    {user.role === 'Administrator' && (
                        <>
                            <li><Link to='/admin/dashboard' className="button">Admin Dashboard</Link></li>
                            <li><Link to='/admin/users' className="button">Manage Users</Link></li>
                            <li><Link to='/admin/interviews' className="button">Interviews</Link></li>
                        </>
                    )}
                </ul>
            </div>

            <div className="navbar-end">
                <div className="theme-dropdown dropdown dropdown-end mr-2">
                    <div 
                        tabIndex={0} 
                        className="btn btn-ghost gap-1"
                        onClick={toggleThemeDropdown}
                    >
                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current md:h-6 md:w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                        </svg>
                        <span className="hidden md:inline">Theme</span>
                        <svg width="12px" height="12px" className="ml-1 hidden h-3 w-3 fill-current opacity-60 sm:inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
                            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                        </svg>
                    </div>
                    {isThemeDropdownOpen && (
                        <div className="dropdown-content bg-base-200 text-base-content rounded-box absolute top-full right-0 mt-2 z-[999] w-56 overflow-y-auto shadow-2xl max-h-96">
                            <div className="grid grid-cols-1 gap-3 p-3" tabIndex={0}>
                                {themes.map((theme) => (
                                    <button
                                        key={theme}
                                        className={`outline-base-content overflow-hidden rounded-lg text-left ${currentTheme === theme ? 'outline outline-2 outline-offset-2' : ''}`}
                                        data-set-theme={theme}
                                        onClick={() => handleThemeChange(theme)}
                                    >
                                        <div data-theme={theme} className="bg-base-100 text-base-content w-full cursor-pointer font-sans">
                                            <div className="grid grid-cols-5 grid-rows-3">
                                                <div className="col-span-5 row-span-3 row-start-1 flex items-center gap-2 px-4 py-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0">
                                                        <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path>
                                                    </svg>
                                                    <div className="flex-grow text-sm">{theme}</div>
                                                    <div className="flex h-full flex-shrink-0 flex-wrap gap-1">
                                                        <div className="bg-primary w-2 rounded"></div>
                                                        <div className="bg-secondary w-2 rounded"></div>
                                                        <div className="bg-accent w-2 rounded"></div>
                                                        <div className="bg-neutral w-2 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {isLoggedIn ? (
                    <div className="profile-dropdown dropdown dropdown-end relative">
                        <label 
                            tabIndex={0} 
                            className="btn btn-ghost btn-circle avatar cursor-pointer"
                            onClick={toggleDropdown}
                        >
                            <div className="w-10 rounded-full bg-base-300 overflow-hidden">
                                {user.profileImage && !profileImageError ? (
                                    <img 
                                        src={user.profileImage} 
                                        alt="User Profile" 
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-lg font-semibold uppercase bg-primary text-primary-content">
                                        {user.name ? user.name.charAt(0) : '?'}
                                    </div>
                                )}
                            </div>
                        </label>
                        {isDropdownOpen && (
                            <ul 
                                tabIndex={0}
                                className="menu menu-sm dropdown-content absolute top-full right-0 mt-3 z-50 p-2 shadow bg-base-100 rounded-box w-52"
                            >
                                <li>
                                    <button onClick={handleManageProfile} className="text-left">
                                        Manage Profile
                                    </button>
                                </li>
                                <li>
                                    <button onClick={handleLogoutClick} className="text-left">
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="flex space-x-4">
                        <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
                        <Link to="/signup" className="btn btn-outline btn-primary btn-sm">Signup</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;