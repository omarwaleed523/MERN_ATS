import React from 'react';
import './Jobpostcardforcandidate.css'; // Ensure you have the correct CSS file

const Jobpostcardforcandidate = ({ title, description, onApply }) => {
    return (
        <div className="card text-neutral-content transition-colors duration-300 flex flex-col justify-between">
            <div>
                <p className="card-title">{title}</p>
                <p className="small-desc">{description}</p>
            </div>
            <div className="button-container flex justify-end mt-auto">
                <button className="button-edit" onClick={onApply}>Apply</button>
            </div>
            <div className="go-corner">
                <div className="go-arrow">→</div>
            </div>
        </div>
    );
}

export default Jobpostcardforcandidate;