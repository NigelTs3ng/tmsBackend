import React, { useState, useEffect } from "react"
import api from "../APIs/apis" // Assuming this is your API setup
import { Link, useNavigate, useParams } from "react-router-dom"
import Cookies from "js-cookie"
import CreateTaskCard from "./CreateTaskCard"
import TaskDetails from "./TaskCard"
// import "./Kanban.css" // You'll need to create this CSS file to style your Kanban board

const Kanban = () => {
  // State to hold tasks for each category
  const [viewCreateTask, setViewCreateTask] = useState(false)
  const { App_Acronym } = useParams()
  const [openTasks, setOpenTasks] = useState([])
  const [todoTasks, setTodoTasks] = useState([])
  const [doingTasks, setDoingTasks] = useState([])
  const [doneTasks, setDoneTasks] = useState([])
  const [closedTasks, setClosedTasks] = useState([])
  const [updateBoard, setUpdateBoard] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isPermitted, setIsPermitted] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (updateBoard) {
      console.log("refresh")
      viewAllTasks(App_Acronym)
      setUpdateBoard(false)
    }
  }, [updateBoard])

  useEffect(() => {
    checkPermitCreate()
  }, [])

  // Create task view handlers
  const handleViewCreateTask = () => {
    setViewCreateTask(true)
  }

  const handleViewCreateTaskClose = () => {
    setViewCreateTask(false)
    setUpdateBoard(true)
  }

  // View & Edit task view handlers
  const handleViewTask = task => {
    setSelectedTask(task)
    checkPermitCreate(task.Task_id)
  }

  const handleCloseTask = task => {
    setSelectedTask(null)
  }

  // View all task request
  async function viewAllTasks(App_Acronym) {
    try {
      const token = Cookies.get("tmsToken")
      const response = await api.post(
        "/users/viewTasks",
        { App_Acronym: App_Acronym },
        {
          headers: {
            Authorization: token
          }
        }
      )
      const tasks = response.data.data
      setOpenTasks(tasks.filter(task => task.Task_state === "open"))
      setTodoTasks(tasks.filter(task => task.Task_state === "todo"))
      setDoingTasks(tasks.filter(task => task.Task_state === "doing"))
      setDoneTasks(tasks.filter(task => task.Task_state === "done"))
      setClosedTasks(tasks.filter(task => task.Task_state === "closed"))
    } catch (error) {
      console.error("There was an error fetching the plans data:", error)
    }
  }

  // Check create permit
  async function checkPermitCreate() {
    try {
      const response = await api.post(
        "/users/checkCreatePermit",
        { App_Acronym: App_Acronym },
        {
          headers: {
            Authorization: Cookies.get("tmsToken")
          }
        }
      )
      setIsPermitted(response.data.data)
    } catch (error) {
      console.log("User does not have the rights to edit this!", error)
    }
  }

  const renderTaskCard = task => (
    <div key={task.Task_id} className="kanban-task-card" onClick={() => handleViewTask(task)}>
      <h4>{task.Task_name}</h4>
      <p>Task Owner: {task.Task_owner}</p>
      <p>Task Plan: {task.Task_plan}</p>
      <p>Task ID: {task.Task_id}</p>
    </div>
  )

  // Render a column for the Kanban board
  const renderColumn = (tasks, title) => (
    <div className="kanban-column">
      <h3>
        {title} | {tasks.length}
      </h3>
      {tasks.map(renderTaskCard)}
    </div>
  )

  return (
    <div className="kanban-container">
      <div className="kanban-buttons-container">
        <div className="kanban-header">
          <h1>{App_Acronym} Application</h1>
        </div>
        <div className="kanban-buttons">
          {isPermitted && (
            <button className="kanban-button create-task" onClick={handleViewCreateTask}>
              Create Task
            </button>
          )}

          <Link className="kanban-button create-plan" to={`/planManagement/${App_Acronym}`}>
            Plan Management Interface
          </Link>
        </div>
      </div>
      <div className="kanban-board">
        {renderColumn(openTasks, "Open")}
        {renderColumn(todoTasks, "To-do")}
        {renderColumn(doingTasks, "Doing")}
        {renderColumn(doneTasks, "Done")}
        {renderColumn(closedTasks, "Closed")}
        {/* You will also need to implement the logic to add new tasks and move them between columns */}
        {viewCreateTask && <CreateTaskCard onClose={handleViewCreateTaskClose} setUpdateBoard={setUpdateBoard} />}
        {selectedTask && <TaskDetails task={selectedTask} onClose={handleCloseTask} setUpdateBoard={setUpdateBoard} updateBoard={updateBoard} />}
      </div>
    </div>
  )
}

export default Kanban
