import React, { useState, useContext, useEffect } from "react"
import api from "../APIs/apis"
import Cookies from "js-cookie"
import DispatchContext from "../DispatchContext"
import { useParams } from "react-router-dom"

function TaskDetails({ task, onClose, setUpdateBoard, updateBoard }) {
  if (!task) return null
  const appDispatch = useContext(DispatchContext)
  const [taskDescription, setTaskDescription] = useState(task.Task_description)
  const [taskNotes, setTaskNotes] = useState(task.Task_notes)
  const [taskState, setTaskState] = useState(task)
  const [addNotesInput, setAddNotesInput] = useState("")
  const [chosenPlan, setChosenPlan] = useState("")
  const [canEdit, setCanEdit] = useState(false)
  const [updatePlan, setUpdatePlan] = useState(task.Task_plan)
  const [initialPlan, setInitialPlan] = useState(task.Task_plan)
  const { App_Acronym } = useParams()

  useEffect(() => {
    viewPlans()
    checkPermitEdit()
  }, [])

  useEffect(() => {
    setInitialPlan(task.Task_plan)
  }, [task.Task_plan])

  // View task request =============================================
  async function fetchTaskDetails() {
    try {
      const notesResponse = await api.post("/users/viewTasks", { App_Acronym: task.Task_app_Acronym })
      const notes = notesResponse.data.data.find(taskData => taskData.Task_id === task.Task_id)?.Task_notes
      if (notes) {
        setTaskState(prevState => ({
          ...prevState,
          Task_notes: notes
        }))
      }
    } catch (error) {
      console.error("There was an error fetching the task details:", error)
    }
  }

  useEffect(() => {
    if (updateBoard) {
      fetchTaskDetails()
    }
  }, [updateBoard, task.Task_app_Acronym, task.Task_id])

  // Edit task request =============================================
  async function editTask() {
    let updatedDetails = {
      Task_id: task.Task_id,
      Task_plan: updatePlan,
      Task_add_notes: addNotesInput
    }
    // if (updatePlan !== initialPlan && task.Task_state === "done") {
    //   TaskPromotion(false)
    // }
    try {
      console.log("here here here", updatedDetails)
      const response = await api.post("/users/editTask", updatedDetails, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      appDispatch({ type: "flashMessage", value: "Details have been updated!" })
      const notesResponse = await api.post("/users/viewTasks", { App_Acronym: task.Task_app_Acronym })
      const notes = notesResponse.data.data.filter(taskData => taskData.Task_id === task.Task_id)[0].Task_notes
      setTaskState({
        ...task,
        Task_notes: notes
      })
      setUpdateBoard(prevState => !prevState)
    } catch (error) {
      console.log("Details are unable to be edited!")
    }
  }

  // Check edit permit =============================================
  async function checkPermitEdit() {
    try {
      const body = { Task_id: task.Task_id }
      const response = await api.post("/users/checkTaskPermit", body, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      setCanEdit(response.data.data)
    } catch (error) {
      console.log("User does not have the rights to edit this!", error)
    }
  }

  // Promote task request =============================================
  async function TaskPromotion(isPromote) {
    let updatedDetails = {
      Task_id: task.Task_id,
      Task_plan: updatePlan,
      Task_add_notes: addNotesInput
    }
    // if (updatePlan !== initialPlan && task.Task_state === "done") {
    //   TaskPromotion(false)
    // }
    try {
      console.log("here here here", updatedDetails)
      const response = await api.post("/users/editTask", updatedDetails, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      appDispatch({ type: "flashMessage", value: "Details have been updated!" })
      const notesResponse = await api.post("/users/viewTasks", { App_Acronym: task.Task_app_Acronym })
      const notes = notesResponse.data.data.filter(taskData => taskData.Task_id === task.Task_id)[0].Task_notes
      setTaskState({
        ...task,
        Task_notes: notes
      })
      setUpdateBoard(prevState => !prevState)
    } catch (error) {
      console.log("Details are unable to be edited!")
    }
    let promoteDetails = {
      Task_id: task.Task_id,
      PromoteTask: isPromote
    }
    try {
      const response = await api.post("/users/promoteTask", promoteDetails, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      if (response.data.success) {
        appDispatch({ type: "flashMessage", value: "Task state has been updated!" })
        setUpdateBoard(prevState => !prevState)
      } else {
        appDispatch({ type: "flashMessage", value: "Task state cannot be updated!" })
      }
    } catch (error) {
      console.log("Task state unable to be changed!", error)
    }
  }

  // View all plans request =============================================
  async function viewPlans() {
    try {
      const response = await api.post("/users/viewPlans", { App_Acronym: App_Acronym })
      setChosenPlan(response.data.data)
    } catch (error) {
      console.error("There was an error fetching the users data:", error)
    }
  }

  // Handlers to set promote or demote
  const handlePromote = () => {
    TaskPromotion(true)
    onClose()
  }

  const handleDemote = () => {
    TaskPromotion(false)
    onClose()
  }

  const handleSubmitEdit = async () => {
    editTask()
    fetchTaskDetails()
    onClose()
  }

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>{task.Task_name}</h2>
        <div className="task-details-grid">
          <div>
            <strong>Task ID:</strong> {task.Task_id}
          </div>
          <div>
            <strong>Task App Acronym:</strong> {task.Task_app_Acronym}
          </div>
          <div>
            <strong>Task Creator:</strong> {task.Task_creator}
          </div>
          <div>
            <strong>Task Owner:</strong> {task.Task_owner}
          </div>
          {Array.isArray(chosenPlan) && task.Task_state !== "todo" && task.Task_state !== "doing" ? (
            <div>
              <strong>Task Plan: </strong>
              <select value={updatePlan} onChange={e => setUpdatePlan(e.target.value)} id="plan">
                <option value="">None</option>
                {chosenPlan.map((plan, index) => (
                  <option key={index} value={plan.Plan_MVP_name}>
                    {plan.Plan_MVP_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <strong>Task Plan: </strong>
              {task.Task_plan}
            </div>
          )}
        </div>
        <div className="task-details-description">
          <strong>Task Description:</strong>
          <div className="task-description-box">{taskDescription}</div>
        </div>
        <div className="task-details-description">
          <strong>Task Notes:</strong>
          <textarea className="task-notes-box">{taskNotes}</textarea>
        </div>
        <div className="task-details-description">
          <text>Edit notes here:</text>
          <textarea onChange={e => setAddNotesInput(e.target.value)} value={addNotesInput} />
        </div>
        <div className="popup-actionss">
          <div className="right-side-buttons">
            {updatePlan !== initialPlan && task.Task_state === "done" ? (
              <button className="save-button" onClick={handleDemote}>
                Save Changes & Demote Task
              </button>
            ) : (
              <>
                {" "}
                {canEdit && (
                  <button className="save-button" onClick={handleSubmitEdit}>
                    Save Changes
                  </button>
                )}
              </>
            )}
            {canEdit && (
              <button className="promote-button" onClick={handlePromote} disabled={updatePlan !== initialPlan && task.Task_state === "done"}>
                Promote
              </button>
            )}
            {canEdit && !(task.Task_state === "open" || task.Task_state === "todo") && (
              <button className="demote-button" onClick={handleDemote} disabled={updatePlan !== initialPlan && task.Task_state === "done"}>
                Demote
              </button>
            )}
          </div>
          <button className="close-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskDetails
