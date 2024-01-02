import React, { useContext, useState, useEffect } from "react"
import api from "../APIs/apis"
import Cookies from "js-cookie"
import DispatchContext from "../DispatchContext"

function EditAppCard({ project, onClose }) {
  if (!project) return null
  const appDispatch = useContext(DispatchContext)
  // const [viewPopup, setViewPopup] = useState(false)
  const [editDescription, setEditDescription] = useState(null)
  const [editStartDate, setEditStartDate] = useState(project.App_startDate)
  const [editEndDate, setEditEndDate] = useState(project.App_endDate)
  const [groupOptions, setGroupOptions] = useState([])
  const [permissions, setPermissions] = useState({
    open: project.App_permit_Open,
    todo: project.App_permit_toDoList,
    doing: project.App_permit_Doing,
    done: project.App_permit_Done,
    create: project.App_permit_Create
  })

  // Edit details call
  async function editDetails() {
    let updatedDetails = {
      App_Description: editDescription,
      App_startDate: editStartDate,
      App_endDate: editEndDate,
      App_permit_Open: permissions.open,
      App_permit_toDoList: permissions.todo,
      App_permit_Doing: permissions.doing,
      App_permit_Done: permissions.done,
      App_permit_Create: permissions.create,
      App_Acronym: project.App_Acronym
    }
    console.log("data sent from FE: ", updatedDetails)
    try {
      const response = await api.post("/users/editApp", updatedDetails, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      appDispatch({ type: "flashMessage", value: "Application details updated!" })
    } catch (error) {
      appDispatch({ type: "flashMessage", value: "Application details cannot be updated!" })
      // setViewPopup(false)
      console.log("Error in editing details: ", error)
    }
  }

  // View groups call
  async function selectGroup() {
    try {
      const response = await api.get("/users/viewGroups", {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      setGroupOptions(response.data.response)
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

  const handleSubmit = () => {
    editDetails()
  }

  useEffect(() => {
    selectGroup() // Fetch group options when component mounts
  }, []) // Empty dependency array means this runs once on mount

  // useEffect(() => {
  //   // Update permissions state when project prop changes
  //   if (project) {
  //     setPermissions({
  //       open: project.App_permit_Open,
  //       todo: project.App_permit_toDoList,
  //       doing: project.App_permit_Doing,
  //       done: project.App_permit_Done,
  //       create: project.App_permit_Create
  //     });
  //   }
  // }, [project]);

  return (
    <div className="popup">
      <div className="popup-content">
        <h2>Edit {project.App_Acronym} Details</h2>

        <div className="popup-columns">
          <div className="popup-column">
            <p>
              <strong>Acronym:</strong> {project.App_Acronym}
            </p>
            <p>
              <strong>App R Number:</strong> {project.App_Rnumber}
            </p>
            <p>
              <strong>Description:</strong>
              <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder={project.App_Description} />
            </p>
            <p>
              <strong>Start Date:</strong>
              <input type="date" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} placeholder={project.App_startDate} />
            </p>
            <p>
              <strong>End Date:</strong>
              <input type="date" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} placeholder={project.App_endDate} />
            </p>
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

        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

export default EditAppCard
