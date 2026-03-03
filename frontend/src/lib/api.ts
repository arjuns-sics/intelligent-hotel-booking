import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
const API_PREFIX = import.meta.env.VITE_API_PREFIX || "/api"

export const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hotelOwnerToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hotelOwnerToken")
      localStorage.removeItem("hotelOwner")
    }
    return Promise.reject(error)
  }
)

export const ownerApi = {
  register: async (data: {
    name: string
    email: string
    phone?: string
    password: string
  }) => {
    const response = await api.post("/owner/register", data)
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/owner/login", data)
    return response.data
  },

  getProfile: async () => {
    const response = await api.get("/owner/profile")
    return response.data
  },
}

export default api
