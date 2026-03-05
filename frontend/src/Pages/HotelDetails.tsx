import { useState, useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  MapPin,
  Star,
  Wifi,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Building2,
  ArrowLeft,
  Users,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  Heart,
  Share2,
  Loader2,
  AlertCircle,
  ThumbsUp,
} from "lucide-react"
import { api, bookingApi, reviewApi } from "@/lib/api"
import { toast } from "sonner"

interface Review {
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

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  restaurant: UtensilsCrossed,
  parking: Car,
  spa: Dumbbell,
  pool: Building2,
}

interface Room {
  id: string
  name: string
  description: string
  price: number
  maxGuests: number
  beds: string
  size: string
  amenities: string[]
  status: "available" | "occupied" | "maintenance"
  roomNumber: string
  floor: string
}

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
  description: string
  address: string
  city: string
  state: string
  pincode: string
  website: string
  amenities: string[]
  checkInTime: string
  checkOutTime: string
  cancellationPolicy: string
  petPolicy: string
  rooms: Room[]
}

interface HotelApiResponse {
  success: boolean
  message: string
  data: Hotel
}

export function HotelDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false)
  const queryClient = useQueryClient()

  // Get initial values from URL params
  const initialGuests = parseInt(searchParams.get('guests') || '2')
  const initialCheckIn = searchParams.get('checkIn') || ''
  const initialCheckOut = searchParams.get('checkOut') || ''

  const [bookingData, setBookingData] = useState({
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    guests: initialGuests,
  })

  const { data: hotelData, isLoading, error } = useQuery({
    queryKey: ['hotel', id],
    queryFn: async () => {
      const response = await api.get<HotelApiResponse>(`/hotels/${id}`)
      return response.data.data
    },
    enabled: !!id,
    retry: false,
  })

  const hotel = hotelData

  // Fetch hotel reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['hotel-reviews', id],
    queryFn: async () => {
      const response = await reviewApi.getHotelReviews(id || '', 50, 0)
      console.log('Reviews API response:', response.data)
      return response.data
    },
    enabled: !!id,
    retry: false,
  })

  // Fetch review statistics
  const { data: reviewStats, isLoading: statsLoading } = useQuery({
    queryKey: ['review-stats', id],
    queryFn: async () => {
      const response = await reviewApi.getReviewStats(id || '')
      console.log('Stats API response:', response.data)
      return response.data
    },
    enabled: !!id,
    retry: false,
  })

  const reviews: Review[] = reviewsData?.reviews || []
  // reviewStats might have data nested or flat depending on API response
  const stats = reviewStats?.data || reviewStats || { totalReviews: 0, averageRating: 0, ratingDistribution: {} }

  // Mutation for creating booking
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await bookingApi.createBooking(bookingData)
      return response.data
    },
    onSuccess: (data) => {
      toast.success('Booking confirmed!', {
        description: `Your booking ${data.bookingId} has been created successfully.`,
      })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setShowBookingConfirmation(false)
      navigate('/bookings')
    },
    onError: (error: any) => {
      toast.error('Booking failed', {
        description: error.response?.data?.message || 'Unable to create booking. Please try again.',
      })
    },
  })

  // Filter rooms based on guest count
  const availableRooms = useMemo(() => {
    if (!hotel?.rooms) return []
    return hotel.rooms.filter(room => 
      room.status === 'available' && room.maxGuests >= bookingData.guests
    )
  }, [hotel, bookingData.guests])

  // Calculate number of nights
  const numberOfNights = useMemo(() => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0
    const checkIn = new Date(bookingData.checkIn)
    const checkOut = new Date(bookingData.checkOut)
    const diffTime = checkOut.getTime() - checkIn.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }, [bookingData.checkIn, bookingData.checkOut])

  // Get selected room details
  const selectedRoomDetails = useMemo(() => {
    if (!selectedRoom || !hotel?.rooms) return null
    return hotel.rooms.find(r => r.id === selectedRoom)
  }, [selectedRoom, hotel])

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!selectedRoomDetails || numberOfNights <= 0) return 0
    return selectedRoomDetails.price * numberOfNights
  }, [selectedRoomDetails, numberOfNights])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading hotel details...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hotel not found</h1>
          <p className="text-muted-foreground mb-4">
            {error ? "Unable to load hotel details" : "The hotel you're looking for doesn't exist"}
          </p>
          <Button onClick={() => navigate('/dashboard')}>Back to Hotels</Button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleBookNow = () => {
    if (!selectedRoom) {
      toast.error('Please select a room first')
      return
    }
    if (numberOfNights === 0) {
      toast.error('Please select check-in and check-out dates')
      return
    }
    setShowBookingConfirmation(true)
  }

  const confirmBooking = () => {
    if (!selectedRoomDetails || !hotel) return

    createBookingMutation.mutate({
      hotelId: hotel.id,
      roomId: selectedRoom,
      roomType: selectedRoomDetails.name,
      roomDetails: {
        price: selectedRoomDetails.price,
        maxGuests: selectedRoomDetails.maxGuests,
        beds: selectedRoomDetails.beds,
        size: selectedRoomDetails.size,
        amenities: selectedRoomDetails.amenities,
      },
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      pricePerNight: selectedRoomDetails.price,
      specialRequests,
    })
  }

  const getFullAddress = () => {
    const parts = []
    if (hotel.address) parts.push(hotel.address)
    if (hotel.city) parts.push(hotel.city)
    if (hotel.state) parts.push(hotel.state)
    if (hotel.pincode) parts.push(hotel.pincode)
    return parts.join(', ') || hotel.location
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getUserInitials = (name?: string) => {
    if (!name) return 'U'
    const parts = name.split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  // Calculate minimum price for available rooms
  const minPrice = useMemo(() => {
    if (availableRooms.length === 0) return hotel.price
    return Math.min(...availableRooms.map(r => r.price))
  }, [availableRooms, hotel.price])

  // Generate placeholder images based on hotel name
  const hotelImages = [
    hotel.image,
    `https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80`,
    `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80`,
    `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80`,
  ]

  // Convert available rooms to roomTypes format for display
  const roomTypes = availableRooms.map(room => ({
    id: room.id,
    name: room.name,
    price: room.price,
    capacity: room.maxGuests,
    size: room.size,
    bed: room.beds,
    description: room.description,
    amenities: room.amenities,
    status: room.status,
  }))

  const policies = [
    `Check-in time is ${hotel.checkInTime} and check-out time is ${hotel.checkOutTime}`,
    `Cancellation policy: ${hotel.cancellationPolicy}`,
    `Pet policy: ${hotel.petPolicy === 'allowed' ? 'Pets are allowed' : hotel.petPolicy === 'on-request' ? 'Pets allowed on request' : 'Pets are not allowed'}`,
    'Valid government ID required at check-in',
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative h-100 rounded-xl overflow-hidden">
            <img
              src={hotelImages[selectedImage]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hotelImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-47.5 rounded-lg overflow-hidden transition-opacity ${
                  selectedImage === index ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={image}
                  alt={`${hotel.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hotel Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {hotel.location}
                  </div>
                  {availableRooms.length > 0 && availableRooms.length < hotel.rooms.length && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {availableRooms.length} room{availableRooms.length > 1 ? 's' : ''} available for {bookingData.guests} guest{bookingData.guests > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <div>
                    <span className="font-semibold">
                      {typeof stats.averageRating === 'string' 
                        ? stats.averageRating 
                        : (stats.averageRating || hotel.rating)?.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground text-sm"> ({stats.totalReviews || hotel.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(minPrice)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">starting price for {bookingData.guests} guests</span>
                </div>
              </div>

              <Separator className="my-6" />

              <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
            </div>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.features.map((feature) => {
                    const Icon = AMENITY_ICONS[feature] || Building2
                    return (
                      <div key={feature} className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="capitalize">{feature}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Room Types */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rooms</CardTitle>
                <CardDescription>
                  {availableRooms.length > 0 
                    ? `Rooms for ${bookingData.guests} guest${bookingData.guests > 1 ? 's' : ''}`
                    : `No rooms available for ${bookingData.guests} guests`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roomTypes.length > 0 ? (
                  roomTypes
                    .map((room) => (
                      <div
                        key={room.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedRoom === room.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{room.name}</h3>
                            {room.description && (
                              <p className="text-sm text-muted-foreground mt-1">{room.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {room.capacity} guests max
                              </span>
                              <span>{room.size}</span>
                              <span>{room.bed}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-primary">
                              {formatPrice(room.price)}
                            </div>
                            <div className="text-xs text-muted-foreground">per night</div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground font-medium">
                      No rooms available for {bookingData.guests} guests
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Try reducing the number of guests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hotel Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {policies.map((policy, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {policy}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Location & Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {getFullAddress()}
                  </p>
                  {hotel.website && (
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {hotel.website}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Check-in / Check-out */}
            <Card>
              <CardHeader>
                <CardTitle>Check-in / Check-out</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Check-in: {hotel.checkInTime}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Check-out: {hotel.checkOutTime}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Guest Reviews */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Guest Reviews</CardTitle>
                    <CardDescription>
                      {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'} from verified guests
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                    <Star className="w-6 h-6 fill-primary text-primary" />
                    <div>
                      <span className="text-2xl font-bold">
                        {typeof stats.averageRating === 'string' 
                          ? stats.averageRating 
                          : (stats.averageRating || '0')}
                      </span>
                      <span className="text-muted-foreground text-sm"> /5</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating Distribution */}
                {stats.totalReviews > 0 && (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0
                      const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <span className="text-sm font-medium">{rating}</span>
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          </div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Reviews List */}
                <Separator />

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getUserInitials(review.user?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-muted-foreground text-sm">{review.comment}</p>

                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {review.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Review image ${idx + 1}`}
                                className="w-20 h-20 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(img, '_blank')}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          Verified stay
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ThumbsUp className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground font-medium">No reviews yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Be the first to review this hotel
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
                <CardDescription>
                  {numberOfNights > 0 
                    ? `${numberOfNights} night${numberOfNights > 1 ? 's' : ''}`
                    : `Starting from ${formatPrice(minPrice)}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input 
                    type="date" 
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input 
                    type="date" 
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max={hotel.guests} 
                    value={bookingData.guests}
                    onChange={(e) => {
                      const newGuests = parseInt(e.target.value)
                      setBookingData({ ...bookingData, guests: newGuests })
                      // Reset room selection if current room doesn't match new guest count
                      if (selectedRoom) {
                        const room = hotel.rooms?.find(r => r.id === selectedRoom)
                        if (room && room.maxGuests < newGuests) {
                          setSelectedRoom('')
                        }
                      }
                    }}
                  />
                </div>

                <Separator />

                {numberOfNights > 0 && selectedRoomDetails && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {formatPrice(selectedRoomDetails.price)} x {numberOfNights} night{numberOfNights > 1 ? 's' : ''}
                      </span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                )}

                {numberOfNights > 0 && !selectedRoomDetails && (
                  <p className="text-sm text-muted-foreground text-center">
                    Select a room to see total price
                  </p>
                )}

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleBookNow}
                  disabled={!selectedRoom || numberOfNights === 0}
                >
                  {!selectedRoom 
                    ? 'Select a Room' 
                    : numberOfNights === 0 
                      ? 'Select Dates' 
                      : `Book for ${formatPrice(totalPrice)}`
                  }
                </Button>

                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Free cancellation
                  </p>
                  <p className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    No booking fees
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingConfirmation && selectedRoomDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBookingConfirmation(false)}
                >
                  <AlertCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{hotel.name}</h3>
                    <p className="text-sm text-muted-foreground">{hotel.location}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room Type</span>
                    <span className="font-medium">{selectedRoomDetails.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-in</span>
                    <span className="font-medium">{new Date(bookingData.checkIn).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Check-out</span>
                    <span className="font-medium">{new Date(bookingData.checkOut).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{bookingData.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Nights</span>
                    <span className="font-medium">{numberOfNights}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Any special requirements or requests..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="font-medium">Price per Night</span>
                    <span>{formatPrice(selectedRoomDetails.price)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-primary">
                    <span>Total Amount</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="bg-muted p-3 rounded-lg space-y-1 text-xs">
                  <p className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    Free cancellation available
                  </p>
                  <p className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    No booking fees
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBookingConfirmation(false)}
                  disabled={createBookingMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmBooking}
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    `Confirm Booking - ${formatPrice(totalPrice)}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HotelDetails
