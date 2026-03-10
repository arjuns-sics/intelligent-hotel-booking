import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
    Bell,
    Search,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    Edit,
    Plus,
    LogOut,
    User,
    Home,
    Star,
    Eye,
    Download,
    Filter,
    Trash2,
    Loader2,
} from "lucide-react"
import { type Room, bookingApi, reviewApi, activityApi, exportApi } from "@/lib/api"
import { useRooms } from "@/hooks/useRooms"
import { AddRoomDialog } from "@/components/AddRoomDialog"
import { EditRoomDialog } from "@/components/EditRoomDialog"
import { ViewRoomDialog } from "@/components/ViewRoomDialog"
import { DeleteRoomDialog } from "@/components/DeleteRoomDialog"
import { toast } from "sonner"

interface Booking {
    id: string
    bookingId: string
    guestName: string
    guestEmail: string
    guestPhone?: string
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
    hotelName: string
    hotelImage: string
    specialRequests?: string
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
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [activeTab, setActiveTab] = useState("overview")

    // Room dialog states
    const [addRoomOpen, setAddRoomOpen] = useState(false)
    const [editRoomOpen, setEditRoomOpen] = useState(false)
    const [viewRoomOpen, setViewRoomOpen] = useState(false)
    const [deleteRoomOpen, setDeleteRoomOpen] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    const ownerData = JSON.parse(localStorage.getItem("hotelOwner") || "{}")
    const hotelData = JSON.parse(localStorage.getItem("hotelData") || "{}")

    const hotelName = hotelData.hotelName || ownerData.hotelName || "The Grand Palace Hotel"

    // Fetch rooms from backend using TanStack Query
    const { data: rooms = [], isLoading: roomsLoading } = useRooms()

    // Fetch bookings from backend
    const { data: bookingsData, isLoading: bookingsLoading, refetch } = useQuery({
        queryKey: ['owner-bookings-dashboard', statusFilter],
        queryFn: async () => {
            const response = await bookingApi.getOwnerBookings(statusFilter === "all" ? undefined : statusFilter)
            return response.data
        },
        retry: false,
    })

    // Fetch booking stats
    const { data: statsData, error: statsError } = useQuery({
        queryKey: ['owner-booking-stats-dashboard'],
        queryFn: async () => {
            const response = await bookingApi.getBookingStats()
            return response.data
        },
        retry: false,
    })

    console.log('[Dashboard] statsError:', statsError)

    // Fetch hotel reviews
    const { data: reviewsData, refetch: refetchReviews } = useQuery({
        queryKey: ['owner-reviews-dashboard'],
        queryFn: async () => {
            const response = await reviewApi.getOwnerReviews()
            return response.data
        },
        retry: false,
        onSuccess: () => {
            // Invalidate stats query to get updated review count
            queryClient.invalidateQueries({ queryKey: ['owner-booking-stats-dashboard'] })
        },
    })

    // Fetch recent activities
    const { data: activitiesData } = useQuery({
        queryKey: ['owner-activities-dashboard'],
        queryFn: async () => {
            const response = await activityApi.getActivities(20, 0)
            return response.data
        },
        retry: false,
    })

    const bookings = bookingsData?.bookings || []
    const stats = statsData || {}  // Stats is already at the top level, not nested
    const reviews = reviewsData?.reviews || []
    const activities = activitiesData?.data?.activities || []

    // Debug logging
    console.log('[Dashboard] statsData:', statsData)
    console.log('[Dashboard] stats:', stats)

    // Calculate review stats from actual reviews as fallback
    const reviewStats = {
        averageRating: reviews.length > 0 
            ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '0',
        totalReviews: reviews.length,
    }

    // Update booking status mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
            const response = await bookingApi.updateBookingStatus(bookingId, status)
            return response.data
        },
        onSuccess: () => {
            toast.success('Booking status updated successfully')
            refetch()
            queryClient.invalidateQueries({ queryKey: ['owner-booking-stats-dashboard'] })
        },
        onError: (error: any) => {
            toast.error('Failed to update booking status', {
                description: error.response?.data?.message || 'Please try again.',
            })
        },
    })

    const getStatusBadge = (status: Booking["status"]) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
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

    const handleBookingAction = (bookingId: string, action: "approve" | "reject" | "check-in" | "check-out") => {
        let newStatus: string = ""
        if (action === "approve") newStatus = "confirmed"
        else if (action === "reject") newStatus = "cancelled"
        else if (action === "check-in") newStatus = "checked-in"
        else if (action === "check-out") newStatus = "checked-out"
        
        updateStatusMutation.mutate({ bookingId, status: newStatus })
    }

    const handleLogout = () => {
        localStorage.removeItem("hotelOwner")
        localStorage.removeItem("hotelOwnerToken")
        navigate("/owner/login")
    }

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.guestName.toLowerCase().includes(searchQuery.toLowerCase())
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

    // Calculate dynamic stats from API data
    const dashboardStats = {
        totalRevenue: stats.totalRevenue || 0,
        totalBookings: stats.total || 0,
        occupancyRate: stats.occupancyRate || 0,
        revenueGrowth: stats.revenueGrowth || 0,
        bookingsGrowth: stats.bookingsGrowth || 0,
        averageRating: stats.averageRating || 0,
        totalReviews: stats.totalReviews || 0,
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
                         
                            <Separator orientation="vertical" className="h-8" />
                            <Button variant="ghost" size="sm" onClick={() => navigate("/owner/bookings")}>
                                <Calendar className="w-4 h-4 mr-2" />
                                Bookings
                            </Button>
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
                                    <p className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</p>
                                    <div className="flex items-center gap-1 mt-2 text-sm">
                                        <TrendingUp className={`w-4 h-4 ${dashboardStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                        <span className={dashboardStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {dashboardStats.revenueGrowth >= 0 ? '+' : ''}{dashboardStats.revenueGrowth}% vs last month
                                        </span>
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
                                    <p className="text-2xl font-bold">{dashboardStats.totalBookings}</p>
                                    <div className="flex items-center gap-1 mt-2 text-sm">
                                        <TrendingUp className={`w-4 h-4 ${dashboardStats.bookingsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                                        <span className={dashboardStats.bookingsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {dashboardStats.bookingsGrowth >= 0 ? '+' : ''}{dashboardStats.bookingsGrowth}% vs last month
                                        </span>
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
                                    <p className="text-2xl font-bold">{dashboardStats.occupancyRate}%</p>
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
                                        {reviewStats.averageRating}
                                        <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                    </p>
                                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                        <span>{reviewStats.totalReviews} total reviews</span>
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
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                                        {activities.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No recent activity</p>
                                            </div>
                                        ) : (
                                            activities.slice(0, 5).map((activity: any, index: number) => {
                                                const getActivityIcon = (action: string) => {
                                                    const iconMap: Record<string, any> = {
                                                        'booking_created': Calendar,
                                                        'booking_confirmed': CheckCircle,
                                                        'booking_cancelled': XCircle,
                                                        'booking_checked_in': User,
                                                        'booking_checked_out': LogOut,
                                                        'review_created': Star,
                                                        'review_deleted': Trash2,
                                                    }
                                                    return iconMap[action] || Clock
                                                }
                                                const getActivityColor = (action: string) => {
                                                    const colorMap: Record<string, string> = {
                                                        'booking_created': 'text-blue-600',
                                                        'booking_confirmed': 'text-green-600',
                                                        'booking_cancelled': 'text-red-600',
                                                        'booking_checked_in': 'text-purple-600',
                                                        'booking_checked_out': 'text-gray-600',
                                                        'review_created': 'text-yellow-600',
                                                        'review_deleted': 'text-orange-600',
                                                    }
                                                    return colorMap[action] || 'text-muted-foreground'
                                                }
                                                const getActivityDescription = (activity: any) => {
                                                    const descriptions: Record<string, string> = {
                                                        'booking_created': `New booking: ${activity.metadata?.hotelName || 'Hotel'}`,
                                                        'booking_confirmed': `Booking confirmed for ${activity.metadata?.guestName || 'guest'}`,
                                                        'booking_cancelled': 'Booking was cancelled',
                                                        'booking_checked_in': 'Guest checked in',
                                                        'booking_checked_out': 'Guest checked out',
                                                        'review_created': `${activity.metadata?.rating || 'New'}-star review received`,
                                                        'review_deleted': 'Review was deleted',
                                                    }
                                                    return descriptions[activity.action] || activity.description
                                                }
                                                const Icon = getActivityIcon(activity.action)
                                                const color = getActivityColor(activity.action)
                                                return (
                                                    <div key={index} className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
                                                            <Icon className={`w-4 h-4 ${color}`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{getActivityDescription(activity)}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(activity.date).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
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
                                        { icon: Plus, label: "Add Booking", color: "bg-blue-500", onClick: () => {} },
                                        { icon: Edit, label: "Edit Rooms", color: "bg-green-500", onClick: () => { setActiveTab("rooms"); setAddRoomOpen(true); } },
                                        { icon: Download, label: "Export Report", color: "bg-purple-500", onClick: () => exportApi.downloadReportCSV() },
                                   
                                    ].map((action, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-auto py-4 flex flex-col gap-2 cursor-pointer"
                                            onClick={action.onClick}
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
                        {/* Booking Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total</p>
                                            <p className="text-2xl font-bold">{stats.total || 0}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Confirmed</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {stats.confirmed || 0}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pending</p>
                                            <p className="text-2xl font-bold text-orange-600">
                                                {stats.pending || 0}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-orange-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Checked In</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {stats.checkedIn || 0}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Checked Out</p>
                                            <p className="text-2xl font-bold text-gray-600">
                                                {stats.checkedOut || 0}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <LogOut className="w-5 h-5 text-gray-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

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
                                        <Button size="sm" variant="outline" onClick={() => exportApi.downloadBookingsCSV(statusFilter !== 'all' ? statusFilter : undefined)}>
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                        <Button size="sm">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {bookingsLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                        <p className="text-muted-foreground">Loading bookings...</p>
                                    </div>
                                ) : filteredBookings.length > 0 ? (
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
                                                            <td className="px-4 py-3 text-sm font-medium">{booking.bookingId}</td>
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
                                                                            title="Approve Booking"
                                                                        >
                                                                            <CheckCircle className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() =>
                                                                                handleBookingAction(booking.id, "reject")
                                                                            }
                                                                            title="Reject Booking"
                                                                        >
                                                                            <XCircle className="w-4 h-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {booking.status === "confirmed" && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        onClick={() =>
                                                                            handleBookingAction(booking.id, "check-in")
                                                                        }
                                                                        title="Check In Guest"
                                                                    >
                                                                        <User className="w-4 h-4 mr-1" />
                                                                        Check In
                                                                    </Button>
                                                                )}
                                                                {booking.status === "checked-in" && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            handleBookingAction(booking.id, "check-out")
                                                                        }
                                                                        title="Check Out Guest"
                                                                    >
                                                                        <LogOut className="w-4 h-4 mr-1" />
                                                                        Check Out
                                                                    </Button>
                                                                )}
                                                                {(booking.status === "cancelled" || booking.status === "checked-out") && (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        No actions available
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                                        <p className="text-muted-foreground">
                                            {searchQuery ? "Try adjusting your search" : "No bookings yet"}
                                        </p>
                                    </div>
                                )}
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
                            <Button onClick={() => setAddRoomOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Room
                            </Button>
                        </div>

                        {roomsLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-muted-foreground">Loading rooms...</p>
                                </div>
                            </div>
                        ) : rooms.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center py-12">
                                        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Add your first room to start managing availability
                                        </p>
                                        <Button onClick={() => setAddRoomOpen(true)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Room
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {rooms.map((room) => (
                                    <Card key={room.id}>
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{room.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatCurrency(room.price)}/night
                                                    </p>
                                                    {room.description && (
                                                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                                            {room.description}
                                                        </p>
                                                    )}
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
                                            <div className="space-y-1 mb-3">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Users className="w-3 h-3" />
                                                    <span>Max {room.maxGuests} guests</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Home className="w-3 h-3" />
                                                    <span>{room.beds}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Building2 className="w-3 h-3" />
                                                    <span>{room.size}</span>
                                                </div>
                                            </div>
                                            {room.amenities && room.amenities.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {amenity}
                                                        </Badge>
                                                    ))}
                                                    {room.amenities.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{room.amenities.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setSelectedRoom(room)
                                                        setEditRoomOpen(true)
                                                    }}
                                                >
                                                    <Edit className="w-3 h-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => {
                                                        setSelectedRoom(room)
                                                        setViewRoomOpen(true)
                                                    }}
                                                >
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        setSelectedRoom(room)
                                                        setDeleteRoomOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Occupancy Summary */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="text-base">Occupancy Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 rounded-lg bg-green-50">
                                        <div className="text-2xl font-bold text-green-600">
                                            {roomsLoading ? "-" : rooms.filter((r) => r.status === "available").length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Available</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-blue-50">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {roomsLoading ? "-" : rooms.filter((r) => r.status === "occupied").length}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Occupied</div>
                                    </div>
                                    <div className="text-center p-4 rounded-lg bg-red-50">
                                        <div className="text-2xl font-bold text-red-600">
                                            {roomsLoading ? "-" : rooms.filter((r) => r.status === "maintenance").length}
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
                            <Button variant="outline" onClick={() => exportApi.downloadReviewsCSV()}>
                                <Download className="w-4 h-4 mr-2" />
                                Export Reviews
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-bold">{reviewStats.averageRating}</div>
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${
                                                            i < Math.floor(Number(reviewStats.averageRating) || 0)
                                                                ? "fill-yellow-500 text-yellow-500"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Based on {reviewStats.totalReviews} reviews
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        {[5, 4, 3, 2, 1].map((rating) => {
                                            const count = reviews.filter((r: any) => r.rating === rating).length
                                            const total = reviewStats.totalReviews || 1
                                            const percentage = total > 0 ? (count / total) * 100 : 0
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
                                                        {count}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            {reviews.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No reviews yet</p>
                                    <p className="text-sm">Reviews will appear here once guests start leaving feedback</p>
                                </div>
                            ) : (
                                reviews.map((review: any) => (
                                    <Card key={review.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{review.user?.name || 'Anonymous'}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(review.date).toLocaleDateString()}
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
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex gap-2 mt-4">
                                                    {review.images.map((img: string, idx: number) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`Review image ${idx + 1}`}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                    ))}
                                                </div>
                                            )}
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
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Room Management Dialogs */}
                <AddRoomDialog open={addRoomOpen} onOpenChange={setAddRoomOpen} />
                <EditRoomDialog
                    open={editRoomOpen}
                    onOpenChange={setEditRoomOpen}
                    room={selectedRoom}
                />
                <ViewRoomDialog
                    open={viewRoomOpen}
                    onOpenChange={setViewRoomOpen}
                    room={selectedRoom}
                />
                <DeleteRoomDialog
                    open={deleteRoomOpen}
                    onOpenChange={setDeleteRoomOpen}
                    roomId={selectedRoom?.id || null}
                    roomName={selectedRoom?.name || ""}
                />
            </div>
        </div>
    )
}

export default HotelOwnerDashboard
