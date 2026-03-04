import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Loader2
} from "lucide-react"
import { api } from "@/lib/api"

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
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<string>('')

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
      alert('Please select a room first')
      return
    }
    console.log('Booking:', { hotelId: hotel.id, roomId: selectedRoom })
    // Navigate to booking page or show booking modal
  }

  const getFullAddress = () => {
    const parts = []
    if (hotel.address) parts.push(hotel.address)
    if (hotel.city) parts.push(hotel.city)
    if (hotel.state) parts.push(hotel.state)
    if (hotel.pincode) parts.push(hotel.pincode)
    return parts.join(', ') || hotel.location
  }

  // Generate placeholder images based on hotel name
  const hotelImages = [
    hotel.image,
    `https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80`,
    `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80`,
    `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80`,
  ]

  // Convert rooms to roomTypes format for display
  const roomTypes = hotel.rooms.map(room => ({
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
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <div>
                    <span className="font-semibold">{hotel.rating}</span>
                    <span className="text-muted-foreground text-sm"> ({hotel.reviews} reviews)</span>
                  </div>
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
                <CardDescription>Choose from our selection of rooms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roomTypes.length > 0 ? (
                  roomTypes
                    .filter(room => room.status === 'available')
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
                                {room.capacity} guests
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
                  <p className="text-muted-foreground text-center py-4">
                    No rooms currently available
                  </p>
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
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
                <CardDescription>Best price guaranteed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price per night</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(hotel.price)}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Check-in</Label>
                  <Input type="date" />
                </div>

                <div className="space-y-2">
                  <Label>Check-out</Label>
                  <Input type="date" />
                </div>

                <div className="space-y-2">
                  <Label>Guests</Label>
                  <Input type="number" min="1" max={hotel.guests} defaultValue={2} />
                </div>

                <Separator />

                {selectedRoom && (
                  <>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Selected room</p>
                      <p className="font-medium">
                        {roomTypes.find(r => r.id === selectedRoom)?.name}
                      </p>
                      <p className="text-primary font-bold">
                        {formatPrice(roomTypes.find(r => r.id === selectedRoom)?.price || 0)}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                <Button className="w-full" size="lg" onClick={handleBookNow}>
                  {selectedRoom ? 'Proceed to Book' : 'Select a Room'}
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
    </div>
  )
}

export default HotelDetails
