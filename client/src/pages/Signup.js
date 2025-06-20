import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiBriefcase, FiShield } from 'react-icons/fi';
import AnimatedBackground from '../Components/AnimatedBackground';
import AuthForm, { 
  TextField, 
  PasswordField, 
  SelectField, 
  FileField,
  PasswordStrengthMeter,
  FormIcons 
} from '../Components/AuthForm';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phonenumber: '',
    role: 'Candidate',
    company: '',
    profilepicture: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedFileName, setSelectedFileName] = useState('');
  const navigate = useNavigate();

  const { name, email, password, phonenumber, role, company } = formData;

  // Handle input changes
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field errors when the user types
    setFieldErrors({ ...fieldErrors, [name]: '' });
    setError('');
    
    // Validate email format
    if (name === 'email') {
      if (!/\S+@\S+\.\S+/.test(value)) {
        setEmailError('Please enter a valid email address (e.g., example@domain.com).');
      } else {
        setEmailError('');
      }
    }

    // Calculate password strength
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  // Handle file upload
  const onFileChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, profilepicture: e.target.files[0] });
      setSelectedFileName(e.target.files[0].name);
    }
  };

  // Calculate password strength (capped at 5)
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Cap the strength at 5
    return Math.min(strength, 5);
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    const errors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    if (!password.trim()) errors.password = 'Password is required.';
    if (!role.trim()) errors.role = 'Role is required.';

    // If there are errors, stop the submission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address (e.g., example@domain.com).');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.');
      setLoading(false);
      return;
    }

    // Create FormData for file upload
    const data = new FormData();
    data.append('name', name);
    data.append('email', email);
    data.append('password', password);
    data.append('phonenumber', phonenumber);
    data.append('role', role);
    
    // Add company data for recruiter role
    if (role === 'Recruiter') {
      if (!company.trim()) {
        setFieldErrors({ ...fieldErrors, company: 'Company is required for recruiters.' });
        setLoading(false);
        return;
      }
      data.append('company', company);
    }
    
    if (formData.profilepicture) {
      data.append('profilepicture', formData.profilepicture);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        // Show success message to user
        alert('Registration successful! Please log in.'); 
        navigate('/login'); // Redirect to login page
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.msg || 
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Define form fields
  const fields = (
    <>
      <TextField 
        label="Name"
        icon={FormIcons.user}
        type="text"
        name="name"
        value={name}
        onChange={onChange}
        placeholder="Enter your name"
        required
      />

      <TextField 
        label="Email"
        icon={FormIcons.email}
        type="email"
        name="email"
        value={email}
        onChange={onChange}
        placeholder="Enter your email"
        required
        error={emailError}
      />

      <div className="space-y-1">
        <PasswordField
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Enter your password"
          required
        />
        <PasswordStrengthMeter strength={passwordStrength} />
      </div>

      <TextField 
        label="Phone Number"
        icon={FormIcons.phone}
        type="tel"
        name="phonenumber"
        value={phonenumber}
        onChange={onChange}
        placeholder="Enter your phone number"
      />

      <SelectField
        label="Role"
        icon={FormIcons.user}
        name="role"
        value={role}
        onChange={onChange}
        required
      >
        <option value="Recruiter">Recruiter</option>
        <option value="Candidate">Candidate</option>
        <option value="Administrator">Administrator</option>
      </SelectField>

      {role === 'Recruiter' && (
        <TextField 
          label="Company"
          icon={FormIcons.company}
          type="text"
          name="company"
          value={company}
          onChange={onChange}
          placeholder="Enter your company name"
          required={role === 'Recruiter'}
          error={fieldErrors.company}
        />
      )}

      <FileField
        label="Profile Picture"
        name="profilepicture"
        onChange={onFileChange}
        fileName={selectedFileName}
      />
    </>
  );

  // Helper component to display role information
  const RoleInfo = ({ icon, title, description, iconBgClass }) => (
    <div className="flex items-start gap-4 mb-4">
      <div className={`h-10 w-10 rounded-full ${iconBgClass} flex items-center justify-center mt-1 flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="opacity-70 text-sm">{description}</p>
      </div>
    </div>
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
              Create Your <span className="text-primary">Account</span>
            </h2>
            <p className="text-lg opacity-80 mb-6">
              Join our platform and discover the perfect match for your career goals or find the ideal candidates for your team.
            </p>
            
            <div className="space-y-4 bg-base-200 p-6 rounded-xl">
              <h3 className="font-bold mb-2">Choose Your Role:</h3>
              <RoleInfo 
                icon={<FiUsers className="h-5 w-5 text-primary" />}
                iconBgClass="bg-primary/10"
                title="Candidate"
                description="Create a profile, upload your resume, and apply to jobs that match your skills and experience."
              />
              <RoleInfo 
                icon={<FiBriefcase className="h-5 w-5 text-secondary" />}
                iconBgClass="bg-secondary/10"
                title="Recruiter"
                description="Post job openings, review applications, and find the perfect candidates for your positions."
              />
              <RoleInfo 
                icon={<FiShield className="h-5 w-5 text-accent" />}
                iconBgClass="bg-accent/10"
                title="Administrator"
                description="Manage the platform, users, and settings with full administrative privileges."
              />
            </div>
          </motion.div>

          {/* Right Section - Signup Form */}
          <div className="md:w-1/2 max-w-md w-full py-8 -mt-[5px]">
            <AuthForm
              title="Sign Up"
              onSubmit={onSubmit}
              loading={loading}
              error={error}
              fields={fields}
            >
              <div className="text-sm text-base-content/70">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
              </div>
            </AuthForm>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;