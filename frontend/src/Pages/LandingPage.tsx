import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  MapPin,
  Calendar,
  User,
  Star,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Headphones,
  Building2,
  Wifi,
  UtensilsCrossed,
  Car,
  Dumbbell,
} from "lucide-react"
import { AArrowUpIcon } from "@/components/ui/a-arrow-up"

const hotels = [
  {
    id: 1,
    name: "The Grand Azure",
    location: "Maldives",
    price: 8500,
    rating: 4.9,
    reviews: 284,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    features: ["Beachfront", "Infinity Pool", "Spa"],
  },
  {
    id: 2,
    name: "Urban Heights Tower",
    location: "New York City",
    price: 15200,
    rating: 4.7,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    features: ["City View", "Gym", "Restaurant"],
  },
  {
    id: 3,
    name: "Serenity Resort",
    location: "Bali, Indonesia",
    price: 7800,
    rating: 4.8,
    reviews: 398,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    features: ["Villa", "Pool", "Yoga"],
  },
  {
    id: 4,
    name: "Alpine Lodge",
    location: "Swiss Alps",
    price: 6200,
    rating: 4.9,
    reviews: 176,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
    features: ["Mountain View", "Ski", "Fireplace"],
  },
]

const features = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find perfect hotels with AI-powered recommendations based on your preferences and travel history.",
  },
  {
    icon: Clock,
    title: "Real-Time Availability",
    description: "See live room availability and instant booking confirmation across all partner hotels.",
  },
  {
    icon: Shield,
    title: "Secure Booking",
    description: "Protected payments and verified reviews ensure your booking experience is safe and reliable.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support to assist you with any queries before, during, or after your stay.",
  },
]

const amenities = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: UtensilsCrossed, label: "Restaurant" },
  { icon: Car, label: "Valet Parking" },
  { icon: Headphones, label: "Spa & Wellness" },
  { icon: Dumbbell, label: "Fitness Center" },
  { icon: Star, label: "Concierge" },
]

export function LandingPage() {
  const navigate = useNavigate()
  const [searchLocation, setSearchLocation] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState("2")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchLocation) params.set('location', searchLocation)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)
    navigate(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Intelligent Hotel</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#hotels" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Hotels</a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#amenities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Amenities</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"> Reviews</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/owner/login">List Your Property</Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-primary/10" />
          <div className="absolute top-1/4 right-1/4 w-150 h-150 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-100 h-100 rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
            ✨ Smart Hotel Booking Reimagined
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Discover Your Next
            <span className="block text-primary">Perfect Stay</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            Experience intelligent hotel search with real-time availability, 
            smart recommendations, and seamless booking. Your ideal vacation is just a click away.
          </p>

          {/* Search Box */}
          <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl shadow-primary/5 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </label>
                <Input 
                  placeholder="Where are you going?" 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Check In
                </label>
                <Input 
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Check Out
                </label>
                <Input 
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Guests
                </label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5+">5+ Guests</option>
                </select>
              </div>
            </div>
            <Button size="lg" className="w-full mt-4 h-12 text-base" onClick={handleSearch}>
              <Search className="w-5 h-5 mr-2" />
              Search Hotels
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Partner Hotels</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Destinations</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <AArrowUpIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Smart Booking Made Simple
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our intelligent system learns your preferences to deliver personalized hotel recommendations that perfectly match your travel style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg shadow-primary/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hotels Section */}
      <section id="hotels" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <Badge variant="outline" className="mb-4">Featured Hotels</Badge>
              <h2 className="text-4xl font-bold tracking-tight">
                Popular Destinations
              </h2>
            </div>
            <Button variant="outline" className="group">
              View All Hotels
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <Card key={hotel.id} className="border-none shadow-lg shadow-primary/5 overflow-hidden group cursor-pointer">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-background/90 backdrop-blur-sm text-foreground hover:bg-background/90">
                      <Star className="w-3 h-3 mr-1 fill-primary text-primary" />
                      {hotel.rating}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-lg leading-tight">{hotel.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {hotel.location}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {hotel.features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">₹{hotel.price}</span>
                      <span className="text-sm text-muted-foreground">/night</span>
                    </div>
                    <Button size="sm">Book Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="amenities" className="py-24 bg-primary/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Badge variant="outline" className="mb-4">Comfort Guaranteed</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Amenities You'll Love
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Every partner hotel is equipped with premium amenities to ensure your stay is nothing short of exceptional.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenities.map((amenity, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <amenity.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Loved by Travelers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Mitchell",
                role: "Frequent Traveler",
                avatar: "SM",
                text: "The smart recommendations are spot on! Found an amazing boutique hotel that perfectly matched my preferences. Will definitely use again.",
              },
              {
                name: "James Chen",
                role: "Business Traveler",
                avatar: "JC",
                text: "Real-time availability is a game-changer. No more booking frustration. The whole process is smooth and reliable.",
              },
              {
                name: "Emma Rodriguez",
                role: "Travel Blogger",
                avatar: "ER",
                text: "As someone who travels constantly, this platform has made finding quality accommodations so much easier. Highly recommended!",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-none shadow-lg shadow-primary/5">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Find Your Perfect Stay?
          </h2>
          <p className="text-xl opacity-90 mb-8 leading-relaxed">
            Join thousands of travelers who have discovered their ideal hotels through our intelligent booking system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-primary" asChild>
              <Link to="/register">
                Start Searching
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/register">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partner CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-6">
          <Card className="border-none shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge variant="outline" className="mb-4 w-fit">For Hotel Owners</Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Partner With Us
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  List your property and reach thousands of travelers. Manage bookings, update availability in real-time, and grow your business with our powerful dashboard.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Zero commission on bookings",
                    "Real-time booking management",
                    "Detailed analytics & insights",
                    "24/7 partner support",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button size="lg" asChild>
                  <Link to="/owner/register">
                    List Your Property
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="relative h-64 md:h-auto bg-primary/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="w-32 h-32 text-primary/20" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Intelligent Hotel</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Smart hotel booking powered by AI. Find your perfect stay with intelligent recommendations and seamless booking.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Partner Hotels</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cancellation Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 Intelligent Hotel. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Secure Payments by Stripe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
