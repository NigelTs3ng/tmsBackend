import React, { useEffect, useState, useContext } from "react"
import DispatchContext from "../DispatchContext"
import api from "../APIs/apis"

function HeaderLoggedOut(props) {
  const appDispatch = useContext(DispatchContext)
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [error, setError] = useState()

  const handleUserManagement = () => {
    // Add the logic to handle user management
  }

  const handleProfile = () => {
    // Add the logic to handle the profile
  }

  const handleHome = () => {
    // Add the logic to handle the home
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await api.post("/users/login", { username, password })
      // console.log("response data: " + response.data)
      if (response.data) {
        appDispatch({ type: "login", data: response.data })
        appDispatch({ type: "flashMessage", value: "You have successfully logged in." })
      } else {
        console.log("Incorrect username / password.")
        appDispatch({ type: "flashMessage", value: "Invalid username / password." })
      }
    } catch (err) {
      console.log("There was a problem.")
      console.log(err)
    }
  }

  return <div className="header-logged-out"></div>
}

export default HeaderLoggedOut
