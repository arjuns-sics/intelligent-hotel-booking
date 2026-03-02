import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  MapPin,
  Star,
  Wifi,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Building2,
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp
} from "lucide-react"

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  restaurant: UtensilsCrossed,
  parking: Car,
  spa: Dumbbell,
  pool: Building2,
}

const HOTEL_DATA: Record<string, Hotel> = {
  '1': {
    id: '1',
    name: 'The Grand Palace Hotel',
    location: 'Mumbai, Maharashtra',
    price: 12500,
    rating: 4.8,
    reviews: 324,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    features: ['wifi', 'restaurant', 'spa', 'pool'],
    availableRooms: 8,
    guests: 4,
    description: 'Experience luxury at its finest at The Grand Palace Hotel. Located in the heart of Mumbai, our 5-star property offers breathtaking views of the Arabian Sea, world-class dining, and impeccable service. Each room is elegantly furnished with modern amenities and traditional Indian touches.',
    address: 'Marine Drive, Nariman Point, Mumbai, Maharashtra 400020',
    phone: '+91 22 6666 8888',
    email: 'reservations@grandpalace.com',
    checkIn: '2:00 PM',
    checkOut: '12:00 PM',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://plus.unsplash.com/premium_photo-1685290652343-ba086daade9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    ],
    roomTypes: [
      { name: 'Deluxe Room', price: 12500, capacity: 2, size: '35 sqm', bed: '1 King Bed' },
      { name: 'Executive Suite', price: 18500, capacity: 3, size: '55 sqm', bed: '1 King + 1 Single' },
      { name: 'Presidential Suite', price: 35000, capacity: 4, size: '120 sqm', bed: '2 King Beds' },
    ],
    policies: [
      'Check-in time is 2:00 PM and check-out time is 12:00 PM',
      'Children of all ages are welcome',
      'Pets are not allowed',
      'Smoking is not permitted inside the property',
      'Valid government ID required at check-in',
    ]
  },
  '2': {
    id: '2',
    name: 'Ocean View Resort',
    location: 'Goa, India',
    price: 8900,
    rating: 4.6,
    reviews: 512,
    image: 'https://plus.unsplash.com/premium_photo-1685290652343-ba086daade9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
    features: ['wifi', 'restaurant', 'parking', 'pool'],
    availableRooms: 12,
    guests: 3,
    description: 'Nestled along the pristine beaches of Goa, Ocean View Resort offers a perfect blend of relaxation and adventure. Wake up to the sound of waves, enjoy fresh seafood at our beachfront restaurant, and unwind at our infinity pool overlooking the Arabian Sea.',
    address: 'Calangute Beach Road, Goa 403516',
    phone: '+91 832 222 3344',
    email: 'stay@oceanviewgoa.com',
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    images: [
      'https://plus.unsplash.com/premium_photo-1685290652343-ba086daade9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    ],
    roomTypes: [
      { name: 'Garden View Room', price: 8900, capacity: 2, size: '30 sqm', bed: '1 Queen Bed' },
      { name: 'Ocean View Suite', price: 14500, capacity: 3, size: '50 sqm', bed: '1 King + 1 Sofa Bed' },
      { name: 'Beach Villa', price: 25000, capacity: 4, size: '90 sqm', bed: '2 Queen Beds' },
    ],
    policies: [
      'Check-in time is 2:00 PM and check-out time is 11:00 AM',
      'Children below 5 years stay free',
      'Pets allowed with prior permission (additional charges apply)',
      'Beach activities available from 6 AM to 8 PM',
    ]
  },
  '3': {
    id: '3',
    name: 'Mountain Retreat Spa',
    location: 'Manali, Himachal Pradesh',
    price: 6500,
    rating: 4.7,
    reviews: 289,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    features: ['wifi', 'spa', 'restaurant'],
    availableRooms: 5,
    guests: 2,
    description: 'Escape to the serene hills of Manali at Mountain Retreat Spa. Surrounded by deodar forests and snow-capped peaks, our boutique property offers a tranquil escape with Ayurvedic spa treatments, organic cuisine, and guided nature walks.',
    address: 'Old Manali, Himachal Pradesh 175131',
    phone: '+91 1902 255 667',
    email: 'hello@mountainretreatmanali.com',
    checkIn: '1:00 PM',
    checkOut: '11:00 AM',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
      'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&q=80',
    ],
    roomTypes: [
      { name: 'Mountain View Room', price: 6500, capacity: 2, size: '28 sqm', bed: '1 Queen Bed' },
      { name: 'Forest Cottage', price: 10500, capacity: 2, size: '40 sqm', bed: '1 King Bed' },
      { name: 'Luxury Suite with Balcony', price: 15000, capacity: 3, size: '60 sqm', bed: '1 King + 1 Single' },
    ],
    policies: [
      'Check-in time is 1:00 PM and check-out time is 11:00 AM',
      'Minimum 2-night stay required on weekends',
      'Spa treatments require advance booking',
      'Trekking guides available on request',
    ]
  },
  '4': {
    id: '4',
    name: 'Royal Heritage Hotel',
    location: 'Jaipur, Rajasthan',
    price: 15000,
    rating: 4.9,
    reviews: 445,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    features: ['wifi', 'restaurant', 'spa', 'parking', 'pool'],
    availableRooms: 3,
    guests: 4,
    description: 'Step into royalty at Royal Heritage Hotel, a restored 18th-century palace in the Pink City. Experience Rajputana architecture, traditional Kathak performances, and authentic Rajasthani cuisine in an atmosphere of timeless elegance.',
    address: 'Hawa Mahal Road, Jaipur, Rajasthan 302002',
    phone: '+91 141 266 7788',
    email: 'reservations@royalheritagejaipur.com',
    checkIn: '2:00 PM',
    checkOut: '12:00 PM',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    ],
    roomTypes: [
      { name: 'Heritage Room', price: 15000, capacity: 2, size: '40 sqm', bed: '1 King Bed' },
      { name: 'Maharaja Suite', price: 28000, capacity: 3, size: '75 sqm', bed: '1 King + 1 Single' },
      { name: 'Royal Palace Suite', price: 50000, capacity: 4, size: '150 sqm', bed: '2 King Beds' },
    ],
    policies: [
      'Check-in time is 2:00 PM and check-out time is 12:00 PM',
      'Cultural performances held every evening',
      'Traditional attire available for photo sessions',
      'Airport transfers can be arranged',
    ]
  },
  '5': {
    id: '5',
    name: 'City Center Business Hotel',
    location: 'Bangalore, Karnataka',
    price: 5500,
    rating: 4.3,
    reviews: 678,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    features: ['wifi', 'restaurant', 'parking'],
    availableRooms: 20,
    guests: 2,
    description: 'Perfectly located in Bangalore\'s business district, City Center Business Hotel caters to the modern traveler with high-speed internet, 24/7 business center, and express check-in/out. Our rooftop restaurant offers panoramic views of the city skyline.',
    address: 'MG Road, Bangalore, Karnataka 560001',
    phone: '+91 80 4455 6677',
    email: 'info@citycenterblr.com',
    checkIn: '12:00 PM',
    checkOut: '11:00 AM',
    images: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://plus.unsplash.com/premium_photo-1685290652343-ba086daade9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    ],
    roomTypes: [
      { name: 'Standard Room', price: 5500, capacity: 2, size: '25 sqm', bed: '1 Queen Bed' },
      { name: 'Business Class Room', price: 8500, capacity: 2, size: '32 sqm', bed: '1 King Bed' },
      { name: 'Executive Suite', price: 14000, capacity: 3, size: '55 sqm', bed: '1 King + Work Area' },
    ],
    policies: [
      'Check-in time is 12:00 PM and check-out time is 11:00 AM',
      'Early check-in subject to availability',
      'Complimentary breakfast for Business Class rooms',
      'Meeting rooms available for booking',
    ]
  },
  '6': {
    id: '6',
    name: 'Backwater Paradise',
    location: 'Alleppey, Kerala',
    price: 7800,
    rating: 4.5,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    features: ['wifi', 'restaurant', 'spa'],
    availableRooms: 6,
    guests: 3,
    description: 'Experience the serene beauty of Kerala\'s backwaters at Backwater Paradise. Our luxury houseboat-style rooms offer stunning views of the lagoons, traditional Kerala cuisine, and Ayurvedic treatments in a tranquil setting.',
    address: 'Punnamada, Alleppey, Kerala 688006',
    phone: '+91 477 223 4455',
    email: 'stay@backwaterparadise.com',
    checkIn: '1:00 PM',
    checkOut: '10:00 AM',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://plus.unsplash.com/premium_photo-1685290652343-ba086daade9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    ],
    roomTypes: [
      { name: 'Backwater View Room', price: 7800, capacity: 2, size: '30 sqm', bed: '1 Queen Bed' },
      { name: 'Houseboat Suite', price: 12500, capacity: 3, size: '45 sqm', bed: '1 King + 1 Single' },
      { name: 'Luxury Villa', price: 20000, capacity: 4, size: '80 sqm', bed: '2 Queen Beds' },
    ],
    policies: [
      'Check-in time is 1:00 PM and check-out time is 10:00 AM',
      'Houseboat cruises can be arranged',
      'Ayurvedic treatments require advance booking',
      'Traditional Kerala meals included',
    ]
  },
  '7': {
    id: '7',
    name: 'Himalayan Heights',
    location: 'Shimla, Himachal Pradesh',
    price: 9200,
    rating: 4.6,
    reviews: 187,
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&q=80',
    features: ['wifi', 'restaurant', 'spa', 'parking'],
    availableRooms: 4,
    guests: 4,
    description: 'Perched at 7,000 feet above sea level, Himalayan Heights offers panoramic views of the snow-capped Dhauladhar range. Our colonial-style property combines British-era charm with modern luxury, featuring a heated indoor pool and fine dining restaurant.',
    address: 'The Ridge, Shimla, Himachal Pradesh 171001',
    phone: '+91 177 265 4321',
    email: 'reservations@himalayanheights.com',
    checkIn: '2:00 PM',
    checkOut: '11:00 AM',
    images: [
      'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    ],
    roomTypes: [
      { name: 'Valley View Room', price: 9200, capacity: 2, size: '32 sqm', bed: '1 King Bed' },
      { name: 'Mountain Suite', price: 15500, capacity: 3, size: '55 sqm', bed: '1 King + 1 Single' },
      { name: 'Presidential Suite', price: 28000, capacity: 4, size: '100 sqm', bed: '2 King Beds' },
    ],
    policies: [
      'Check-in time is 2:00 PM and check-out time is 11:00 AM',
      'Heated indoor pool open from 6 AM to 10 PM',
      'Bonfire arrangements available on request',
      'Ski equipment rental can be arranged',
    ]
  },
  '8': {
    id: '8',
    name: 'Beachfront Luxury Suites',
    location: 'Pondicherry, India',
    price: 11000,
    rating: 4.7,
    reviews: 356,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    features: ['wifi', 'restaurant', 'pool', 'spa'],
    availableRooms: 7,
    guests: 3,
    description: 'Immerse yourself in French colonial charm at Beachfront Luxury Suites. Located on Pondicherry\'s iconic Promenade Beach, our boutique property features Indo-French architecture, a rooftop infinity pool, and authentic French cuisine.',
    address: 'Goubert Avenue, White Town, Pondicherry 605001',
    phone: '+91 413 222 7890',
    email: 'stay@beachfrontpondy.com',
    checkIn: '2:00 PM',
    checkOut: '12:00 PM',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://plus.unsplash.com/premium_photo-1685290652343-ba086daade9e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    ],
    roomTypes: [
      { name: 'French Suite', price: 11000, capacity: 2, size: '38 sqm', bed: '1 Queen Bed' },
      { name: 'Ocean View Suite', price: 16500, capacity: 3, size: '55 sqm', bed: '1 King + 1 Sofa Bed' },
      { name: 'Heritage Villa', price: 28000, capacity: 4, size: '95 sqm', bed: '2 King Beds' },
    ],
    policies: [
      'Check-in time is 2:00 PM and check-out time is 12:00 PM',
      'Bicycle rental available for exploring the French Quarter',
      'Rooftop pool open from 7 AM to 9 PM',
      'French breakfast included in room rate',
    ]
  },
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
  phone: string
  email: string
  checkIn: string
  checkOut: string
  images: string[]
  roomTypes: { name: string; price: number; capacity: number; size: string; bed: string }[]
  policies: string[]
}

export function HotelDetails() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    selectedRoom: ''
  })

  const hotel = id ? HOTEL_DATA[id] : null

  if (!hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Hotel not found</h1>
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
    // Navigate to booking page or show booking modal
    console.log('Booking:', { hotelId: hotel.id, ...bookingData })
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
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
          <div className="relative h-[400px] rounded-xl overflow-hidden">
            <img
              src={hotel.images[selectedImage]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hotel.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative h-[190px] rounded-lg overflow-hidden transition-opacity ${
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
                {hotel.roomTypes.map((room, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      bookingData.selectedRoom === room.name
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setBookingData({ ...bookingData, selectedRoom: room.name })}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{room.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
                ))}
              </CardContent>
            </Card>

            {/* Hotel Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {hotel.policies.map((policy, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {policy}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* More Info Accordion */}
            <div className="space-y-2">
              {[
                { id: 'location', title: 'Location & Contact', content: (
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {hotel.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {hotel.phone}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {hotel.email}
                    </p>
                  </div>
                )},
                { id: 'timings', title: 'Check-in / Check-out', content: (
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Check-in: {hotel.checkIn}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Check-out: {hotel.checkOut}
                    </p>
                  </div>
                )},
              ].map((section) => (
                <Card key={section.id} className="overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => toggleSection(section.id)}
                  >
                    <span className="font-medium">{section.title}</span>
                    {expandedSection === section.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedSection === section.id && (
                    <div className="px-4 pb-4 text-muted-foreground">
                      {section.content}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
                <CardDescription>Best price guaranteed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(hotel.price)}
                  <span className="text-sm font-normal text-muted-foreground"> / night</span>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="checkIn">Check-in</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="checkIn"
                          type="date"
                          value={bookingData.checkIn}
                          onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="checkOut">Check-out</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="checkOut"
                          type="date"
                          value={bookingData.checkOut}
                          onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests">Guests</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max={hotel.guests}
                        value={bookingData.guests}
                        onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="room">Select Room</Label>
                    <select
                      id="room"
                      value={bookingData.selectedRoom}
                      onChange={(e) => setBookingData({ ...bookingData, selectedRoom: e.target.value })}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Choose a room type</option>
                      {hotel.roomTypes.map((room) => (
                        <option key={room.name} value={room.name}>
                          {room.name} - {formatPrice(room.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base price</span>
                    <span>{formatPrice(hotel.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes & fees</span>
                    <span>{formatPrice(hotel.price * 0.18)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(hotel.price * 1.18)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleBookNow}>
                  Book Now
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You won't be charged yet
                </p>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Free cancellation
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Reserve now
                  </span>
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
