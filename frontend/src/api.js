import axios from 'axios'
import { config } from './config'

const api = axios.create({
  baseURL: config.urls.externalBackend,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.assign('/login')
    }
    return Promise.reject(err)
  },
)

export default api