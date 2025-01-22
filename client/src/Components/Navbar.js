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
        const role = Cookies.get('role');

        if (userId) {
            setUser({ profileImage, role });
        }
    }, [setUser]);

    const handleLogout = () => {
        Cookies.remove('userId');
        Cookies.remove('profileImage');
        Cookies.remove('role');
        setUser({ profileImage: '', role: '' });
        navigate('/login');
    };

    return (
        <div className="navbar bg-base-100 shadow-md flex justify-between items-center">
            <div className="flex">
                <Link to='/'> <span className="btn btn-ghost normal-case text-xl">MLAR</span></Link>
            </div>
            <div className="flex justify-center space-x-4 flex-1">

                {user.role === 'Recruiter' && (
                    <Link to='/recruiterhome'><button className='button'>Recruiter Dashboard</button></Link>
                )}
                {user.role === 'Candidate' && (<>
                    <Link to='/candidatehome'><button className='button'>Job Posts</button></Link>
                    <Link to='/parseresume'><button className='button'>Parse Resume</button></Link>
                    <Link to={`/applications/${Cookies.get('userId')}`}><button className='button'>Applications</button></Link>
                </>
                )}
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
                        <Link to="/login" className="button">Login</Link>
                        <Link to="/signup" className="btnsecondary">Signup</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Navbar;