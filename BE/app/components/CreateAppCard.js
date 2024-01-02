import React, { useState, useContext, useEffect } from "react"
import api from "../APIs/apis"
import Cookies from "js-cookie" // Assuming you're using js-cookie
import DispatchContext from "../DispatchContext"

function CreateAppCard({ onClose }) {
  // State for form inputs
  const appDispatch = useContext(DispatchContext)
  const [acronymInput, setAcronymInput] = useState(null)
  const [appDescInput, setAppDescInput] = useState("")
  const [appRnumberInput, setAppRnumberInput] = useState("")
  const [startDateInput, setStartDateInput] = useState("")
  const [endDateInput, setEndDateInput] = useState(null)
  // const [appPermitInput, setAppPermitInput] = useState(null)
  const [permissions, setPermissions] = useState({ open: null, todo: null, doing: null, done: null, create: null })
  const [groupOptions, setGroupOptions] = useState([])

  useEffect(() => {
    selectGroup()
  }, [])

  // Create application
  async function createApplication(e) {
    e.preventDefault() // Prevent default form submission behaviour
    let newApplication = {
      App_Acronym: acronymInput,
      App_Description: appDescInput,
      App_Rnumber: appRnumberInput,
      App_startDate: startDateInput,
      App_endDate: endDateInput,
      App_permit_Open: permissions.open,
      App_permit_toDoList: permissions.todo,
      App_permit_Doing: permissions.doing,
      App_permit_Done: permissions.done,
      App_permit_Create: permissions.create
    }
    try {
      const response = await api.post("/users/createApp", newApplication, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      if (!response.data.error) {
        appDispatch({ type: "flashMessage", value: "Application has been added!" })
        setAcronymInput("")
        setAppDescInput("")
        setEndDateInput("")
        setStartDateInput("")
        setAppRnumberInput("")
        setPermissions({ open: "", todo: "", doing: "", done: "", create: "" })
        window.location.reload()
      }
    } catch (error) {
      appDispatch({ type: "flashMessage", value: error.response.data.error })
      console.error("There was an error creating the application:", error)
    }
  }

  // Select Group
  async function selectGroup() {
    try {
      const response = await api.get("/users/viewGroups", {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      setGroupOptions(response.data.response)
      console.log("Response data here le bro: ", response.data)
    } catch (error) {
      console.error("Error getting groups!: ", error)
    }
  }

  const handlePermissionChange = (permissionName, value) => {
    setPermissions(prevPermissions => ({
      ...prevPermissions,
      [permissionName]: value
    }))
  }

  return (
    <form className="popup" onSubmit={createApplication}>
      <div className="popup-content">
        <h2>Create New Application</h2>
        <div className="popup-columns">
          <div className="popup-column">
            <input type="text" value={acronymInput} onChange={e => setAcronymInput(e.target.value)} placeholder="Acronym" />
            <textarea value={appDescInput} onChange={e => setAppDescInput(e.target.value)} placeholder="Description"></textarea>
            <input type="number" min="0" value={appRnumberInput} onChange={e => setAppRnumberInput(e.target.value)} placeholder="App R Number" />
            <input type="date" value={startDateInput} onChange={e => setStartDateInput(e.target.value)} placeholder="Start Date" />
            <input type="date" value={endDateInput} onChange={e => setEndDateInput(e.target.value)} placeholder="End Date" />
          </div>
          <div className="popup-column">
            <label>Permissions:</label>
            <div className="form-group">
              <label className="form-label">Open: </label>
              <select name="open" value={permissions.open} onChange={e => handlePermissionChange("open", e.target.value)}>
                <option value="">Select Group</option>
                {groupOptions.map((group, index) => (
                  <option key={index} value={group.userGroup}>
                    {group.userGroup}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">To Do: </label>
              <select name="todo" value={permissions.todo} onChange={e => handlePermissionChange("todo", e.target.value)}>
                <option value="">Select Group</option>
                {groupOptions.map((group, index) => (
                  <option key={index} value={group.userGroup}>
                    {group.userGroup}
                  </option>
                ))}
              </select>
            </div>{" "}
            <div className="form-group">
              <label className="form-label">Doing: </label>
              <select name="doing" value={permissions.doing} onChange={e => handlePermissionChange("doing", e.target.value)}>
                <option value="">Select Group</option>
                {groupOptions.map((group, index) => (
                  <option key={index} value={group.userGroup}>
                    {group.userGroup}
                  </option>
                ))}
              </select>
            </div>{" "}
            <div className="form-group">
              <label className="form-label">Done: </label>
              <select name="done" value={permissions.done} onChange={e => handlePermissionChange("done", e.target.value)}>
                <option value="">Select Group</option>
                {groupOptions.map((group, index) => (
                  <option key={index} value={group.userGroup}>
                    {group.userGroup}
                  </option>
                ))}
              </select>
            </div>{" "}
            <div className="form-group">
              <label className="form-label">Create: </label>
              <select name="create" value={permissions.create} onChange={e => handlePermissionChange("create", e.target.value)}>
                <option value="">Select Group</option>
                {groupOptions.map((group, index) => (
                  <option key={index} value={group.userGroup}>
                    {group.userGroup}
                  </option>
                ))}
              </select>
            </div>{" "}
          </div>
        </div>
        <div className="popup-actions">
          <button type="submit">Create</button>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </form>
  )
}

export default CreateAppCard
