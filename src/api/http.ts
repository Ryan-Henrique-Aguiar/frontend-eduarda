import axios from 'axios'
import { tokenStorage } from '../utils/storage'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3333',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true'
  },
})

http.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      if (!window.location.pathname.includes('/login')) window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)
