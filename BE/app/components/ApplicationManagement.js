import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import AppDetails from "./ApplicationCard"
import CreateAppCard from "./CreateAppCard"
import api from "../APIs/apis"
import EditAppCard from "./EditAppCard"
import Cookies from "js-cookie"

// Implement app_acronym in URL to render data from

function ApplicationManagement() {
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([]) // Update this line
  const [viewDetailsProject, setViewDetailsProject] = useState(null)
  const [viewCreateApp, setViewCreateApp] = useState(false)
  const [viewEditApp, setViewEditApp] = useState(false)
  const [editButton, setEditButton] = useState(false)
  const [isPL, setIsPL] = useState(false)

  // View all apps call
  async function viewAllApps() {
    try {
      const response = await api.post("/users/viewAllApps")
      setProjects(response.data.data)
    } catch (error) {
      console.error("There was an error fetching the users data:", error)
    }
  }

  // Check if user is PL
  async function checkPL() {
    try {
      const token = Cookies.get("tmsToken")
      const response = await api.post("/users/checkGroup", { token, userGroup: "PL" })
      if (!response.data.error) {
        setEditButton(true) 
        setIsPL(true)
      } else {
        setEditButton(false)
        setIsPL(false)
      }
    } catch (error) {
      console.error("User is not a PL! :", error)
    }
  }

  useEffect(() => {
    viewAllApps()
    checkPL()
  }, [])

  // View handler
  const handleViewDetails = project => {
    setViewDetailsProject(project)
  }

  const closeDetails = () => {
    setViewDetailsProject(null)
  }

  // Create handlers
  const handleOpenCreateApp = () => {
    setViewCreateApp(true)
  }

  const handleCloseCreateApp = () => {
    setViewCreateApp(false)
  }

  // Edit handlers
  const handleOpenEditApp = project => {
    setSelectedProject(project)
    setViewEditApp(true)
  }

  const handleCloseEditApp = () => {
    setViewEditApp(false)
  }

  return (
    <div className="task-management">
      <h1>Task Management System</h1>
      <div className="applications">
        <h2>Applications</h2>
        {isPL && (
          <button className="create-button" onClick={handleOpenCreateApp}>
            Create application
          </button>
        )}
        <ul className="application-list">
          {projects.map(project => (
            <li key={project.id} className={`application-item ${selectedProject?.id === project.id ? "selected" : ""}`}>
              <div className="project-info">
                <span className="project-name">{project.App_Acronym}</span>
              </div>
              <div className="project-actions">
                {editButton && (
                  <button className="edit-button" onClick={() => handleOpenEditApp(project)}>
                    Edit
                  </button>
                )}
                <button className="view-details-button" onClick={() => handleViewDetails(project)}>
                  View Details
                </button>
                <Link className="view-details-link" to={`/kanban/${project.App_Acronym}`}>
                  Go to Kanban
                </Link>
              </div>
            </li>
          ))}
        </ul>
        {viewDetailsProject && <AppDetails project={viewDetailsProject} onClose={closeDetails} />}
        {viewCreateApp && <CreateAppCard project={viewDetailsProject} onClose={handleCloseCreateApp} />}
        {viewEditApp && <EditAppCard project={selectedProject} onClose={handleCloseEditApp} />}
      </div>
    </div>
  )
}

export default ApplicationManagement
