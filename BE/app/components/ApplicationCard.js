import React from "react"
import api from "../APIs/apis"

function AppDetails({ project, onClose }) {
  if (!project) return null

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>{project.App_Acronym} Details</h2>
        <p>
          <strong>Acronym:</strong> {project.App_Acronym}
        </p>
        <p>
          <strong>Description:</strong> {project.App_Description}
        </p>
        <p>
          <strong>App R Number:</strong> {project.App_Rnumber}
        </p>
        <p>
          <strong>Start Date:</strong> {project.App_startDate}
        </p>
        <p>
          <strong>End Date:</strong> {project.App_endDate}
        </p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default AppDetails
