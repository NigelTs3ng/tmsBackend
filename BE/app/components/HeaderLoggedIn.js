import React, { useContext, useState, useEffect } from "react"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import api from "../APIs/apis"

function HeaderLoggedIn(props) {
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const navigate = useNavigate()
  const [userManagementButton, setuserManagementButton] = useState()

  // Call checkAdmin when the user logs in (inside the "login" action)
  useEffect(() => {
    if (appState.loggedIn || appState.checkAdmin) {
      checkAdmin()
    }
  }, [appState.loggedIn, appState.checkAdmin])

  // Check admin
  async function checkAdmin() {
    try {
      const token = Cookies.get("tmsToken")
      const response = await api.post("/users/checkGroup", { token, userGroup: "admin" })
      if (response.data.error) {
        setuserManagementButton(false)
        return false
      } else {
        setuserManagementButton(true)
        return true
      }
    } catch (err) {
      console.log("There was a problem.")
      console.log(err)
    }
  }

  function handleLogout() {
    appDispatch({ type: "logout" })
    appDispatch({ type: "flashMessage", value: "You have successfully logged out." })
    navigate("/")
  }

  const handleUserManagement = async () => {
    if (userManagementButton) {
      if (await checkAdmin()) {
        navigate("/userManagement")
      } else {
        navigate("*")
      }
    } else {
      navigate("*")
    }
  }

  const handleProfile = () => {
    navigate("/profilePage")
  }

  return (
    <div className="header-logged-out">
      {userManagementButton && (
        <button onClick={handleUserManagement} className="btn btn-user-management">
          User Management
        </button>
      )}
      <button onClick={handleProfile} className="btn btn-profile">
        Profile
      </button>
      <button onClick={handleLogout} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  )
}

export default HeaderLoggedIn
