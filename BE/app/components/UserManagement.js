import React, { useState, useEffect, useContext } from "react"
import Page from "./Page"
import api from "../APIs/apis"
import CreatableSelect from "react-select/creatable"
import DispatchContext from "../DispatchContext"
import Cookies from "js-cookie"

function UserManagement() {
  const appDispatch = useContext(DispatchContext)
  const [users, setUsers] = useState([])
  const [userInput, setUserInput] = useState("")
  const [passwordInput, setPasswordInput] = useState("")
  const [emailInput, setEmailInput] = useState(null)
  const [activeInput, setActiveInput] = useState(1)
  const [activeUpdate, setActiveUpdate] = useState(1)
  const [editingUsername, setEditingUsername] = useState("")
  const [updateEmail, setUpdateEmail] = useState(null)
  const [updatePassword, setUpdatePassword] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [groupOptions, setGroupOptions] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])
  const [newUser, setNewUser] = useState()
  const [usernameRequired, setUsernameRequired] = useState(false) // Track if username is required
  const [usernameError, setUsernameError] = useState("") // Store the error message
  const [duplicateUserMessage, setDuplicateUserMessage] = useState("") // Track duplicate user message

  const handleCreateGroup = newValue => {
    addGroup(newValue)
    console.log("new group value: ", newValue)
  }

  // const appState = useContext(StateContext)

  useEffect(() => {
    fetchUsers()
    fetchGroupOptions()
  }, [Cookies.get("tmsToken")])

  // View users
  async function fetchUsers() {
    try {
      const response = await api.post(
        "/users/viewUsers",
        {},
        {
          headers: {
            Authorization: Cookies.get("tmsToken") // Assuming it's a JWT token
          }
        }
      )
      setUsers(response.data.response)
      console.log("response data bro ", response.data)
    } catch (error) {
      console.error("There was an error fetching the users data:", error)
    }
  }

  // View groups
  async function fetchGroupOptions() {
    try {
      const response = await api.get("/users/viewGroups", {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      console.log("Cookies data here: ", Cookies.get("tmsToken"))
      setGroupOptions(response.data.response)
      // console.log("Group data: ", response.data.response)
    } catch (error) {
      console.error("Error fetching group options:", error)
    }
  }

  const transformedGroupOptions = groupOptions?.map(option => ({
    value: option.userGroup, // Use the property that represents the value
    label: option.userGroup // Use the property that represents the label
  }))

  // Create user function
  async function createUser() {
    if (!userInput) {
      setUsernameRequired(true)
      setUsernameError("Username is required")
      return
    }
    // Check for duplicate users
    const isDuplicateUser = users.some(user => user.username === userInput)

    if (isDuplicateUser) {
      setDuplicateUserMessage("Duplicate user found.")
      return // Exit the function
    }
    const userGroupString = selectedGroups?.map(option => option.value).join(", ")
    let newUser = {
      username: userInput,
      email: emailInput,
      password: passwordInput,
      userGroup: userGroupString.toString(),
      isActive: activeUpdate
    }
    try {
      const response = await api.post("/users/register", newUser, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      if (!response.data.error) {
        setNewUser(response.data)
        console.log("res msg: ", response.data)
        appDispatch({ type: "flashMessage", value: "User has been added!" })
        setUsernameRequired(false)
        setUsernameError("")
        setDuplicateUserMessage("")
        setIsUpdating(false)
        setUserInput("")
        setEmailInput("")
        setPasswordInput("")
        setSelectedGroups([])
        fetchUsers()
      } else {
        appDispatch({ type: "flashMessage", value: "Password is invalid (Must be 8-10 characters with alphabets, numbers and a special character)" })
      }
    } catch (error) {
      console.error("Error creating user: ", error)
      appDispatch({ type: "flashMessage", value: error.response.data.error })
      appDispatch({ type: "checkAdminFalse" })
    }
  }

  // Edit user function
  async function editUser() {
    const newUserGroupString = selectedGroups?.map(option => option.value).join(", ")
    console.log("active input", activeInput)
    const updatedUser = {
      username: editingUsername,
      newPassword: updatePassword,
      newEmail: updateEmail,
      newUsergroup: newUserGroupString.toString(),
      isActive: activeUpdate
    }
    try {
      const response = await api.post("/users/editDetails", updatedUser, {
        headers: {
          Authorization: Cookies.get("tmsToken")
        }
      })
      if (!response.data.error) {
        // Successful edit
        appDispatch({ type: "flashMessage", value: "User details updated!" })
        fetchUsers()
        setEditingUsername(null)
      } else {
        // Display an error message if needed
        if (response.data.error === "Email and/or password is invalid") {
          appDispatch({ type: "flashMessage", value: "Password does not meet the criteria." })
        } else {
          appDispatch({ type: "flashMessage", value: "Error editing user." })
        }
      }
    } catch (error) {
      console.error("Error editing user due to invalidity of admin rights: ", error)
      // Display an error message if there's an error
      appDispatch({ type: "flashMessage", value: error.response.data.error })
      appDispatch({ type: "checkAdminFalse" })
    }
  }

  // Add group function
  async function addGroup(userGroup) {
    try {
      const token = Cookies.get("tmsToken")
      const groupData = { userGroup, token }
      const response = await api.post("/users/createGroup", { ...groupData })
      // console.log("response data: " + response.data)
      if (response.data.error) {
        console.log("Error adding group: ", response.data.error)
        appDispatch({ type: "flashMessage", value: "Error adding group!" })
      } else {
        appDispatch({ type: "flashMessage", value: "Group added!" })
        fetchGroupOptions()
      }
    } catch (err) {
      console.log("There was a problem.")
      console.log(err)
    }
  }

  const handleGroupSelect = selectedOptions => {
    setSelectedGroups(selectedOptions)
  }

  const handleEditClick = user => {
    setEditingUsername(user.username)
    setActiveUpdate(user.isActive)
  }

  // const handleSaveClick = async user => {
  //   // TODO: Send the updated user data to the backend using Axios
  //   // If the save is successful, revert back to the original view
  //   setEditingUsername(null)
  //   setIsUpdating(false)
  // }

  const handleSubmitClick = () => {
    editUser()
  }

  const handleCancelClick = () => {
    setEditingUsername(null)
  }

  const handleCreateUser = () => {
    createUser()
  }

  return (
    <Page className="container mt-5" wide={true}>
      <h2 className="mb-4">User Management</h2>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Password</th>
              <th>Email</th>
              <th>Group Name</th>
              <th>Is Active</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input
                  type="text"
                  className={`form-control ${usernameRequired || duplicateUserMessage ? "is-invalid" : ""}`}
                  placeholder="Enter User ID"
                  value={userInput}
                  onChange={e => {
                    setUserInput(e.target.value)
                    setUsernameRequired(false)
                    setUsernameError("")
                    setDuplicateUserMessage("") // Clear duplicate user message
                  }}
                />
                {usernameRequired && <div className="invalid-feedback">{usernameError}</div>}
                {duplicateUserMessage && <div className="invalid-feedback">{duplicateUserMessage}</div>}
              </td>
              <td>
                <input
                  type="password"
                  className="form-control "
                  placeholder="Enter Password"
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value)
                  }}
                />{" "}
              </td>
              <td>
                <input
                  type="text"
                  className="form-control "
                  placeholder="Enter Email"
                  value={emailInput}
                  onChange={e => {
                    setEmailInput(e.target.value)
                  }}
                />{" "}
              </td>
              <td>
                <CreatableSelect isMulti onCreateOption={handleCreateGroup} options={transformedGroupOptions} value={selectedGroups} onChange={handleGroupSelect} />
              </td>
              <td>
                <select
                  className="form-control"
                  value={activeInput}
                  onChange={e => {
                    setActiveInput(e.target.value)
                  }}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </td>
              <td>
                <button className="btn btn-success" disabled={isUpdating} onClick={handleCreateUser}>
                  Create User
                </button>
              </td>
            </tr>
            {Array.isArray(users) && users.length > 0 ? (
              users.map(user => (
                <tr key={user.username}>
                  <td>{user.username}</td>
                  <td>{editingUsername === user.username ? <input type="password" className="form-control" onChange={e => setUpdatePassword(e.target.value)} /> : "******"}</td>
                  <td>{editingUsername === user.username ? <input type="email" className="form-control" defaultValue={user.email} onChange={e => setUpdateEmail(e.target.value)} /> : user.email}</td>
                  <td>
                    {editingUsername === user.username ? (
                      <CreatableSelect
                        isMulti
                        options={transformedGroupOptions}
                        // value={selectedGroups}
                        defaultValue={user.userGroup ? user.userGroup.split(",").map(item => ({ label: item, value: item })) : []}
                        onCreateOption={handleCreateGroup}
                        onChange={handleGroupSelect}
                      />
                    ) : (
                      user.userGroup
                    )}
                  </td>
                  <td>
                    {editingUsername === user.username ? (
                      <select className="form-control" value={activeUpdate} onChange={e => setActiveUpdate(e.target.value)}>
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    ) : user.isActive === 1 ? (
                      "Active"
                    ) : (
                      "Inactive"
                    )}
                  </td>

                  <td>
                    {editingUsername === user.username ? (
                      <>
                        <div className="mb-2">
                          {" "}
                          <button className="btn btn-sm btn-success" onClick={() => handleSubmitClick(user)}>
                            Submit
                          </button>
                        </div>
                        <div>
                          <button className="btn btn-sm btn-danger" onClick={handleCancelClick}>
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <button className="btn btn-info" onClick={() => handleEditClick(user)}>
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No users to display.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Page>
  )
}

export default UserManagement
