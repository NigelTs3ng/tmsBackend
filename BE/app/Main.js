import React, { useState, useReducer, useEffect, Suspense, useContext } from "react"
import ReactDOM from "react-dom/client"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
import Cookies from "js-cookie"
Axios.defaults.baseURL = process.env.BACKENDURL || "your heroku dot com goes here"
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

// My Components
import LoadingDotsIcon from "./components/LoadingDotsIcon"
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Footer from "./components/Footer"
import FlashMessages from "./components/FlashMessages"
import NotFound from "./components/NotFound"
import UserManagement from "./components/UserManagement"
import ProfilePage from "./components/ProfilePage"
import api from "./APIs/apis"
import ApplicationManagement from "./components/ApplicationManagement"
import Kanban from "./components/Kanban"
import PlanManagement from "./components/PlanManagement"
// import CreateAppCard from "./components/CreateAppCard"

function Main() {
  const token = Cookies.get("tmsToken")

  const initialState = {
    loggedIn: Boolean(token),
    flashMessages: [],
    user: {
      token: token || ""
      // username: username || "",
      // user: user || ""
    },
    isAdmin: false
  }

  // Check admin
  async function checkAdmin(token) {
    try {
      // const token = Cookies.get("tmsToken")
      const response = await api.post("/users/checkGroup", { token, userGroup: "admin" })
      if (response.data.error) {
      } else {
        dispatch({ type: "checkAdmin" }) // Set admin to true
      }
    } catch (err) {
      console.log("There was a problem log in restore.")
      console.log(err)
    }
  }

  // async function restoreSession(token) {
  //   await Cookies.set("tmsToken")
  //   await checkAdmin()
  // }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        Cookies.set("tmsToken", action.data.token, { expires: 7 })
        return
      case "logout":
        draft.loggedIn = false
        Cookies.remove("tmsToken")
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        return
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
        return
      case "checkAdmin":
        draft.isAdmin = true
        return
      case "checkAdminFalse":
        draft.isAdmin = false
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      checkAdmin(state.user.token)
    } else {
      Cookies.remove("tmsToken")
      console.log("Token removed!")
    }
  }, [state.loggedIn])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path="/kanban/:App_Acronym" element={<Kanban />} />
              <Route path="/planManagement/:App_Acronym" element={<PlanManagement />} />
              <Route path="/userManagement" element={state.isAdmin ? <UserManagement /> : <NotFound />} />
              <Route path="/profilePage" element={state.loggedIn ? <ProfilePage /> : <NotFound />} />
              <Route path="/" element={state.loggedIn ? <ApplicationManagement /> : <HomeGuest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback=""></Suspense>
            </div>
          </CSSTransition>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
