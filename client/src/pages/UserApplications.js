import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserApplications = () => {
    const { userId } = useParams();
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/applications?userId=${userId}`);
                setApplications(response.data);
            } catch (error) {
                console.error('Error fetching applications:', error);
            }
        };
        fetchApplications();
    }, [userId]);

    const handleDelete = async (applicationId) => {
        try {
            await axios.delete(`http://localhost:5000/api/applications/${applicationId}`);
            setApplications(applications.filter(app => app._id !== applicationId));
        } catch (error) {
            console.error('Error deleting application:', error);
        }
    };

    return (
        <div>
            <h2>Your Applications</h2>
            <ul>
                {applications.map(app => (
                    <li key={app._id}>
                        <p>Job Post: {app.jobPostId.title}</p>
                        <button onClick={() => handleDelete(app._id)}>Unapply</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserApplications;