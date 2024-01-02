import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../APIs/apis"
import Cookies from "js-cookie"
import CreatePlanCard from "./CreatePlanCard"
import PlanDetails from "./EditPlanCard"

function PlanManagement() {
  const navigate = useNavigate()
  const { App_Acronym } = useParams()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [plans, setPlans] = useState([]) // This now holds plans
  const [viewDetailsProject, setViewDetailsProject] = useState(null)
  const [viewCreateApp, setViewCreateApp] = useState(false)
  const [viewEditApp, setViewEditApp] = useState(false)
  const [isPM, setIsPM] = useState(false)

  // Callback to update plans list
  const addNewPlan = newPlan => {
    setPlans(prevPlans => [...prevPlans, newPlan])
  }

  const handlePlanUpdate = updatedPlan => {
    setPlans(prevPlans => prevPlans.map(plan => (plan.Plan_MVP_name === updatedPlan.Plan_MVP_name ? updatedPlan : plan)))
  }

  useEffect(() => {
    checkPM()
  }, [])

  // View all apps call
  async function viewAllPlans() {
    try {
      const token = Cookies.get("tmsToken")
      const response = await api.post(
        "/users/viewPlanDetails",
        { App_Acronym: App_Acronym },
        {
          headers: {
            Authorization: token
          }
        }
      )
      const plansData = response.data.data
      setPlans(plansData)
      console.log("response data bro ", response)
    } catch (error) {
      console.error("There was an error fetching the plans data:", error)
    }
  }

  // Check PM
  async function checkPM() {
    try {
      const token = Cookies.get("tmsToken")
      const response = await api.post("/users/checkGroup", { token: token, userGroup: "PM" })
      if (!response.data.error) {
        setIsPM(true)
      }
    } catch (error) {
      console.log("User cannot be verified!")
    }
  }

  useEffect(() => {
    viewAllPlans()
  }, [])

  // View handler
  const handleViewDetails = plan => {
    setViewDetailsProject(plan)
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
  const handleOpenEditApp = plan => {
    setSelectedPlan(plan)
    setViewEditApp(true)
  }

  const handleCloseEditApp = () => {
    setViewEditApp(false)
  }

  const handleViewKanban = () => {
    navigate(-1)
  }

  return (
    <div className="task-management">
      <h1>Plan Management System</h1>
      <div className="applications">
        <h2>Plans</h2>
        {isPM && (
          <button className="create-button" onClick={handleOpenCreateApp}>
            Create Plan
          </button>
        )}
        <button className="back-button" onClick={handleViewKanban}>
          Back to kanban board
        </button>
        <ul className="application-list">
          {plans.map((plan, index) => (
            <li key={index} className={`application-item ${selectedPlan?.Plan_MVP_name === plan.Plan_MVP_name ? "selected" : ""}`}>
              <div className="project-info">
                <span className="project-name">{plan.Plan_MVP_name}</span>
                {/* Render other plan details as needed */}
              </div>
              <div className="project-actions">
                <button className="view-details-button" onClick={() => handleViewDetails(plan)}>
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>

        {viewDetailsProject && <PlanDetails plan={viewDetailsProject} onClose={closeDetails} />}
        {viewCreateApp && <CreatePlanCard plan={addNewPlan} onClose={handleCloseCreateApp} />}
      </div>
    </div>
  )
}

export default PlanManagement
