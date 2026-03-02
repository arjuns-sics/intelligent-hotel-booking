import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Building2,
    DollarSign,
    Calendar,
    Users,
    TrendingUp,
    TrendingDown,
    Bell,
    Search,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    Trash2,
    Plus,
    LogOut,
    User,
    Settings,
    Home,
    Star,
    Eye,
    Download,
    Filter,
    ChevronDown,
} from "lucide-react"

interface Booking {
    id: string
    guestName: string
    guestEmail: string
    roomType: string
    checkIn: string
    checkOut: string
    guests: number
    totalAmount: number
    status: "confirmed" | "pending" | "cancelled" | "checked-in" | "checked-out"
    date: string
}

interface Room {
    id: string
    name: string
    price: number
    status: "available" | "occupied" | "maintenance"
    guestName?: string
}

interface Review {
    id: string
    guestName: string
    rating: number
    comment: string
    date: string
    roomType: string
}

const DUMMY_BOOKINGS: Booking[] = [
    {
        id: "BK001",
        guestName: "Priya Sharma",
        guestEmail: "priya.sharma@email.com",
        roomType: "Deluxe Sea View Room",
        checkIn: "2026-03-05",
        checkOut: "2026-03-08",
        guests: 2,
        totalAmount: 37500,
        status: "confirmed",
        date: "2026-03-01",
    },
    {
        id: "BK002",
        guestName: "Rajesh Kumar",
        guestEmail: "rajesh.k@email.com",
        roomType: "Executive Suite",
        checkIn: "2026-03-02",
        checkOut: "2026-03-04",
        guests: 2,
        totalAmount: 44000,
        status: "checked-in",
        date: "2026-02-28",
    },
    {
        id: "BK003",
        guestName: "Ananya Desai",
        guestEmail: "ananya.d@email.com",
        roomType: "Royal Palace Suite",
        checkIn: "2026-03-10",
        checkOut: "2026-03-15",
        guests: 4,
        totalAmount: 225000,
        status: "pending",
        date: "2026-03-01",
    },
    {
        id: "BK004",
        guestName: "Michael Fernandes",
        guestEmail: "michael.f@email.com",
        roomType: "Deluxe Sea View Room",
        checkIn: "2026-02-25",
        checkOut: "2026-02-28",
        guests: 2,
        totalAmount: 37500,
        status: "checked-out",
        date: "2026-02-20",
    },
    {
        id: "BK005",
        guestName: "Sneha Patel",
        guestEmail: "sneha.p@email.com",
        roomType: "Executive Suite",
        checkIn: "2026-03-08",
        checkOut: "2026-03-10",
        guests: 3,
        totalAmount: 44000,
        status: "cancelled",
        date: "2026-03-01",
    },
]

const DUMMY_ROOMS: Room[] = [
    { id: "101", name: "Deluxe Sea View - 101", price: 12500, status: "occupied", guestName: "Rajesh Kumar" },
    { id: "102", name: "Deluxe Sea View - 102", price: 12500, status: "available" },
    { id: "103", name: "Deluxe Sea View - 103", price: 12500, status: "available" },
    { id: "201", name: "Executive Suite - 201", price: 22000, status: "occupied", guestName: "Priya Sharma" },
    { id: "202", name: "Executive Suite - 202", price: 22000, status: "available" },
    { id: "301", name: "Royal Palace Suite - 301", price: 45000, status: "maintenance" },
]

const DUMMY_REVIEWS: Review[] = [
    {
        id: "1",
        guestName: "Priya Sharma",
        rating: 5,
        comment: "Absolutely stunning property! The sea view was breathtaking and staff was extremely courteous.",
        date: "2026-02-28",
        roomType: "Deluxe Sea View Room",
    },
    {
        id: "2",
        guestName: "Rajesh Kumar",
        rating: 5,
        comment: "Perfect for business travel. Great WiFi and the executive lounge is excellent.",
        date: "2026-02-25",
        roomType: "Executive Suite",
    },
    {
        id: "3",
        guestName: "Ananya Desai",
        rating: 4,
        comment: "Beautiful heritage property. Spa treatments were divine. Minor wait at restaurant.",
        date: "2026-02-20",
        roomType: "Royal Palace Suite",
    },
]

const REVENUE_DATA = [
    { month: "Sep", revenue: 280000 },
    { month: "Oct", revenue: 320000 },
    { month: "Nov", revenue: 450000 },
    { month: "Dec", revenue: 680000 },
    { month: "Jan", revenue: 520000 },
    { month: "Feb", revenue: 590000 },
]

export function HotelOwnerDashboard() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState<Booking[]>(DUMMY_BOOKINGS)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const ownerData = JSON.parse(localStorage.getItem("hotelOwner") || "{}")
    const hotelData = JSON.parse(localStorage.getItem("hotelData") || "{}")

    const hotelName = hotelData.hotelName || ownerData.hotelName || "The Grand Palace Hotel"

    const stats = {
        totalRevenue: 2840000,
        revenueGrowth: 12.5,
        totalBookings: 156,
        bookingsGrowth: 8.3,
        occupancyRate: 78,
        occupancyGrowth: 5.2,
        averageRating: 4.8,
        totalReviews: 324,
    }

    const getStatusBadge = (status: Booking["status"]) => {
        const variants = {
            confirmed: "default",
            pending: "secondary",
            cancelled: "destructive",
            "checked-in": "outline",
            "checked-out": "secondary",
        }
        const icons = {
            confirmed: CheckCircle,
            pending: Clock,
            cancelled: XCircle,
            "checked-in": User,
            "checked-out": CheckCircle,
        }
        const Icon = icons[status]
        return (
            <Badge variant={variants[status]} className="gap-1">
                <Icon className="w-3 h-3" />
                {status.replace("-", " ").toUpperCase()}
            </Badge>
        )
    }

    const handleBookingAction = (bookingId: string, action: "approve" | "reject") => {
        setBookings((prev) =>
            prev.map((b) =>
                b.id === bookingId
                    ? { ...b, status: action === "approve" ? "confirmed" : "cancelled" }
                    : b
            )
        )
    }

    const handleLogout = () => {
        localStorage.removeItem("hotelOwner")
        navigate("/owner/login")
    }

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="font-semibold">{hotelName}</h1>
                                    <p className="text-xs text-muted-foreground">Partner Dashboard</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </Button>
                            <Separator orientation="vertical" className="h-8" />
                            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                                <Home className="w-4 h-4 mr-2" />
                                User View
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>+{stats.revenueGrowth}% from last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                                    <p className="text-2xl font-bold">{stats.totalBookings}</p>
                                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>+{stats.bookingsGrowth}% from last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
                                    <p className="text-2xl font-bold">{stats.occupancyRate}%</p>
                                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>+{stats.occupancyGrowth}% from last month</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Average Rating</p>
                                    <p className="text-2xl font-bold flex items-center gap-2">
                                        {stats.averageRating}
                                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                        <span>{stats.totalReviews} total reviews</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="bookings">Bookings</TabsTrigger>
                        <TabsTrigger value="rooms">Rooms</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Revenue Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Revenue Overview</CardTitle>
                                    <CardDescription>Last 6 months revenue trend</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-end justify-between gap-2">
                                        {REVENUE_DATA.map((data, index) => {
                                            const maxRevenue = Math.max(...REVENUE_DATA.map((d) => d.revenue))
                                            const height = (data.revenue / maxRevenue) * 100
                                            return (
                                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                                    <div
                                                        className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                    <div className="text-xs text-muted-foreground text-center">
                                                        <div className="font-medium">{data.month}</div>
                                                        <div className="text-[10px]">
                                                            ₹{(data.revenue / 1000).toFixed(0)}K
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Recent Activity</CardTitle>
                                    <CardDescription>Latest updates from your property</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[
                                            {
                                                icon: CheckCircle,
                                                title: "New Booking Confirmed",
                                                desc: "Priya Sharma booked Deluxe Sea View",
                                                time: "2 hours ago",
                                                color: "text-green-600",
                                            },
                                            {
                                                icon: Star,
                                                title: "New Review Received",
                                                desc: "5-star rating from Rajesh Kumar",
                                                time: "5 hours ago",
                                                color: "text-yellow-600",
                                            },
                                            {
                                                icon: Clock,
                                                title: "Pending Approval",
                                                desc: "Ananya Desai's booking request",
                                                time: "1 day ago",
                                                color: "text-orange-600",
                                            },
                                            {
                                                icon: Users,
                                                title: "Check-in Today",
                                                desc: "3 guests arriving today",
                                                time: "Today",
                                                color: "text-blue-600",
                                            },
                                        ].map((activity, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
                                                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{activity.title}</p>
                                                    <p className="text-xs text-muted-foreground">{activity.desc}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{activity.time}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { icon: Plus, label: "Add Booking", color: "bg-blue-500" },
                                        { icon: Edit, label: "Edit Rooms", color: "bg-green-500" },
                                        { icon: Download, label: "Export Report", color: "bg-purple-500" },
                                        { icon: Settings, label: "Settings", color: "bg-orange-500" },
                                    ].map((action, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-auto py-4 flex flex-col gap-2"
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                                                <action.icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-sm">{action.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Bookings Tab */}
                    <TabsContent value="bookings" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">All Bookings</CardTitle>
                                        <CardDescription>Manage your reservations</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input
                                                type="text"
                                                placeholder="Search bookings..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm w-64"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="pending">Pending</option>
                                            <option value="checked-in">Checked In</option>
                                            <option value="checked-out">Checked Out</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <Button size="sm">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Booking ID</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Guest</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Room</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Dates</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Guests</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredBookings.map((booking) => (
                                                    <tr
                                                        key={booking.id}
                                                        className="border-t hover:bg-muted/30"
                                                    >
                                                        <td className="px-4 py-3 text-sm font-medium">{booking.id}</td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <div className="text-sm font-medium">{booking.guestName}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {booking.guestEmail}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{booking.roomType}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="text-sm">
                                                                <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    to {new Date(booking.checkOut).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{booking.guests}</td>
                                                        <td className="px-4 py-3 text-sm font-medium">
                                                            {formatCurrency(booking.totalAmount)}
                                                        </td>
                                                        <td className="px-4 py-3">{getStatusBadge(booking.status)}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                {booking.status === "pending" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="default"
                                                                            onClick={() =>
                                                                                handleBookingAction(booking.id, "approve")
                                                                            }
                                                                        >
                                                                            <CheckCircle className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() =>
                                                                                handleBookingAction(booking.id, "reject")
                                                                            }
                                                                        >
                                                                            <XCircle className="w-4 h-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                <Button size="icon" variant="ghost">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Rooms Tab */}
                    <TabsContent value="rooms" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">Room Management</h3>
                                <p className="text-sm text-muted-foreground">
                                    Track and manage room availability
                                </p>
                            </div>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Room
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {DUMMY_ROOMS.map((room) => (
                                <Card key={room.id}>
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-medium">{room.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatCurrency(room.price)}/night
                                                </p>
                                            </div>
                                            <Badge
                                                variant={
                                                    room.status === "available"
                                                        ? "default"
                                                        : room.status === "occupied"
                                                        ? "secondary"
                                                        : "destructive"
                                                }
                                            >
                                                {room.status}
                                            </Badge>
                                        </div>
                                        {room.status === "occupied" && room.guestName && (
                                            <div className="text-sm text-muted-foreground mb-3">
                                                Guest: {room.guestName}
                                            </div>
                                        )}
                                        {room.status === "maintenance" && (
                                            <div className="text-sm text-muted-foreground mb-3">
                                                Under maintenance
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Edit className="w-3 h-3 mr-1" />
                                                Edit
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1">
                                                <Eye className="w-3 h-3 mr-1" />
                                                View
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Occupancy Summary */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-base">Occupancy Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 rounded-lg bg-green-50">
                                        <div className="text-2xl font-bold text-green-600">
                                            {DUMMY_ROOMS.filter((r) => r.status === "available").length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Available</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-blue-50">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {DUMMY_ROOMS.filter((r) => r.status === "occupied").length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Occupied</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-red-50">
                                        <div className="text-2xl font-bold text-red-600">
                                            {DUMMY_ROOMS.filter((r) => r.status === "maintenance").length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Maintenance</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Guest Reviews</h3>
                                <p className="text-sm text-muted-foreground">
                                    See what guests are saying
                                </p>
                            </div>
                            <Button variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Export Reviews
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-bold">{stats.averageRating}</div>
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${
                                                            i < Math.floor(stats.averageRating)
                                                                ? "fill-yellow-500 text-yellow-500"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Based on {stats.totalReviews} reviews
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const counts = { 5: 245, 4: 58, 3: 15, 2: 4, 1: 2 }
                                            const percentage = (counts[rating] / stats.totalReviews) * 100
                                            return (
                                                <div key={rating} className="flex items-center gap-2">
                                                    <div className="w-8 text-sm">{rating}</div>
                                                    <Star className="w-3 h-3" />
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary rounded-full"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="w-12 text-sm text-right text-muted-foreground">
                                                        {counts[rating]}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            {DUMMY_REVIEWS.map((review) => (
                                <Card key={review.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{review.guestName}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {review.roomType} • {new Date(review.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${
                                                            i < review.rating
                                                                ? "fill-yellow-500 text-yellow-500"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground">{review.comment}</p>
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" variant="outline">
                                                Reply
                                            </Button>
                                            <Button size="sm" variant="ghost">
                                                Report
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default HotelOwnerDashboard
