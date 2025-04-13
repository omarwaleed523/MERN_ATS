import React from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaUser, FaBuilding, FaPhone, FaImage } from 'react-icons/fa';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: 'beforeChildren',
      staggerChildren: 0.1,
      duration: 0.3,
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const AuthForm = ({ 
  title, 
  children, 
  onSubmit, 
  loading, 
  error, 
  fields 
}) => {
  return (
    <div className="relative z-10 w-full max-w-md mx-auto">
``      {error && (
        <motion.div 
          className="alert alert-error mb-4 z-20"
          variants={itemVariants}
          animate={{ x: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
        >
          <span>{error}</span>
        </motion.div>
      )}
      
      <motion.div 
        className="card bg-base-100 shadow-xl backdrop-blur-lg border border-base-300"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="card-body">
          <motion.div
            className="text-center mb-6"
            variants={itemVariants}
          >
            <h1 className="text-3xl font-bold text-base-content">{title}</h1>
            <div className="w-16 h-1 bg-primary mx-auto mt-3 rounded-full"></div>
          </motion.div>

          <motion.form 
            onSubmit={onSubmit}
            className="space-y-4"
          >
            {fields}
            
            <motion.button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              variants={itemVariants}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  Processing...
                </span>
              ) : title}
            </motion.button>

            {children && (
              <motion.div variants={itemVariants} className="text-center mt-4">
                {children}
              </motion.div>
            )}
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
};

// Form field components
export const TextField = ({ label, icon, error, ...props }) => {
  return (
    <motion.div variants={itemVariants} className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/60">
          {icon}
        </div>
        <input
          className="input input-bordered w-full pl-10 focus:input-primary"
          {...props}
        />
      </div>
      {error && <span className="text-error text-sm mt-1">{error}</span>}
    </motion.div>
  );
};

export const PasswordField = ({ showPassword, toggleShowPassword, ...props }) => {
  return (
    <motion.div variants={itemVariants} className="form-control">
      <label className="label">
        <span className="label-text">Password</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/60">
          <FaLock />
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          className="input input-bordered w-full pl-10 pr-10 focus:input-primary"
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-base-content/60 hover:text-base-content"
          onClick={toggleShowPassword}
        >
          {showPassword ? (
            <FaEyeSlash />
          ) : (
            <FaEye />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export const SelectField = ({ label, icon, ...props }) => {
  return (
    <motion.div variants={itemVariants} className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/60">
          {icon}
        </div>
        <select
          className="select select-bordered w-full pl-10 focus:select-primary"
          {...props}
        >
          {props.children}
        </select>
      </div>
    </motion.div>
  );
};

export const FileField = ({ label, ...props }) => {
  return (
    <motion.div variants={itemVariants} className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative">
        <label className="flex items-center justify-center w-full h-12 px-4 border-2 border-dashed border-base-content/20 rounded-lg cursor-pointer hover:border-primary transition-all duration-200">
          <FaImage className="mr-2 text-base-content/60" />
          <span className="text-base-content/70">
            {props.fileName || "Choose a file..."}
          </span>
          <input
            type="file"
            className="hidden"
            {...props}
          />
        </label>
      </div>
    </motion.div>
  );
};

export const PasswordStrengthMeter = ({ strength, maxStrength = 5 }) => {
  const getStrengthText = () => {
    if (strength === 0) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Good';
    if (strength === 5) return 'Strong';
    return 'Very Weak';
  };

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-base-300';
    if (strength <= 2) return 'bg-error';
    if (strength === 3) return 'bg-warning';
    if (strength === 4) return 'bg-info';
    if (strength === 5) return 'bg-success';
    return 'bg-base-300';
  };

  return (
    <motion.div variants={itemVariants} className="mt-2 space-y-1">
      <div className="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(strength / maxStrength) * 100}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full ${getStrengthColor()}`}
        />
      </div>
      <p className="text-xs text-base-content/70 text-right">
        {getStrengthText()}
      </p>
    </motion.div>
  );
};

export const FormIcons = {
  email: <FaEnvelope />,
  user: <FaUser />,
  phone: <FaPhone />,
  company: <FaBuilding />,
  password: <FaLock />
};

export default AuthForm;