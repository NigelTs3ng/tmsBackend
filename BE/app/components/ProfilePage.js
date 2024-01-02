import React, { useState, useEffect, useContext } from "react"
import api from "../APIs/apis"
import Cookies from "js-cookie"
import Page from "./Page"
import DispatchContext from "../DispatchContext"
import { useNavigate } from "react-router-dom"
// import "./Profile.css" // Import your CSS styles for Profile page

function Profile() {
  const appDispatch = useContext(DispatchContext)
  // const navigate = useNavigate
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: ""
  })
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [Cookies.get("tmsToken")])

  const fetchUserProfile = async () => {
    try {
      const response = await api.post(
        "/users/viewProfile",
        {},
        {
          headers: {
            Authorization: Cookies.get("tmsToken") // Assuming it's a JWT token
          }
        }
      )
      if (!response.data.error) {
        setUser(response.data.response)
        setNewEmail(response.data.response.email)
      } else {
        console.error("Error fetching user profile:", response.data.error)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const editUserProfile = async () => {
    try {
      const response = await api.post(
        "/users/editProfile",
        { newEmail, newPassword },
        {
          headers: {
            Authorization: Cookies.get("tmsToken")
          }
        }
      )
      if (!response.data.error) {
        setNewEmail(newEmail)
        setIsEditingEmail(false)
        setIsEditingPassword(false)
        appDispatch({ type: "flashMessage", value: "Details Updated!" })
      } else {
        console.error("Error fetching user profile:", response.data.error)
        appDispatch({ type: "flashMessage", value: "Password is invalid (Must be 8-10 characters with alphabets, numbers and a special character)" })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      appDispatch({ type: "flashMessage", value: "User is inactive!" })
      appDispatch({ type: "logout" })
    }
  }

  const handleEditEmail = () => {
    setIsEditingEmail(true)
  }

  const handleCancelEditEmail = () => {
    setIsEditingEmail(false)
    setNewEmail(user.email)
  }

  const handleEditPassword = () => {
    setIsEditingPassword(true)
  }

  const handleCancelEditPassword = () => {
    setIsEditingPassword(false)
    setNewPassword("")
  }

  const handleSaveEmail = e => {
    e.preventDefault()
    if (newEmail !== user.email) {
      editUserProfile(newEmail, user.password)
      window.location.reload()
      appDispatch({ type: "flashMessage", value: "Details Updated!" })
    } else {
      setIsEditingEmail(false)
    }
  }

  const handleSavePassword = () => {
    if (newPassword !== user.password) {
      editUserProfile(user.email, newPassword)
      appDispatch({ type: "flashMessage", value: "Password Updated!" })
    } else {
      setIsEditingPassword(false)
    }
  }

  return (
    <Page title="Profile">
      <div className="container mt-5 profile-container">
        <h2>User Profile</h2>
        <div className="profile-info">
          <div className="profile-info-item">
            <label style={{ paddingRight: "5px" }}>Username:</label> <span>{user.username}</span>
          </div>
          <div className="profile-info-item">
            <label>Email:</label>
            {isEditingEmail ? (
              <div>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <button onClick={e => handleSaveEmail(e)}>Save</button>
                <button onClick={handleCancelEditEmail}>Cancel</button>
              </div>
            ) : (
              <div>
                <span>{user.email}</span>
                <button onClick={handleEditEmail} style={{ marginLeft: "10px" }}>
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="profile-info-item">
            <label>Password:</label>
            {isEditingPassword ? (
              <div>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <button onClick={handleSavePassword}>Save</button>
                <button onClick={handleCancelEditPassword}>Cancel</button>
              </div>
            ) : (
              <div>
                <span>******</span>
                <button onClick={handleEditPassword} style={{ marginLeft: "10px" }}>
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  )
}

export default Profile
