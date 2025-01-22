import React from 'react';
import './JobpostCards.css';
import axios from 'axios';

const JobpostCard = ({ title, description, onEdit, jobPostId, onDelete }) => {
    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/jobposts/${jobPostId}`);
            onDelete(jobPostId); // Call the onDelete function passed as a prop
        } catch (error) {
            console.error('Error deleting job post:', error);
        }
    };

    return (
        <div className="card text-neutral-content transition-colors duration-300">
            <p className="card-title">{title}</p>
            <p className="small-desc">{description}</p>
            <div className="button-container">
                <button className="button-delete" onClick={handleDelete}>Delete</button>
                <button className="button-edit" onClick={onEdit}>Edit</button>
            </div>
            <div className="go-corner">
                <div className="go-arrow">→</div>
            </div>
        </div>
    );
}

export default JobpostCard;