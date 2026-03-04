import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Filter, MapPin, Wifi, UtensilsCrossed, Car, Dumbbell } from "lucide-react"

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

interface FilterSidebarProps {
  filters: SearchFilters
  onFilterChange: (key: keyof SearchFilters, value: unknown) => void
  onPriceChange: (minPrice: number, maxPrice: number) => void
}

const AMENITIES = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'restaurant', label: 'Restaurant', icon: UtensilsCrossed },
  { id: 'parking', label: 'Valet Parking', icon: Car },
  { id: 'spa', label: 'Spa & Wellness', icon: Dumbbell },
  { id: 'pool', label: 'Pool', icon: Filter },
]

export function FilterSidebar({ filters, onFilterChange, onPriceChange }: FilterSidebarProps) {
  return (
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
                onChange={(e) => onFilterChangeRef.current('location', e.target.value)}
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
                onChange={(e) => onFilterChangeRef.current('checkIn', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Check-out</label>
              <Input
                type="date"
                value={filters.checkOut}
                onChange={(e) => onFilterChangeRef.current('checkOut', e.target.value)}
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
              onChange={(e) => onFilterChangeRef.current('guests', parseInt(e.target.value))}
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
                onChange={(e) => onPriceChange(parseInt(e.target.value) || 0, filters.maxPrice)}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => onPriceChange(filters.minPrice, parseInt(e.target.value) || 0)}
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
              onChange={(e) => onFilterChange('rating', parseFloat(e.target.value))}
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
                <label
                  key={amenity.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={() => {
                      const newAmenities = filters.amenities.includes(amenity.id)
                        ? filters.amenities.filter(id => id !== amenity.id)
                        : [...filters.amenities, amenity.id]
                      onFilterChange('amenities', newAmenities)
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <amenity.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
