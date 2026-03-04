import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Star, Building2, Users } from "lucide-react"
import { api } from "@/lib/api"
import { FilterSidebar } from "@/components/FilterSidebar"
import { Input } from "@/components/ui/input"

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
  description?: string
  rooms?: Room[]
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

const DEFAULT_FILTERS: SearchFilters = {
  location: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
  minPrice: 0,
  maxPrice: 100000,
  rating: 0,
  amenities: []
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

  const handlePriceChange = useCallback((minPrice: number, maxPrice: number) => {
    setFilters(prev => ({ ...prev, minPrice, maxPrice }))
  }, [])

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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Unable to load hotels</h3>
            <p className="text-muted-foreground mb-6">
              Please try again later or check your connection
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
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
          {/* Filters Sidebar - UI only, backend handles filtering */}
          <aside className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onPriceChange={handlePriceChange}
            />
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
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {hotels.length} Hotels Found
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
                      onClick={() => handleSort(option.key as 'price' | 'rating' | 'name')}
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
            {hotels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {hotels.map((hotel) => (
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

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          Up to {hotel.guests} guests
                        </div>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/hotel/${hotel.id}`, {
                            state: {
                              guests: filters.guests,
                              checkIn: filters.checkIn,
                              checkOut: filters.checkOut
                            }
                          })}
                        >
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
                <Button onClick={() => setFilters(DEFAULT_FILTERS)}>
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
