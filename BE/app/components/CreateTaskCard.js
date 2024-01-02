import React, { useState, useContext, useEffect } from "react"
import api from "../APIs/apis"
import Cookies from "js-cookie" // Assuming you're using js-cookie
import DispatchContext from "../DispatchContext"
import { useParams } from "react-router-dom"

function CreateTaskCard({ e, onClose, setUpdateBoard }) {
  const appDispatch = useContext(DispatchContext)
  const [taskName, setTaskName] = useState(null)
  const [taskDescription, setTaskDescription] = useState(null)
  const { App_Acronym } = useParams()
  const [taskPlan, setTaskPlan] = useState([]) // State to hold the plans for the dropdown
  const [chosenPlan, setChosenPlan] = useState("") // State to hold the plans for the dropdown

  useEffect(() => {
    viewPlans()
  }, [])

  // useEffect(() => {
  //   if (taskPlan.length > 0) {
  //     setChosenPlan(taskPlan[0].Plan_MVP_name)
  //   }
  // }, [taskPlan])

  // View plans
  async function viewPlans() {
    try {
      const response = await api.post("/users/viewPlans", { App_Acronym: App_Acronym })
      setTaskPlan(response.data.data)
    } catch (error) {
      console.error("There was an error fetching the users data:", error)
    }
  }

  // Create Task
  async function createTask(e) {
    e.preventDefault() // Prevent default form submission behaviour
    let newTask = {
      Task_name: taskName,
      Task_description: taskDescription,
      Task_plan: chosenPlan,
      App_Acronym: App_Acronym
    }
    try {
      const response = await api.post("/users/createTask", newTask, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      if (!response.data.error) {
        setUpdateBoard(true)
        appDispatch({ type: "flashMessage", value: "Task has been added!" })
        setTaskDescription("")
        setTaskName("")
        setChosenPlan("")
      }
    } catch (error) {
      appDispatch({ type: "flashMessage", value: error.response.data.error.message })
      console.error("There was an error creating the application:", error)
    }
  }

  return (
    <form className="popup" onSubmit={createTask}>
      <div className="popup-content">
        <h2>Create New Task</h2>
        <div className="popup-columns">
          <div className="popup-column">
            <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Task Name" />
          </div>
          <div className="popup-column">
            <label for="plan" className="select-label">
              Plan:{"    "}
            </label>
            <select value={chosenPlan} onChange={e => setChosenPlan(e.target.value)} id="plan">
              <option value="">None</option>
              {taskPlan.map((plan, index) => (
                <option key={index} value={plan.Plan_MVP_name}>
                  {plan.Plan_MVP_name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <textarea className="task-description" value={taskDescription} onChange={e => setTaskDescription(e.target.value)} placeholder="Task Description"></textarea>
        <div className="popup-actionss right-align">
          <button type="submit" className="save-button">
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

export default CreateTaskCard
