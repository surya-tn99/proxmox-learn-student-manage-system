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
    return Promise.reject(err)
  },
)

export default api