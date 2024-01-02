import React, { useContext, useEffect, useState } from "react"
import api from "../APIs/apis"
import Cookies from "js-cookie"
import DispatchContext from "../DispatchContext"

function PlanDetails({ plan, onClose }) {
  if (!plan) return null

  useEffect(() => {
    if (plan) {
      setEndDateInput(plan.Plan_endDate)
      setStartDateInput(plan.Plan_startDate)
      setAppAcronym(plan.Plan_app_Acronym)
    }
    console.log("here is stuff", plan)
  }, [plan])

  useEffect(() => {
    checkPM()
    setAppAcronym(plan.Plan_app_Acronym)
  }, [])

  const appDispatch = useContext(DispatchContext)
  const [startDateInput, setStartDateInput] = useState("")
  const [endDateInput, setEndDateInput] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [appAcronym, setAppAcronym] = useState("")
  const [isPM, setIsPM] = useState(false)

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

  async function editPlan() {
    let editDetails = {
      Plan_startDate: startDateInput,
      Plan_endDate: endDateInput,
      Plan_app_Acronym: appAcronym
    }
    console.log("here are the editDetails sent from frontend", editDetails)
    try {
      const response = await api.post("/users/editPlan", editDetails, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      appDispatch({ type: "flashMessage", value: "Plan details updated!" })
      // const updatedPlan = {
      //   ...plan,
      //   Plan_startDate: startDateInput,
      //   Plan_endDate: endDateInput
      // }
      // onPlanUpdate(updatedPlan)
      // window.location.reload()
      onClose()
    } catch (error) {
      console.log("Error: ", error)
    }
  }

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>{plan.Plan_app_Acronym} Details</h2>
        {editMode ? (
          <>
            <label>Start Date:</label>
            <input type="date" value={startDateInput} onChange={e => setStartDateInput(e.target.value)} />
            <label>End Date:</label>
            <input type="date" value={endDateInput} onChange={e => setEndDateInput(e.target.value)} />
            <button className="edit-button" onClick={editPlan}>
              Save Changes
            </button>
          </>
        ) : (
          <>
            <p>
              <strong>Start Date:</strong> {startDateInput}
            </p>
            <p>
              <strong>End Date:</strong> {endDateInput}
            </p>
            {isPM && (
              <button className="edit-button" onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}
          </>
        )}
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default PlanDetails
