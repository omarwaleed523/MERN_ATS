import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Cookies from 'js-cookie';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Check if login was successful
      if (!response.data.success) {
        setError(response.data.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }
      
      // Extract user data from response
      const { userId, role, token, name, profileImage } = response.data;
      
      // Make sure profileImage is a full URL
      const profileImageUrl = profileImage
        ? profileImage.startsWith('http') 
          ? profileImage 
          : `http://localhost:5000${profileImage}`
        : null;

      // Set cookies for user data (7 day expiry)
      Cookies.set('userId', userId, { expires: 7 });
      Cookies.set('name', name || '', { expires: 7 });
      Cookies.set('profileImage', profileImageUrl || '', { expires: 7 });
      Cookies.set('role', role, { expires: 7 });
      Cookies.set('token', token, { expires: 7 });
      
      // Update user context
      setUser({
        userId,
        name: name || '',
        profileImage: profileImageUrl,
        role,
        token
      });

      // Navigate based on role
      if (role === 'Recruiter') {
        navigate('/recruiterhome');
      } else if (role === 'Candidate') {
        navigate('/candidatehome');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.msg || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="bg-primary p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h1 className="text-2xl text-base-100 font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full button flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;