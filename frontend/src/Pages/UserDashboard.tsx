import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Calendar, Star, Building2, Wifi, UtensilsCrossed, Car, Dumbbell, Users, Filter } from "lucide-react"
import api from "@/lib/api"

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

const AMENITIES = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { id: 'parking', label: 'Valet Parking', icon: Car },
  { id: 'spa', label: 'Spa & Wellness', icon: Dumbbell },
  { id: 'pool', label: 'Pool', icon: Building2 },
]

const DUMMY_HOTELS: Hotel[] = [
  {
    id: '1',
    name: 'The Grand Palace Hotel',
    location: 'Mumbai, Maharashtra',
    price: 12500,
    rating: 4.8,
    reviews: 324,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    features: ['wifi', 'restaurant', 'spa', 'pool'],
    availableRooms: 8,
    guests: 4
  },
  {
    id: '2',
    name: 'Ocean View Resort',
    location: 'Goa, India',
    price: 8900,
    rating: 4.6,
    reviews: 512,
    image: 'https://images.unsplash.com/photo-1570206986634-afd7cccb68d3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    features: ['wifi', 'restaurant', 'parking', 'pool'],
    availableRooms: 12,
    guests: 3
  },
  {
    id: '3',
    name: 'Mountain Retreat Spa',
    location: 'Manali, Himachal Pradesh',
    price: 6500,
    rating: 4.7,
    reviews: 289,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    features: ['wifi', 'spa', 'restaurant'],
    availableRooms: 5,
    guests: 2
  },
  {
    id: '4',
    name: 'Royal Heritage Hotel',
    location: 'Jaipur, Rajasthan',
    price: 15000,
    rating: 4.9,
    reviews: 445,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    features: ['wifi', 'restaurant', 'spa', 'parking', 'pool'],
    availableRooms: 3,
    guests: 4
  },
  {
    id: '5',
    name: 'City Center Business Hotel',
    location: 'Bangalore, Karnataka',
    price: 5500,
    rating: 4.3,
    reviews: 678,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    features: ['wifi', 'restaurant', 'parking'],
    availableRooms: 20,
    guests: 2
  },
  {
    id: '6',
    name: 'Backwater Paradise',
    location: 'Alleppey, Kerala',
    price: 7800,
    rating: 4.5,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    features: ['wifi', 'restaurant', 'spa'],
    availableRooms: 6,
    guests: 3
  },
  {
    id: '7',
    name: 'Himalayan Heights',
    location: 'Shimla, Himachal Pradesh',
    price: 9200,
    rating: 4.6,
    reviews: 187,
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&q=80',
    features: ['wifi', 'restaurant', 'spa', 'parking'],
    availableRooms: 4,
    guests: 4
  },
  {
    id: '8',
    name: 'Beachfront Luxury Suites',
    location: 'Pondicherry, India',
    price: 11000,
    rating: 4.7,
    reviews: 356,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    features: ['wifi', 'restaurant', 'pool', 'spa'],
    availableRooms: 7,
    guests: 3
  }
]

export function UserDashboard() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 2,
    minPrice: 0,
    maxPrice: 100000,
    rating: 0,
    amenities: []
  })

  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'name'>('rating')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data: hotels, isLoading, error } = useQuery({
    queryKey: ['hotels', filters, sortBy, sortOrder],
    queryFn: async () => {
      const response = await api.get('/hotels', {
        params: {
          ...filters,
          sortBy,
          sortOrder
        }
      })
      return response.data.hotels as Hotel[]
    },
    retry: false,
    initialData: DUMMY_HOTELS,
    placeholderData: DUMMY_HOTELS
  })

  const handleSearch = () => {
    // Trigger refetch by changing filters
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleAmenityToggle = (amenityId: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  const handleSort = (field: 'price' | 'rating' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-48 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
                <CardDescription>Refine your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Where are you going?"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Check-in</label>
                      <Input
                        type="date"
                        value={filters.checkIn}
                        onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Check-out</label>
                      <Input
                        type="date"
                        value={filters.checkOut}
                        onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Guests</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={filters.guests}
                      onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', parseInt(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rating */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                    </select>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Amenities</label>
                    <div className="space-y-2">
                      {AMENITIES.map((amenity) => (
                        <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity.id)}
                            onChange={() => handleAmenityToggle(amenity.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <amenity.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full" onClick={handleSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Search Bar */}
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
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {(hotels || DUMMY_HOTELS).length} Hotels Found
                </h2>
                <p className="text-muted-foreground text-sm">
                  {filters.location && `in ${filters.location}`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <div className="flex gap-1">
                  {[
                    { key: 'rating', label: 'Rating' },
                    { key: 'price', label: 'Price' },
                    { key: 'name', label: 'Name' }
                  ].map((option) => (
                    <Button
                      key={option.key}
                      variant={sortBy === option.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSort(option.key as any)}
                      className="text-xs"
                    >
                      {option.label}
                      {sortBy === option.key && (
                        <span className="ml-1">
                          {sortOrder === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hotel Grid */}
            {(hotels || DUMMY_HOTELS).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {(hotels || DUMMY_HOTELS).map((hotel) => (
                  <Card key={hotel.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
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
                          <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                            {hotel.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="w-4 h-4" />
                            {hotel.location}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(hotel.price)}
                          </div>
                          <div className="text-xs text-muted-foreground">per night</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {hotel.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{hotel.reviews} reviews</span>
                        <span>{hotel.availableRooms} rooms available</span>
                      </div>

                      <Separator className="mb-4" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {hotel.guests || '2'} guests max
                        </div>
                        <Button size="sm" onClick={() => navigate(`/hotel/${hotel.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No hotels found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={() => setFilters({
                  location: '',
                  checkIn: '',
                  checkOut: '',
                  guests: 2,
                  minPrice: 0,
                  maxPrice: 100000,
                  rating: 0,
                  amenities: []
                })}>
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard