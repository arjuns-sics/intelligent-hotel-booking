## User Model

```javascript
const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("User", userSchema)
```

## Hotel Owner Model

```javascript
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const hotelOwnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    hotelName: {
      type: String,
      trim: true,
    },
    hotelDescription: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    rooms: {
      type: [{
        name: String,
        description: String,
        price: Number,
        maxGuests: Number,
        beds: String,
        size: String,
        amenities: [String],
        status: {
          type: String,
          enum: ["available", "occupied", "maintenance"],
          default: "available",
        },
        roomNumber: String,
        floor: String,
      }],
      default: [],
    },
    checkInTime: {
      type: String,
      default: "14:00",
    },
    checkOutTime: {
      type: String,
      default: "11:00",
    },
    cancellationPolicy: {
      type: String,
      default: "flexible",
      enum: ["flexible", "moderate", "strict", "non-refundable"],
    },
    petPolicy: {
      type: String,
      default: "not-allowed",
      enum: ["allowed", "not-allowed", "on-request"],
    },
    hotelImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    },
  },
  {
    timestamps: true,
  }
)

hotelOwnerSchema.pre("save", async function () {
  if (!this.isModified("password")) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

hotelOwnerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

const HotelOwner = mongoose.model("HotelOwner", hotelOwnerSchema)

module.exports = HotelOwner
```

## Booking Model

```javascript
const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HotelOwner",
      required: true,
    },
    hotelName: {
      type: String,
      required: true,
    },
    hotelImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    },
    location: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      required: true,
    },
    roomDetails: {
      price: Number,
      maxGuests: Number,
      beds: String,
      size: String,
      amenities: [String],
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    numberOfNights: {
      type: Number,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "checked-in", "checked-out", "cancelled"],
      default: "confirmed",
    },
    cancellationPolicy: {
      type: String,
      default: "flexible",
    },
    specialRequests: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ hotel: 1, status: 1 })
bookingSchema.index({ checkIn: 1, checkOut: 1 })

bookingSchema.virtual("bookingId").get(function () {
  return `BK${this._id.toString().slice(-6).toUpperCase()}`
})

bookingSchema.set("toJSON", { virtuals: true })
bookingSchema.set("toObject", { virtuals: true })

module.exports = mongoose.model("Booking", bookingSchema)
```

## Hotel Controller - Get All Hotels

```javascript
const HotelOwner = require("../models/HotelOwner")
const Review = require("../models/Review")

const getAllHotels = async (req, res) => {
  try {
    const {
      location,
      checkIn,
      checkOut,
      guests,
      minPrice,
      maxPrice,
      rating,
      amenities,
      sortBy = 'rating',
      sortOrder = 'desc',
    } = req.query

    const owners = await HotelOwner.find({
      onboardingComplete: true,
      hotelName: { $exists: true, $ne: "" },
    }).select('name hotelName hotelDescription hotelImage address city state pincode amenities rooms rating')

    const hotelsWithStats = await Promise.all(owners.map(async (owner) => {
      const minPrice = owner.rooms && owner.rooms.length > 0
        ? Math.min(...owner.rooms.map(r => r.price || 0))
        : 0

      const availableRooms = owner.rooms?.filter(room => room.status === 'available').length || 0

      const locationParts = []
      if (owner.city) locationParts.push(owner.city)
      if (owner.state) locationParts.push(owner.state)
      const locationString = locationParts.join(', ') || owner.address || 'India'

      const reviewStats = await Review.aggregate([
        { $match: { hotel: owner._id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
      ])

      const avgRating = reviewStats.length > 0 ? reviewStats[0].avgRating : 0
      const totalReviews = reviewStats.length > 0 ? reviewStats[0].totalReviews : 0

      const featureMap = {
        'wifi': 'wifi',
        'WiFi': 'wifi',
        'Free WiFi': 'wifi',
        'restaurant': 'restaurant',
        'Restaurant': 'restaurant',
        'parking': 'parking',
        'Parking': 'parking',
        'Valet Parking': 'parking',
        'spa': 'spa',
        'Spa': 'spa',
        'Spa & Wellness': 'spa',
        'pool': 'pool',
        'Pool': 'pool',
      }

      const features = (owner.amenities || []).map(a => featureMap[a] || a.toLowerCase()).filter(Boolean)

      const maxGuests = owner.rooms && owner.rooms.length > 0
        ? Math.max(...owner.rooms.map(r => r.maxGuests || 2))
        : 2

      return {
        id: owner._id.toString(),
        name: owner.hotelName || 'Hotel',
        location: locationString,
        price: minPrice,
        rating: avgRating.toFixed(1),
        reviews: totalReviews,
        image: owner.hotelImage || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`,
        features: features.length > 0 ? features : ['wifi', 'restaurant'],
        availableRooms,
        guests: maxGuests,
        description: owner.hotelDescription || '',
        rooms: (owner.rooms || []).map((room, index) => ({
          id: room._id?.toString() || `room-${index}`,
          name: room.name,
          description: room.description || '',
          price: room.price,
          maxGuests: room.maxGuests || 2,
          beds: room.beds || '1 King Bed',
          size: room.size || '30 sqm',
          amenities: room.amenities || [],
          status: room.status || 'available',
          roomNumber: room.roomNumber || '',
          floor: room.floor || '',
        })),
      }
    }))

    let hotels = hotelsWithStats

    if (location) {
      const searchLower = location.toLowerCase()
      hotels = hotels.filter(hotel =>
        hotel.location.toLowerCase().includes(searchLower) ||
        hotel.name.toLowerCase().includes(searchLower)
      )
    }

    if (minPrice) {
      hotels = hotels.filter(hotel => hotel.price >= parseInt(minPrice))
    }

    if (maxPrice) {
      hotels = hotels.filter(hotel => hotel.price <= parseInt(maxPrice))
    }

    if (rating) {
      hotels = hotels.filter(hotel => hotel.rating >= parseFloat(rating))
    }

    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : amenities.split(',')
      hotels = hotels.filter(hotel =>
        amenityList.every(amenity => hotel.features.includes(amenity))
      )
    }

    if (guests) {
      hotels = hotels.filter(hotel => hotel.guests >= parseInt(guests))
    }

    hotels = [...hotels].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'price') {
        comparison = a.price - b.price
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    res.status(200).json({
      success: true,
      message: "Hotels retrieved successfully",
      data: {
        hotels,
        count: hotels.length,
      },
    })
  } catch (error) {
    console.error("Get all hotels error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hotels",
      error: error.message,
    })
  }
}

module.exports = {
  getAllHotels,
  getHotelById,
}
```

## Booking Controller - Create Booking

```javascript
const Booking = require("../models/Booking")
const HotelOwner = require("../models/HotelOwner")
const { logActivity } = require("../middleware/activityLogger")

const createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      roomType,
      roomDetails,
      checkIn,
      checkOut,
      guests,
      pricePerNight,
      specialRequests,
    } = req.body

    if (!hotelId || !roomId || !roomType || !checkIn || !checkOut || !guests || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details",
      })
    }

    const hotel = await HotelOwner.findById(hotelId)
    if (!hotel || !hotel.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      })
    }

    const room = hotel.rooms.id(roomId)
    if (!room || room.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Selected room is not available",
      })
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))

    if (numberOfNights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      })
    }

    const totalAmount = pricePerNight * numberOfNights

    const locationParts = []
    if (hotel.city) locationParts.push(hotel.city)
    if (hotel.state) locationParts.push(hotel.state)
    const location = locationParts.join(", ") || hotel.address || "India"

    const booking = await Booking.create({
      user: req.userId,
      hotel: hotelId,
      hotelName: hotel.hotelName,
      hotelImage: hotel.hotelImage || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`,
      location,
      roomId,
      roomType,
      roomDetails: roomDetails || {
        price: room.price,
        maxGuests: room.maxGuests,
        beds: room.beds,
        size: room.size,
        amenities: room.amenities,
      },
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      numberOfNights,
      pricePerNight,
      totalAmount,
      status: "confirmed",
      cancellationPolicy: hotel.cancellationPolicy || "flexible",
      specialRequests: specialRequests || "",
    })

    const populatedBooking = await Booking.findById(booking._id).populate("user", "name email")

    await logActivity({
      action: 'booking_created',
      description: `New booking created for ${hotel.hotelName} by ${req.user?.name || 'Guest'}`,
      entityType: 'booking',
      entityId: booking._id,
      metadata: {
        bookingId: booking.bookingId,
        hotelName: hotel.hotelName,
        checkIn,
        checkOut,
        totalAmount,
      },
      user: req.user,
      owner: { _id: hotel._id },
    })

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: populatedBooking._id,
        bookingId: populatedBooking.bookingId,
        hotelName: populatedBooking.hotelName,
        hotelImage: populatedBooking.hotelImage,
        location: populatedBooking.location,
        roomType: populatedBooking.roomType,
        checkIn: populatedBooking.checkIn,
        checkOut: populatedBooking.checkOut,
        guests: populatedBooking.guests,
        numberOfNights: populatedBooking.numberOfNights,
        pricePerNight: populatedBooking.pricePerNight,
        totalAmount: populatedBooking.totalAmount,
        status: populatedBooking.status,
        bookingDate: populatedBooking.createdAt,
      },
    })
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: error.message,
    })
  }
}

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getHotelBookings,
  updateBookingStatus,
  getBookingStats,
}
```

## Room Controller - CRUD Operations

```javascript
const HotelOwner = require("../models/HotelOwner")

const getOwnerRooms = async (req, res) => {
  try {
    const owner = await HotelOwner.findById(req.ownerId).select("rooms hotelName")

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    const rooms = owner.rooms.map((room, index) => ({
      id: room._id?.toString() || `room-${index}`,
      name: room.name,
      description: room.description || "",
      price: room.price,
      maxGuests: room.maxGuests || 2,
      beds: room.beds || "1 King Bed",
      size: room.size || "30 sqm",
      amenities: room.amenities || [],
      status: room.status || "available",
      roomNumber: room.roomNumber || "",
      floor: room.floor || "",
    }))

    res.status(200).json({
      success: true,
      message: "Rooms retrieved successfully",
      data: {
        hotelName: owner.hotelName,
        rooms,
      },
    })
  } catch (error) {
    console.error("Get rooms error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve rooms",
      error: error.message,
    })
  }
}

const createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      maxGuests,
      beds,
      size,
      amenities,
      status,
      roomNumber,
      floor,
    } = req.body

    if (!name || !price || !maxGuests || !beds || !size) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      })
    }

    const owner = await HotelOwner.findById(req.ownerId)

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    const newRoom = {
      name,
      description: description || "",
      price,
      maxGuests,
      beds,
      size,
      amenities: amenities || [],
      status: status || "available",
      roomNumber: roomNumber || "",
      floor: floor || "",
    }

    owner.rooms.push(newRoom)
    await owner.save()

    const createdRoom = owner.rooms[owner.rooms.length - 1]

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: {
        id: createdRoom._id.toString(),
        name: createdRoom.name,
        description: createdRoom.description || "",
        price: createdRoom.price,
        maxGuests: createdRoom.maxGuests || 2,
        beds: createdRoom.beds || "1 King Bed",
        size: createdRoom.size || "30 sqm",
        amenities: createdRoom.amenities || [],
        status: createdRoom.status || "available",
        roomNumber: createdRoom.roomNumber || "",
        floor: createdRoom.floor || "",
      },
    })
  } catch (error) {
    console.error("Create room error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message,
    })
  }
}

module.exports = {
  getOwnerRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
}
```

## Owner Authentication Controller

```javascript
const jwt = require("jsonwebtoken")
const HotelOwner = require("../models/HotelOwner")

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })
}

const registerOwner = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      })
    }

    const existingOwner = await HotelOwner.findOne({ email })
    if (existingOwner) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      })
    }

    const owner = await HotelOwner.create({
      name,
      email,
      phone,
      password,
    })

    const token = generateToken(owner._id)

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        onboardingComplete: owner.onboardingComplete,
        token,
      },
    })
  } catch (error) {
    console.error("Register owner error:", error)
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    })
  }
}

const loginOwner = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password",
      })
    }

    const owner = await HotelOwner.findOne({ email }).select("+password")
    if (!owner) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    const isPasswordValid = await owner.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    const token = generateToken(owner._id)

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        phone: owner.phone,
        onboardingComplete: owner.onboardingComplete,
        token,
      },
    })
  } catch (error) {
    console.error("Login owner error:", error)
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    })
  }
}

module.exports = {
  registerOwner,
  loginOwner,
  getOwnerProfile,
  completeOnboarding,
  getOwnerRooms,
}
```

## User Dashboard Component

```tsx
import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, MapPin, Star, Building2, Users } from "lucide-react"
import { api } from "@/lib/api"
import { FilterSidebar } from "@/components/FilterSidebar"
import { Input } from "@/components/ui/input"

interface Hotel {
  id: string
  name: string
  location: string
  price: number
  rating: number
  reviews: number
  image: string
  features: string[]
  availableRooms: number
  guests: number
}

interface SearchFilters {
  location: string
  checkIn: string
  checkOut: string
  guests: number
  minPrice: number
  maxPrice: number
  rating: number
  amenities: string[]
}

export function UserDashboard() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('rating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: hotelsResponse, isLoading, error } = useQuery({
    queryKey: ['hotels', filters, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.location) params.set('location', filters.location)
      if (filters.guests) params.set('guests', filters.guests.toString())
      if (filters.minPrice) params.set('minPrice', filters.minPrice.toString())
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString())
      if (filters.rating) params.set('rating', filters.rating.toString())
      if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','))
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)

      const response = await api.get('/hotels', { params })
      return response.data.data as { hotels: Hotel[]; count: number }
    },
    retry: false,
  })

  const hotels = hotelsResponse?.hotels || []

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Unable to load hotels</h3>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">Find your perfect stay</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/bookings')}>
                My Bookings
              </Button>
              <Button onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                navigate('/login')
              }}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onPriceChange={(min, max) => setFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }))}
            />
          </aside>

          <main className="lg:col-span-3">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search hotels by name or location..."
                  className="pl-10"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : hotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {hotels.map((hotel) => (
                  <Card key={hotel.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-background/90 backdrop-blur-sm">
                          <Star className="w-3 h-3 mr-1 fill-primary text-primary" />
                          {hotel.rating}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{hotel.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {hotel.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">₹{hotel.price}</div>
                          <div className="text-xs text-muted-foreground">per night</div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => navigate(`/hotel/${hotel.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
                <Button onClick={() => setFilters(DEFAULT_FILTERS)}>Clear Filters</Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
```
