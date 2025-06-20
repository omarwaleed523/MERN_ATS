import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

const AdminDatabaseSchemas = () => {
  const { user } = useContext(UserContext);
  const [schemas, setSchemas] = useState({});
  const [selectedSchema, setSelectedSchema] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (user.role !== 'Administrator') {
      setError('Access denied. Admin privileges required.');
      return;
    }

    fetchSchemas();
  }, [user]);

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/admin/schemas`, {
        headers: { 'x-auth-token': user.token }
      });
      setSchemas(response.data);
      
      // Set the first schema as selected by default
      if (response.data && Object.keys(response.data).length > 0) {
        setSelectedSchema(Object.keys(response.data)[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching schemas:', err);
      setError('Failed to load database schemas. Please try again.');
      setLoading(false);
    }
  };

  const renderSchemaField = (field) => {
    return (
      <tr key={field.path}>
        <td className="font-medium">{field.path}</td>
        <td>{field.instance}</td>
        <td>
          {field.required && <span className="badge badge-warning">Required</span>}
          {field.unique && <span className="badge badge-info ml-2">Unique</span>}
          {field.enum && <span className="badge badge-success ml-2">Enum</span>}
        </td>
        <td className="text-sm opacity-75">{renderFieldOptions(field)}</td>
      </tr>
    );
  };

  const renderFieldOptions = (field) => {
    const options = [];
    
    if (field.enum) {
      options.push(`Values: [${field.enum.join(', ')}]`);
    }
    
    if (field.ref) {
      options.push(`References: ${field.ref}`);
    }
    
    if (field.default !== undefined) {
      options.push(`Default: ${field.default}`);
    }
    
    if (field.min !== undefined) {
      options.push(`Min: ${field.min}`);
    }
    
    if (field.max !== undefined) {
      options.push(`Max: ${field.max}`);
    }
    
    return options.join(', ');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 p-6">
        <div className="text-center text-error p-6 bg-base-200 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">{error}</h2>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Database Schemas</h1>
        <Link to="/admin/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="bg-base-200 rounded-lg shadow p-6">
          {/* Schema Selection */}
          <div className="mb-8">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text font-semibold">Select Schema</span>
              </div>
              <select 
                className="select select-bordered"
                value={selectedSchema}
                onChange={(e) => setSelectedSchema(e.target.value)}
              >
                {Object.keys(schemas).map((schemaName) => (
                  <option key={schemaName} value={schemaName}>
                    {schemaName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Schema Description */}
          {selectedSchema && (
            <div className="mb-8">
              <div className="bg-base-100 p-6 rounded-lg shadow mb-4">
                <h2 className="text-2xl font-semibold mb-2">{selectedSchema} Schema</h2>
                <p className="text-sm opacity-75">
                  The {selectedSchema} model represents {getSchemaDescription(selectedSchema)} in the system.
                </p>
              </div>
            </div>
          )}

          {/* Schema Fields */}
          {selectedSchema && schemas[selectedSchema] && (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Type</th>
                    <th>Attributes</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {schemas[selectedSchema].map((field) => renderSchemaField(field))}
                </tbody>
              </table>
            </div>
          )}

          {/* Schema Relationships */}
          {selectedSchema && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Relationships</h3>
              <ul className="list-disc list-inside">
                {getSchemaRelationships(selectedSchema).map((rel, index) => (
                  <li key={index} className="mb-2">
                    {rel}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to provide schema descriptions
const getSchemaDescription = (schemaName) => {
  const descriptions = {
    'User': 'users and their authentication details',
    'Jobpost': 'job opportunities posted by recruiters',
    'Resume': 'candidate resumes and parsed information',
    'Application': 'job applications submitted by candidates'
  };
  
  return descriptions[schemaName] || 'data';
};

// Helper function to provide schema relationships
const getSchemaRelationships = (schemaName) => {
  const relationships = {
    'User': [
      'A User with role "Recruiter" can create multiple Jobposts',
      'A User with role "Candidate" can submit multiple Applications',
      'A User with role "Candidate" can upload a Resume'
    ],
    'Jobpost': [
      'A Jobpost belongs to a User (Recruiter)',
      'A Jobpost can have multiple Applications'
    ],
    'Resume': [
      'A Resume belongs to a User (Candidate)',
      'A Resume can be referenced in multiple Applications'
    ],
    'Application': [
      'An Application links a Jobpost with a User (Candidate)',
      'An Application may reference a Resume'
    ]
  };
  
  return relationships[schemaName] || ['No relationships defined'];
};

export default AdminDatabaseSchemas;