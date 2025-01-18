import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Cookies from 'js-cookie';

const Navbar = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const profileImage = Cookies.get('profileImage');
        const userId = Cookies.get('userId');

        if (profileImage && userId) {
            setUser({ profileImage });
        }
    }, [setUser]);

    const handleLogout = () => {
        Cookies.remove('userId');
        Cookies.remove('profileImage');
        setUser({ profileImage: '' });
        navigate('/login');
    };

    return (
        <div className="navbar bg-base-100 shadow-md">
            <div className="flex-1">
                <a className="btn btn-ghost normal-case text-xl">MLAR</a>
            </div>
            <div className="flex-none">
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
                                Logout
                            </li>
                        </ul>
                    </div>
                ) : (
                    <div className="flex space-x-4">
                        <Link to="/login" className="btn btn-primary">Login</Link>
                        <Link to="/signup" className="btn btn-secondary">Signup</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;