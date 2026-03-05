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

export interface Review {
  id: string
  reviewId: string
  bookingId: string
  hotelId: string
  hotelName: string
  rating: number
  comment: string
  images?: string[]
  date: string
  user?: {
    name: string
  }
}

export interface CreateReviewData {
  bookingId: string
  hotelId: string
  rating: number
  comment: string
  images?: string[]
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

  // Owner booking management
  getOwnerBookings: async (status?: string) => {
    const params = status && status !== "all" ? { status } : {}
    const response = await api.get("/owner/bookings", { params })
    return response.data
  },

  getBookingStats: async () => {
    const response = await api.get("/owner/bookings/stats")
    return response.data
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    const response = await api.patch(`/owner/bookings/${bookingId}/status`, { status })
    return response.data
  },
}

export const reviewApi = {
  createReview: async (data: CreateReviewData) => {
    const response = await api.post("/reviews", data)
    return response.data
  },

  getUserReviews: async () => {
    const response = await api.get("/reviews/my-reviews")
    return response.data
  },

  getHotelReviews: async (hotelId: string, limit?: number, offset?: number) => {
    const params: Record<string, string> = {}
    if (limit) params.limit = limit.toString()
    if (offset) params.offset = offset.toString()
    const response = await api.get(`/reviews/hotel/${hotelId}`, { params })
    return response.data
  },

  getReviewStats: async (hotelId: string) => {
    const response = await api.get(`/reviews/hotel/${hotelId}/stats`)
    return response.data
  },

  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`)
    return response.data
  },

  getOwnerReviews: async () => {
    const response = await api.get("/owner/reviews")
    return response.data
  },
}

export const activityApi = {
  getActivities: async (limit?: number, offset?: number, action?: string, entityType?: string) => {
    const params: Record<string, string> = {}
    if (limit) params.limit = limit.toString()
    if (offset) params.offset = offset.toString()
    if (action) params.action = action
    if (entityType) params.entityType = entityType
    const response = await api.get("/owner/activities", { params })
    return response.data
  },

  getActivityStats: async (startDate?: string, endDate?: string) => {
    const params: Record<string, string> = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    const response = await api.get("/owner/activities/stats", { params })
    return response.data
  },
}

export const exportApi = {
  downloadBookingsCSV: (status?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    window.open(`${API_BASE_URL}${API_PREFIX}/owner/export/bookings/csv?${params.toString()}`, '_blank')
  },

  downloadReviewsCSV: () => {
    window.open(`${API_BASE_URL}${API_PREFIX}/owner/export/reviews/csv`, '_blank')
  },

  downloadActivitiesCSV: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    window.open(`${API_BASE_URL}${API_PREFIX}/owner/export/activities/csv?${params.toString()}`, '_blank')
  },

  downloadReportCSV: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    window.open(`${API_BASE_URL}${API_PREFIX}/owner/export/report/csv?${params.toString()}`, '_blank')
  },
}

export default api
