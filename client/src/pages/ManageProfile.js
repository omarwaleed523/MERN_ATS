import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLock, FiUpload, FiCheckCircle, FiAlertTriangle, FiCamera, FiSave, FiX } from 'react-icons/fi';

const ManageProfile = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const userId = Cookies.get('userId');
    
    // State for profile data
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phonenumber: '',
    });
    
    // State for password change
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    
    // State for profile picture
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    
    // UI states
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'picture'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                navigate('/login');
                return;
            }
            
            try {
                setLoading(true);
                
                // Check if token exists
                if (!user.token) {
                    setMessage({
                        type: 'error',
                        text: 'Authentication token is missing. Please log in again.'
                    });
                    // Redirect to login after a delay
                    setTimeout(() => navigate('/login'), 3000);
                    return;
                }
                
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                
                setProfile({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    phonenumber: response.data.phonenumber || '',
                });                
                // Set preview image if profile picture exists
                if (response.data.profilepictureUrl) {
                    // Use the full URL provided by the server
                    setPreviewImage(response.data.profilepictureUrl);
                } else if (response.data.profilepicture) {
                    // Fallback to constructing the URL manually
                    const imageUrl = response.data.profilepicture.startsWith('http')
                        ? response.data.profilepicture
                        : `${process.env.REACT_APP_BACKEND_URL}${response.data.profilepicture}`;
                    setPreviewImage(imageUrl);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setMessage({
                    type: 'error',
                    text: 'Failed to load profile information. Please try again.'
                });
                
                // Handle unauthorized error
                if (error.response?.status === 401) {
                    setTimeout(() => navigate('/login'), 3000);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfile();
    }, [userId, navigate, user.token]);

    // Handle profile data change
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle password data change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Calculate password strength when new password changes
        if (name === 'newPassword') {
            setPasswordStrength(calculatePasswordStrength(value));
        }
    };

    // Handle profile picture change
    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Calculate password strength
    const calculatePasswordStrength = (password) => {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        
        // Uppercase check
        if (/[A-Z]/.test(password)) strength += 1;
        
        // Lowercase check
        if (/[a-z]/.test(password)) strength += 1;
        
        // Number check
        if (/[0-9]/.test(password)) strength += 1;
        
        // Special character check
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        
        return strength;
    };

    // Get strength color
    const getStrengthColor = () => {
        if (passwordStrength === 0) return 'bg-gray-300';
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength === 3) return 'bg-yellow-500';
        if (passwordStrength === 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    // Update profile information
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        // Check if token exists
        if (!user.token) {
            setMessage({
                type: 'error',
                text: 'Authentication token is missing. Please log in again.'
            });
            setTimeout(() => navigate('/login'), 3000);
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/auth/user/${userId}`, profile, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            
            // Update user context and cookies with new name
            if (response.data.user.name !== user.name) {
                setUser(prev => ({ ...prev, name: response.data.user.name }));
                Cookies.set('name', response.data.user.name);
            }
            
            setMessage({
                type: 'success',
                text: 'Profile information updated successfully!'
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile. Please try again.'
            });
            
            // Handle expired or invalid token
            if (error.response?.status === 401) {
                setTimeout(() => navigate('/login'), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Update password
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        // Validate passwords
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({
                type: 'error',
                text: 'New passwords do not match.'
            });
            return;
        }
        
        if (passwordStrength < 3) {
            setMessage({
                type: 'error',
                text: 'Password is too weak. Please choose a stronger password.'
            });
            return;
        }
        
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        // Check if token exists
        if (!user.token) {
            setMessage({
                type: 'error',
                text: 'Authentication token is missing. Please log in again.'
            });
            setTimeout(() => navigate('/login'), 3000);
            setLoading(false);
            return;
        }
        
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/auth/user/${userId}/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            setMessage({
                type: 'success',
                text: 'Password updated successfully!'
            });
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.msg || 'Failed to update password. Please check your current password and try again.'
            });
            
            // Handle expired or invalid token
            if (error.response?.status === 401) {
                setTimeout(() => navigate('/login'), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Update profile picture
    const handlePictureUpdate = async (e) => {
        e.preventDefault();
        
        if (!profilePicture) {
            setMessage({
                type: 'error',
                text: 'Please select a profile picture.'
            });
            return;
        }
        
        setLoading(true);
        setMessage({ type: '', text: '' });
        
        // Check if token exists
        if (!user.token) {
            setMessage({
                type: 'error',
                text: 'Authentication token is missing. Please log in again.'
            });
            setTimeout(() => navigate('/login'), 3000);
            setLoading(false);
            return;
        }
        
        try {
            const formData = new FormData();
            formData.append('profilepicture', profilePicture);
            
            // Updated URL to match the backend route pattern
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/auth/user/${userId}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${user.token}`
                }
            });
              // Update profile image in cookies and context
            // Use the full URL provided by the server if available
            let imageUrl;
            if (response.data.profilepictureUrl) {
                imageUrl = response.data.profilepictureUrl;
            } else if (response.data.profilepicture) {
                imageUrl = response.data.profilepicture?.startsWith('http')
                    ? response.data.profilepicture
                    : `${process.env.REACT_APP_BACKEND_URL}${response.data.profilepicture}`;
            }
            
            Cookies.set('profileImage', imageUrl);
            setUser({ ...user, profileImage: imageUrl });
            setPreviewImage(imageUrl); // Update the preview image as well
            
            setMessage({
                type: 'success',
                text: 'Profile picture updated successfully!'
            });
        } catch (error) {
            console.error('Error updating profile picture:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile picture. Please try again.'
            });
            
            // Handle expired or invalid token
            if (error.response?.status === 401) {
                setTimeout(() => navigate('/login'), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    // Clear preview image and reset file input
    const handleClearPicture = () => {
        setProfilePicture(null);
        setPreviewImage(user.profileImage || '');
    };

    // Display message component
    const MessageAlert = ({ type, text }) => {
        if (!text) return null;
        
        return (
            <div className={`alert ${type === 'error' ? 'alert-error' : 'alert-success'} my-4`}>
                <div className="flex items-center">
                    {type === 'error' ? <FiAlertTriangle className="mr-2" /> : <FiCheckCircle className="mr-2" />}
                    <span>{text}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-base-100">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary">Manage Your Profile</h1>
                    <p className="text-base-content/70 mt-2">Update your personal information, change your password, or update your profile picture</p>
                </div>
                
                {/* Tab Navigation */}
                <div className="tabs tabs-boxed mb-8 justify-center">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`tab tab-lg ${activeTab === 'profile' ? 'tab-active' : ''}`}
                    >
                        <FiUser className="mr-2" /> Profile Info
                    </button>
                    <button 
                        onClick={() => setActiveTab('password')}
                        className={`tab tab-lg ${activeTab === 'password' ? 'tab-active' : ''}`}
                    >
                        <FiLock className="mr-2" /> Password
                    </button>
                    <button 
                        onClick={() => setActiveTab('picture')}
                        className={`tab tab-lg ${activeTab === 'picture' ? 'tab-active' : ''}`}
                    >
                        <FiCamera className="mr-2" /> Profile Picture
                    </button>
                </div>
                
                {/* Card Container */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        
                        {/* Profile Info Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="card-title text-xl mb-6">Update Your Profile Information</h2>
                                
                                <MessageAlert type={message.type} text={message.text} />
                                
                                <form onSubmit={handleProfileUpdate}>
                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text flex items-center">
                                                <FiUser className="mr-2" /> Name
                                            </span>
                                        </label>
                                        <input 
                                            type="text" 
                                            name="name"
                                            value={profile.name}
                                            onChange={handleProfileChange}
                                            className="input input-bordered"
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text flex items-center">
                                                <FiMail className="mr-2" /> Email
                                            </span>
                                        </label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={profile.email}
                                            onChange={handleProfileChange}
                                            className="input input-bordered"
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text flex items-center">
                                                <FiPhone className="mr-2" /> Phone Number
                                            </span>
                                        </label>
                                        <input 
                                            type="tel" 
                                            name="phonenumber"
                                            value={profile.phonenumber}
                                            onChange={handleProfileChange}
                                            className="input input-bordered" 
                                        />
                                    </div>
                                    
                                    <div className="form-control mt-6">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? <span className="loading loading-spinner"></span> : <FiSave className="mr-2" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div>
                                <h2 className="card-title text-xl mb-6">Change Your Password</h2>
                                
                                <MessageAlert type={message.type} text={message.text} />
                                
                                <form onSubmit={handlePasswordUpdate}>
                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text">Current Password</span>
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type={showCurrentPassword ? 'text' : 'password'} 
                                                name="currentPassword"
                                                value={passwordData.currentPassword}
                                                onChange={handlePasswordChange}
                                                className="input input-bordered w-full pr-10"
                                                required 
                                            />
                                            <button 
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="form-control mb-4">
                                        <label className="label">
                                            <span className="label-text">New Password</span>
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type={showNewPassword ? 'text' : 'password'} 
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="input input-bordered w-full pr-10"
                                                required 
                                            />
                                            <button 
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                        
                                        {/* Password Strength Bar */}
                                        {passwordData.newPassword && (
                                            <div className="mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div 
                                                        className={`h-2.5 rounded-full ${getStrengthColor()}`} 
                                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs mt-1">
                                                    Password strength: {
                                                        passwordStrength === 0 ? 'Very Weak' :
                                                        passwordStrength <= 2 ? 'Weak' :
                                                        passwordStrength === 3 ? 'Fair' :
                                                        passwordStrength === 4 ? 'Strong' : 'Very Strong'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="form-control mb-6">
                                        <label className="label">
                                            <span className="label-text">Confirm New Password</span>
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type={showConfirmPassword ? 'text' : 'password'} 
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className={`input input-bordered w-full pr-10 ${
                                                    passwordData.newPassword && 
                                                    passwordData.confirmPassword && 
                                                    passwordData.newPassword !== passwordData.confirmPassword 
                                                        ? 'input-error' 
                                                        : ''
                                                }`}
                                                required 
                                            />
                                            <button 
                                                type="button"
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? "Hide" : "Show"}
                                            </button>
                                        </div>
                                        {passwordData.newPassword && 
                                         passwordData.confirmPassword && 
                                         passwordData.newPassword !== passwordData.confirmPassword && (
                                            <label className="label">
                                                <span className="label-text-alt text-error">Passwords do not match</span>
                                            </label>
                                        )}
                                    </div>
                                    
                                    <div className="form-control mt-6">
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={loading || (passwordData.newPassword !== passwordData.confirmPassword)}
                                        >
                                            {loading ? <span className="loading loading-spinner"></span> : <FiLock className="mr-2" />}
                                            Update Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                        
                        {/* Profile Picture Tab */}
                        {activeTab === 'picture' && (
                            <div>
                                <h2 className="card-title text-xl mb-6">Update Your Profile Picture</h2>
                                
                                <MessageAlert type={message.type} text={message.text} />
                                
                                <div className="flex flex-col items-center mb-6">
                                    {/* Profile image preview */}
                                    <div className="avatar mb-4">
                                        <div className="w-40 h-40 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-gray-200 flex items-center justify-center">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <FiUser className="w-20 h-20 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* File input */}
                                    <form onSubmit={handlePictureUpdate} className="w-full max-w-xs">
                                        <div className="form-control mb-4">
                                            <label className="label">
                                                <span className="label-text">Select a new profile picture</span>
                                            </label>
                                            <input 
                                                type="file" 
                                                className="file-input file-input-bordered w-full"
                                                accept="image/*"
                                                onChange={handlePictureChange}
                                            />
                                            <label className="label">
                                                <span className="label-text-alt">Supported formats: JPG, PNG, GIF</span>
                                            </label>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            {profilePicture && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline btn-error flex-1"
                                                    onClick={handleClearPicture}
                                                >
                                                    <FiX className="mr-2" /> Clear
                                                </button>
                                            )}
                                            
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary flex-1"
                                                disabled={loading || !profilePicture}
                                            >
                                                {loading ? <span className="loading loading-spinner"></span> : <FiUpload className="mr-2" />}
                                                Upload
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageProfile;