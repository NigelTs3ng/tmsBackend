import React, { useState, useEffect, useContext } from "react"
import Page from "./Page"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import DispatchContext from "../DispatchContext"
import api from "../APIs/apis"

function HomeGuest() {
  const appDispatch = useContext(DispatchContext)
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    }
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameAfterDelay":
        if (draft.username.value.length < 8) {
          draft.username.hasErrors = true
          draft.username.message = "Username must be at least 8 characters."
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        return
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = "That username is already taken."
        } else {
          draft.username.isUnique = true
        }
        return
      case "passwordAfterDelay":
        if (draft.password.value.length < 8) {
          draft.password.hasErrors = true
          draft.password.message = "Password must be at least 8 characters."
        }
        return
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.password.hasErrors) {
          draft.submitCount++
        }
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 300)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 300)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await api.post("/users/login", { username, password })
      if (response.data.error) {
        console.log("Incorrect username / password.")
        appDispatch({ type: "flashMessage", value: response.data.error })
      } else {
        appDispatch({ type: "login", data: response.data })
        appDispatch({ type: "flashMessage", value: "You have successfully logged in." })
      }
    } catch (err) {
      console.log("There was a problem.")
      console.log(err)
    }
  }

  return (
    <Page title="Welcome!" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-5 mx-auto pl-lg-5 pb-3 py-lg-5">
          <h1 className="display-4">Welcome to the Task Management Application!</h1>
          <p className="lead">Your one-stop solution for efficient task management.</p>
        </div>
        <div className="col-lg-5 mx-auto pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={e => setUsername(e.target.value)} id="username-register" name="username" className="form-control" type="text" placeholder="Username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => setPassword(e.target.value)} id="password-register" name="password" className="form-control" type="password" placeholder="Password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Login to TMS
            </button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default HomeGuest
