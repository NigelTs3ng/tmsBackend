import axios from "axios"
import Cookies from "js-cookie"

const api = axios.create({
  baseURL: "http://localhost:8090/"
})

// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response && error.response.status && error.response.data.error === "User has been disabled!") {
//       Cookies.remove("tmsToken")
//       alert("Access Denied: You are not authorised to view this page!")
//       window.location.href = "/"
//     } else {
//       return Promise.reject(error)
//     }
//   }
// )

export default api
