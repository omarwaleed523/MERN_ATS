import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phonenumber: '',
    role: 'Candidate',
    profilepicture: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const { name, email, password, phonenumber, role } = formData;

  // Handle input changes
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear field errors when the user types
    setFieldErrors({ ...fieldErrors, [name]: '' });

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
    setFormData({ ...formData, profilepicture: e.target.files[0] });
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

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'gray';
    if (passwordStrength <= 2) return 'red';
    if (passwordStrength === 3) return 'orange';
    if (passwordStrength === 4) return 'yellow';
    if (passwordStrength === 5) return 'green';
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
    if (formData.profilepicture) {
      data.append('profilepicture', formData.profilepicture);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.data.msg); // Show success message
      navigate('/login'); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="bg-primary p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your name"
              className={`mt-1 block w-full px-4 py-2 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            />
            {fieldErrors.name && <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className={`mt-1 block w-full px-4 py-2 border ${emailError || fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                className={`mt-1 block w-full px-4 py-2 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: getPasswordStrengthColor(),
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Password Strength: {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength] || 'very strong'}
              </p>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="number"
              name="phonenumber"
              value={phonenumber}
              onChange={onChange}
              placeholder="Enter your phone number"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className={`mt-1 block w-full px-4 py-2 border ${fieldErrors.role ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            >
              <option value="Recruiter">Recruiter</option>
              <option value="Candidate">Candidate</option>
            </select>
            {fieldErrors.role && <p className="text-red-500 text-sm mt-1">{fieldErrors.role}</p>}
          </div>

          {/* Profile Picture Field */}
          <div>
            <label htmlFor="profilepicture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              name="profilepicture"
              onChange={onFileChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;