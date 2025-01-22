const ResumeCard = ({ title, description, onEdit, onDelete }) => {
    return (
        <div className="card text-neutral-content transition-colors duration-300">
            <p className="card-title">{title}</p>
            <p className="small-desc">{description}</p>
            <div className="button-container">
                <button className="button-delete" onClick={onDelete}>Delete</button>
                <button className="button-edit" onClick={onEdit}>Edit</button>
            </div>
            <div className="go-corner">
                <div className="go-arrow">→</div>
            </div>
        </div>
    )
}

export default ResumeCard