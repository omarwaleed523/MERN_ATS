import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { FiUserPlus, FiBriefcase } from 'react-icons/fi';
import AnimatedBackground from '../Components/AnimatedBackground';
import AuthForm, { TextField, PasswordField, FormIcons } from '../Components/AuthForm';

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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, formData);

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
          : `${process.env.REACT_APP_BACKEND_URL}${profileImage}`
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
      // Extract error message from response if available
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('Full error response:', err.response);
        
        // For 400 Bad Request (typical for authentication errors)
        if (err.response.status === 400) {
          errorMessage = err.response.data.message || 'Invalid credentials. Please check your email and password.';
        } else {
          errorMessage = err.response.data.message || err.response.data.msg || errorMessage;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Server did not respond. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Define form fields
  const fields = (
    <>
      <TextField 
        label="Email"
        icon={FormIcons.email}
        type="email"
        name="email"
        value={email}
        onChange={onChange}
        placeholder="Enter your email"
        required
      />
      
      <PasswordField
        showPassword={showPassword}
        toggleShowPassword={() => setShowPassword(!showPassword)}
        name="password"
        value={password}
        onChange={onChange}
        placeholder="Enter your password"
        required
      />
    </>
  );

  return (
    <div className="min-h-screen bg-base-100 pt-16"> {/* Added pt-16 to create space for navbar */}
      {/* The navbar is now above this page content, rendered from App.js */}
      <AnimatedBackground />
      
      {/* Background pattern */}
      <div className="absolute inset-0 top-16 bg-gradient-to-br from-primary-content/5 to-secondary-content/5 z-0">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle, var(--p) 1px, transparent 1px)', 
          backgroundSize: '30px 30px',
          opacity: 0.1
        }}></div>
      </div>
      
      {/* Main Content - Added flex and items-center to vertically center the content */}
      <div className="container mx-auto px-6 py-8 relative z-10 flex items-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col md:flex-row items-center gap-10 justify-center w-full">
          {/* Left Section - Welcome Copy */}
          <motion.div 
            className="md:w-1/2 max-w-md"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-base-content">
              Welcome <span className="text-primary">Back</span>
            </h2>
            <p className="text-lg opacity-80 mb-6">
              Log into your account to access your dashboard, manage job applications, and connect with top talent or opportunities.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mt-1 flex-shrink-0">
                  <FiUserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">For Candidates</h3>
                  <p className="opacity-70 text-sm">Access your profile, browse job listings, and track your applications.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center mt-1 flex-shrink-0">
                  <FiBriefcase className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">For Recruiters</h3>
                  <p className="opacity-70 text-sm">Manage job postings, review applications, and find the perfect candidates.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Section - Login Form */}
          <div className="md:w-1/2 max-w-md w-full">
            <AuthForm
              title="Login"
              onSubmit={onSubmit}
              loading={loading}
              error={error}
              fields={fields}
            >
              <div className="text-sm text-base-content/70">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </AuthForm>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;