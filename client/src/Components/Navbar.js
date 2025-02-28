import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Cookies from 'js-cookie';

const Navbar = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');
    const themes = ["light", "dark", "valentine", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk"];

    useEffect(() => {
        const profileImage = Cookies.get('profileImage');
        const userId = Cookies.get('userId');
        const role = Cookies.get('role');
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.querySelector('html').setAttribute('data-theme', savedTheme);
        setCurrentTheme(savedTheme);

        if (userId) {
            setUser({ profileImage, role });
        }
    }, [setUser]);

    const handleThemeChange = (theme) => {
        document.querySelector('html').setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        setCurrentTheme(theme);
    };

    const handleLogout = () => {
        Cookies.remove('userId');
        Cookies.remove('profileImage');
        Cookies.remove('role');
        setUser({ profileImage: '', role: '' });
        navigate('/login');
    };

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
                                <li><Link to='/recruiterhome' className="button">Recruiter Dashboard</Link></li>
                            )}
                            {user.role === 'Candidate' && (<>
                                <li><Link to='/candidatehome' className="button">Job Posts</Link></li>
                                <li><Link to='/parseresume' className="button">Parse Resume</Link></li>
                                <li><Link to={`/applications/${Cookies.get('userId')}`} className="button">Applications</Link></li>
                            </>)}
                        </ul>
                    )}
                </div>
                <Link to='/' className="btn btn-ghost normal-case text-xl">MLAR</Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 space-x-2">
                    {user.role === 'Recruiter' && (
                        <li><Link to='/recruiterhome' className="button">Recruiter Dashboard</Link></li>
                    )}
                    {user.role === 'Candidate' && (<>
                        <li><Link to='/candidatehome' className="button">Job Posts</Link></li>
                        <li><Link to='/parseresume' className="button">Parse Resume</Link></li>
                        <li><Link to={`/applications/${Cookies.get('userId')}`} className="button">Applications</Link></li>
                    </>)}
                </ul>
            </div>

            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} className="btn btn-ghost gap-1">
                        <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current md:h-6 md:w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                        </svg>
                        <span className="hidden md:inline">Theme</span>
                        <svg width="12px" height="12px" className="ml-1 hidden h-3 w-3 fill-current opacity-60 sm:inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
                            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                        </svg>
                    </div>
                    <div className="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[70vh] max-h-96 w-56 overflow-y-auto shadow-2xl">
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
                </div>

                {user.profileImage ? (
                    <div className="dropdown dropdown-end ml-4">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img src={user.profileImage || "https://via.placeholder.com/150"} alt="User Profile" />
                            </div>
                        </label>
                        <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                            <li>
                                <Link to="/manageprofile">Manage Profile</Link>
                            </li>
                            <li onClick={handleLogout}>
                                <a>Logout</a>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="flex space-x-4">
                        <Link to="/login" className="button">Login</Link>
                        <Link to="/signup" className="btnsecondary">Signup</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;