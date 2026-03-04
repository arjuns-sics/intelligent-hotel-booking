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
    // Try hotel owner token first, then user token
    const token = localStorage.getItem("hotelOwnerToken") || localStorage.getItem("token")
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

export interface Room {
  id: string
  name: string
  description?: string
  price: number
  maxGuests: number
  beds: string
  size: string
  amenities: string[]
  status: "available" | "occupied" | "maintenance"
  roomNumber?: string
  floor?: string
}

export interface CreateRoomData {
  name: string
  description?: string
  price: number
  maxGuests: number
  beds: string
  size: string
  amenities?: string[]
  status?: "available" | "occupied" | "maintenance"
  roomNumber?: string
  floor?: string
}

export interface UpdateRoomData extends CreateRoomData {
  id: string
}

export interface OwnerProfile {
  id: string
  name: string
  email: string
  phone?: string
  hotelName?: string
  hotelDescription?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  website?: string
  amenities: string[]
  rooms: Room[]
  onboardingComplete: boolean
}

export interface Booking {
  id: string
  bookingId: string
  hotelName: string
  hotelImage: string
  location: string
  roomType: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  numberOfNights: number
  pricePerNight: number
  totalAmount: number
  status: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"
  bookingDate: string
  hotelId: string
}

export interface CreateBookingData {
  hotelId: string
  roomId: string
  roomType: string
  roomDetails?: {
    price: number
    maxGuests: number
    beds: string
    size: string
    amenities: string[]
  }
  checkIn: string
  checkOut: string
  guests: number
  pricePerNight: number
  specialRequests?: string
}

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

  getRooms: async () => {
    const response = await api.get("/owner/rooms")
    return response.data
  },

  getRoom: async (roomId: string) => {
    const response = await api.get(`/owner/rooms/${roomId}`)
    return response.data
  },

  createRoom: async (data: CreateRoomData) => {
    const response = await api.post("/owner/rooms", data)
    return response.data
  },

  updateRoom: async (roomId: string, data: UpdateRoomData) => {
    const response = await api.put(`/owner/rooms/${roomId}`, data)
    return response.data
  },

  deleteRoom: async (roomId: string) => {
    const response = await api.delete(`/owner/rooms/${roomId}`)
    return response.data
  },
}

export const bookingApi = {
  createBooking: async (data: CreateBookingData) => {
    const response = await api.post("/bookings", data)
    return response.data
  },

  getUserBookings: async (status?: string) => {
    const params = status && status !== "all" ? { status } : {}
    const response = await api.get("/bookings", { params })
    return response.data
  },

  getBookingById: async (bookingId: string) => {
    const response = await api.get(`/bookings/${bookingId}`)
    return response.data
  },

  cancelBooking: async (bookingId: string) => {
    const response = await api.delete(`/bookings/${bookingId}`)
    return response.data
  },
}

export default api
