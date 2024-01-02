import React, { useState, useContext } from "react"
import api from "../APIs/apis"
import Cookies from "js-cookie" // Assuming you're using js-cookie
import DispatchContext from "../DispatchContext"
import { useParams } from "react-router-dom"

function CreatePlanCard({ onClose, plan }) {
  const appDispatch = useContext(DispatchContext)
  const { App_Acronym } = useParams()
  const [startDateInput, setStartDateInput] = useState("")
  const [endDateInput, setEndDateInput] = useState("")
  const [planMVPInput, setPlanMVPInput] = useState("")

  async function createPlan(e) {
    e.preventDefault() // Prevent default form submission behaviour
    let newPlan = {
      Plan_MVP_name: planMVPInput,
      Plan_startDate: startDateInput,
      Plan_endDate: endDateInput,
      App_Acronym: App_Acronym
    }
    try {
      const response = await api.post("/users/createPlan", newPlan, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      if (!response.data.error) {
        appDispatch({ type: "flashMessage", value: "Plan has been added!" })
        setEndDateInput("")
        setStartDateInput("")
        setPlanMVPInput("")
        plan(newPlan)
        window.location.reload()
      }
    } catch (error) {
      appDispatch({ type: "flashMessage", value: error.response.data.error })
      console.error("There was an error creating the plan:", error)
    }
  }

  return (
    <form className="popup" onSubmit={createPlan}>
      <div className="popup-content">
        <h2>Create New Plan</h2>
        <div className="form-group">
          <label className="plan-label">Plan MVP Name:</label>
          <input type="text" value={planMVPInput} onChange={e => setPlanMVPInput(e.target.value)} placeholder="Plan MVP Name" />
        </div>
        <div className="form-group">
          <label className="plan-label">Start Date:</label>
          <input type="date" value={startDateInput} onChange={e => setStartDateInput(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="plan-label">End Date:</label>
          <input type="date" value={endDateInput} onChange={e => setEndDateInput(e.target.value)} />
        </div>
        <div className="popup-actions">
          <button type="submit" className="create-button">
            Create
          </button>
          <button type="button" className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </form>
  )
}

export default CreatePlanCard
