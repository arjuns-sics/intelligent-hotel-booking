import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Calendar,
    MapPin,
    Star,
    Clock,
    Building2,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowLeft,
    Search,
    // Filter,
    Trash2,
    // Edit,
    Plus,
    // Home,
    LogOut,
    Send,
    Image,
    Loader2,
} from "lucide-react"
import { bookingApi } from "@/lib/api"
import { toast } from "sonner"

interface Booking {
    id: string
    hotelName: string
    hotelImage: string
    location: string
    roomType: string
    checkIn: string
    checkOut: string
    guests: number
    totalAmount: number
    status: "upcoming" | "completed" | "cancelled" | "checked-in"
    bookingDate: string
    hotelId: string
}

interface Review {
    id: string
    bookingId: string
    hotelName: string
    hotelId: string
    rating: number
    comment: string
    date: string
    images?: string[]
}

const DUMMY_BOOKINGS: Booking[] = [
    {
        id: "BK001",
        hotelName: "The Grand Palace Hotel",
        hotelImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        location: "Mumbai, Maharashtra",
        roomType: "Deluxe Sea View Room",
        checkIn: "2026-03-15",
        checkOut: "2026-03-18",
        guests: 2,
        totalAmount: 37500,
        status: "upcoming",
        bookingDate: "2026-03-01",
        hotelId: "1",
    },
    {
        id: "BK002",
        hotelName: "Ocean View Resort",
        hotelImage: "https://images.unsplash.com/photo-1570206986634-afd7cccb68d3?q=80&w=1170",
        location: "Goa, India",
        roomType: "Ocean View Suite",
        checkIn: "2026-02-20",
        checkOut: "2026-02-25",
        guests: 3,
        totalAmount: 72500,
        status: "completed",
        bookingDate: "2026-02-10",
        hotelId: "2",
    },
    {
        id: "BK003",
        hotelName: "Mountain Retreat Spa",
        hotelImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
        location: "Manali, Himachal Pradesh",
        roomType: "Forest Cottage",
        checkIn: "2026-04-10",
        checkOut: "2026-04-15",
        guests: 2,
        totalAmount: 52500,
        status: "upcoming",
        bookingDate: "2026-03-02",
        hotelId: "3",
    },
    {
        id: "BK004",
        hotelName: "Royal Heritage Hotel",
        hotelImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
        location: "Jaipur, Rajasthan",
        roomType: "Heritage Room",
        checkIn: "2026-01-15",
        checkOut: "2026-01-18",
        guests: 2,
        totalAmount: 45000,
        status: "completed",
        bookingDate: "2026-01-05",
        hotelId: "4",
    },
    {
        id: "BK005",
        hotelName: "City Center Business Hotel",
        hotelImage: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
        location: "Bangalore, Karnataka",
        roomType: "Business Class Room",
        checkIn: "2026-02-10",
        checkOut: "2026-02-12",
        guests: 1,
        totalAmount: 17000,
        status: "cancelled",
        bookingDate: "2026-02-01",
        hotelId: "5",
    },
]

const DUMMY_REVIEWS: Review[] = [
    {
        id: "1",
        bookingId: "BK002",
        hotelName: "Ocean View Resort",
        hotelId: "2",
        rating: 5,
        comment: "Amazing beachfront property! The staff was incredibly friendly and the food was delicious. The infinity pool overlooking the sea was the highlight of our stay.",
        date: "2026-02-26",
        images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80"],
    },
    {
        id: "2",
        bookingId: "BK004",
        hotelName: "Royal Heritage Hotel",
        hotelId: "4",
        rating: 4,
        comment: "Beautiful heritage property with stunning architecture. The cultural performances in the evening were mesmerizing. Room service could be faster though.",
        date: "2026-01-19",
    },
]

export function UserBookingsPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null)
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        comment: "",
    })
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)

    // Fetch bookings from API
    const { data: bookingsData, isLoading, refetch } = useQuery({
        queryKey: ['bookings', statusFilter],
        queryFn: async () => {
            const response = await bookingApi.getUserBookings(statusFilter === "all" ? undefined : statusFilter)
            return response.data
        },
        retry: false,
    })

    const bookings = bookingsData?.bookings || []

    // Use dummy reviews for now (can be implemented later)
    const [reviews, setReviews] = useState<Review[]>(DUMMY_REVIEWS)

    // Mutation for cancelling booking
    const cancelBookingMutation = useMutation({
        mutationFn: async (bookingId: string) => {
            const response = await bookingApi.cancelBooking(bookingId)
            return response.data
        },
        onSuccess: () => {
            toast.success('Booking cancelled successfully')
            refetch()
        },
        onError: (error: any) => {
            toast.error('Failed to cancel booking', {
                description: error.response?.data?.message || 'Please try again.',
            })
        },
    })

    // const userData = JSON.parse(localStorage.getItem("user") || "{}")

    const stats = {
        upcoming: bookings.filter((b) => b.status === "confirmed" || b.status === "checked-in" || b.status === "pending").length,
        completed: bookings.filter((b) => b.status === "checked-out").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
        totalSpent: bookings
            .filter((b) => b.status === "checked-out" || b.status === "checked-in" || b.status === "confirmed" || b.status === "pending")
            .reduce((sum, b) => sum + b.totalAmount, 0),
    }

    const getStatusBadge = (status: Booking["status"]) => {
        const statusMap: Record<Booking["status"], "upcoming" | "completed" | "cancelled" | "checked-in"> = {
            pending: "upcoming",
            confirmed: "upcoming",
            "checked-in": "checked-in",
            "checked-out": "completed",
            cancelled: "cancelled",
        }
        const mappedStatus = statusMap[status] || "upcoming"
        
        const variants: Record<string, "link" | "default" | "outline" | "secondary" | "ghost" | "destructive" | null | undefined> = {
            upcoming: "default",
            completed: "secondary",
            cancelled: "destructive",
            "checked-in": "outline",
        }
        const icons = {
            upcoming: Calendar,
            completed: CheckCircle,
            cancelled: XCircle,
            "checked-in": Clock,
        }
        const Icon = icons[mappedStatus]
        return (
            <Badge variant={variants[mappedStatus]} className="gap-1">
                <Icon className="w-3 h-3" />
                {status.replace("-", " ").toUpperCase()}
            </Badge>
        )
    }

    const handleCancelBooking = (bookingId: string) => {
        cancelBookingMutation.mutate(bookingId)
    }

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking)
        setShowDetailsDialog(true)
    }

    const handleWriteReview = (booking: Booking) => {
        setSelectedBookingForReview(booking)
        setShowReviewModal(true)
    }

    const handleSubmitReview = () => {
        if (!selectedBookingForReview || !reviewForm.comment.trim()) return

        const newReview: Review = {
            id: `review-${Date.now()}`,
            bookingId: selectedBookingForReview.id,
            hotelName: selectedBookingForReview.hotelName,
            hotelId: selectedBookingForReview.hotelId,
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            date: new Date().toISOString().split("T")[0],
        }

        setReviews((prev) => [newReview, ...prev])
        setShowReviewModal(false)
        setReviewForm({ rating: 5, comment: "" })
        setSelectedBookingForReview(null)
    }

    const handleDeleteReview = (reviewId: string) => {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId))
    }

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/login")
    }

    const hasReviewed = (bookingId: string) => {
        return reviews.some((r) => r.bookingId === bookingId)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Search
                            </Button>
                        </div>
                            <Button variant="outline" size="sm" onClick={handleLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
                    <p className="text-muted-foreground">Manage your reservations and reviews</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                                    <p className="text-2xl font-bold">{stats.upcoming}</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                                    <p className="text-2xl font-bold">{stats.completed}</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Cancelled</p>
                                    <p className="text-2xl font-bold">{stats.cancelled}</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="bookings" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                        <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                        <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                        <TabsTrigger value="write-review">Write Review</TabsTrigger>
                    </TabsList>

                    {/* Bookings Tab */}
                    <TabsContent value="bookings" className="space-y-4">
                        <Card className="py-6!">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">All Reservations</CardTitle>
                                        <CardDescription>View and manage your hotel bookings</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search bookings..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="checked-in">Checked In</option>
                                            <option value="checked-out">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        {/* <Button size="sm">
                                            <Filter className="w-4 h-4 mr-2" />
                                            Filter
                                        </Button> */}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                        <p className="text-muted-foreground">Loading your bookings...</p>
                                    </div>
                                ) : filteredBookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {filteredBookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex gap-4">
                                                    {/* Hotel Image */}
                                                    <div
                                                        className="w-32 h-32 rounded-lg overflow-hidden cursor-pointer shrink-0"
                                                        onClick={() => navigate(`/hotel/${booking.hotelId}`)}
                                                    >
                                                        <img
                                                            src={booking.hotelImage}
                                                            alt={booking.hotelName}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                        />
                                                    </div>

                                                    {/* Booking Details */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3
                                                                    className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                                                                    onClick={() => navigate(`/hotel/${booking.hotelId}`)}
                                                                >
                                                                    {booking.hotelName}
                                                                </h3>
                                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {booking.location}
                                                                </div>
                                                            </div>
                                                            {getStatusBadge(booking.status)}
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                                <div>
                                                                    <span className="text-muted-foreground">Check-in: </span>
                                                                    <span className="font-medium">{formatDate(booking.checkIn)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                                <div>
                                                                    <span className="text-muted-foreground">Check-out: </span>
                                                                    <span className="font-medium">{formatDate(booking.checkOut)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                                <span>{booking.roomType}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                                <span>{booking.guests} guest(s)</span>
                                                            </div>
                                                        </div>

                                                        <Separator className="my-3" />

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <span className="text-sm text-muted-foreground">Total Amount: </span>
                                                                <span className="text-lg font-bold text-primary">
                                                                    {formatCurrency(booking.totalAmount)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewDetails(booking)}
                                                                >
                                                                    View Details
                                                                </Button>
                                                                {(booking.status === "confirmed" || booking.status === "pending" || booking.status === "checked-in") && (
                                                                    <>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => navigate(`/hotel/${booking.hotelId}`)}
                                                                        >
                                                                            View Hotel
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleCancelBooking(booking.id)}
                                                                        >
                                                                            <XCircle className="w-4 h-4 mr-2" />
                                                                            Cancel
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {booking.status === "checked-out" && !hasReviewed(booking.id) && (
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        onClick={() => handleWriteReview(booking)}
                                                                    >
                                                                        <Star className="w-4 h-4 mr-2" />
                                                                        Write Review
                                                                    </Button>
                                                                )}
                                                                {booking.status === "checked-out" && hasReviewed(booking.id) && (
                                                                    <Badge variant="secondary" className="gap-1">
                                                                        <CheckCircle className="w-3 h-3" />
                                                                        Reviewed
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                                        <p className="text-muted-foreground mb-6">
                                            {searchQuery || statusFilter !== "all"
                                                ? "Try adjusting your search or filters"
                                                : "Start by booking your first hotel stay"}
                                        </p>
                                        {!searchQuery && statusFilter === "all" && (
                                            <Button onClick={() => navigate("/dashboard")}>
                                                <Search className="w-4 h-4 mr-2" />
                                                Browse Hotels
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">My Reviews</CardTitle>
                                <CardDescription>Reviews you've written for completed stays</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="border rounded-lg p-4">
                                                <div className="flex gap-4">
                                                    <div className="shrink-0">
                                                        <div
                                                            className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer"
                                                            onClick={() => navigate(`/hotel/${review.hotelId}`)}
                                                        >
                                                            <img
                                                                src={DUMMY_BOOKINGS.find((b) => b.id === review.bookingId)?.hotelImage}
                                                                alt={review.hotelName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3
                                                                    className="font-semibold cursor-pointer hover:text-primary transition-colors"
                                                                    onClick={() => navigate(`/hotel/${review.hotelId}`)}
                                                                >
                                                                    {review.hotelName}
                                                                </h3>
                                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                    <Calendar className="w-3 h-3" />
                                                                    Reviewed on {formatDate(review.date)}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
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
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteReview(review.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="text-muted-foreground text-sm">{review.comment}</p>
                                                        {review.images && review.images.length > 0 && (
                                                            <div className="flex gap-2 mt-3">
                                                                {review.images.map((img, i) => (
                                                                    <img
                                                                        key={i}
                                                                        src={img}
                                                                        alt="Review"
                                                                        className="w-16 h-16 rounded object-cover"
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Share your experiences from completed stays
                                        </p>
                                        <Button onClick={() => navigate("/bookings?tab=write-review")}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Write Your First Review
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Write Review Tab */}
                    <TabsContent value="write-review" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Write a Review</CardTitle>
                                <CardDescription>Share your experience with other travelers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {bookings.filter((b) => b.status === "completed" && !hasReviewed(b.id)).length > 0 ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Select a completed stay to write a review:
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {bookings
                                                .filter((b) => b.status === "completed" && !hasReviewed(b.id))
                                                .map((booking) => (
                                                    <div
                                                        key={booking.id}
                                                        className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                                                        onClick={() => handleWriteReview(booking)}
                                                    >
                                                        <div className="flex gap-3">
                                                            <img
                                                                src={booking.hotelImage}
                                                                alt={booking.hotelName}
                                                                className="w-16 h-16 rounded object-cover shrink-0"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium truncate">{booking.hotelName}</h4>
                                                                <p className="text-sm text-muted-foreground truncate">
                                                                    {booking.roomType}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Stayed: {formatDate(booking.checkIn)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">No eligible stays</h3>
                                        <p className="text-muted-foreground">
                                            You can write reviews for completed hotel stays
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedBookingForReview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Write a Review</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowReviewModal(false)}
                                >
                                    <XCircle className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="flex gap-4 mb-6">
                                <img
                                    src={selectedBookingForReview.hotelImage}
                                    alt={selectedBookingForReview.hotelName}
                                    className="w-24 h-24 rounded-lg object-cover shrink-0"
                                />
                                <div>
                                    <h3 className="font-semibold">{selectedBookingForReview.hotelName}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedBookingForReview.roomType}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Stayed: {formatDate(selectedBookingForReview.checkIn)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label>Rating</Label>
                                    <div className="flex gap-2 mt-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${
                                                        star <= reviewForm.rating
                                                            ? "fill-yellow-500 text-yellow-500"
                                                            : "text-muted-foreground"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="review-comment">Your Review</Label>
                                    <Textarea
                                        id="review-comment"
                                        placeholder="Share your experience with other travelers..."
                                        value={reviewForm.comment}
                                        onChange={(e) =>
                                            setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                                        }
                                        className="mt-2 min-h-30"
                                    />
                                </div>

                                <div>
                                    <Label>Add Photos (Optional)</Label>
                                    <div className="border-2 border-dashed border-input rounded-lg p-6 text-center mt-2">
                                        <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            PNG, JPG up to 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowReviewModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleSubmitReview}
                                    disabled={!reviewForm.comment.trim()}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Review
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Details Dialog */}
            {showDetailsDialog && selectedBooking && (
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <span>{selectedBooking.bookingId}</span>
                                <Badge variant={
                                    selectedBooking.status === "cancelled" ? "destructive" :
                                    selectedBooking.status === "checked-out" ? "secondary" :
                                    "default"
                                }>
                                    {selectedBooking.status.toUpperCase()}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription>
                                Booking details and information
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Hotel Information */}
                            <div className="flex gap-4">
                                <img
                                    src={selectedBooking.hotelImage}
                                    alt={selectedBooking.hotelName}
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedBooking.hotelName}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <MapPin className="w-4 h-4" />
                                        {selectedBooking.location}
                                    </div>
                                    <p className="text-sm mt-2">{selectedBooking.roomType}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Booking Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Check-in</span>
                                    <p className="font-medium">{formatDate(selectedBooking.checkIn)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Check-out</span>
                                    <p className="font-medium">{formatDate(selectedBooking.checkOut)}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Guests</span>
                                    <p className="font-medium">{selectedBooking.guests} people</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Number of Nights</span>
                                    <p className="font-medium">{selectedBooking.numberOfNights}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Pricing */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Price per Night</span>
                                    <span>{formatCurrency(selectedBooking.pricePerNight)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-base">
                                    <span>Total Amount</span>
                                    <span className="text-primary">{formatCurrency(selectedBooking.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <Separator />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/hotel/${selectedBooking.hotelId}`)}
                                >
                                    View Hotel
                                </Button>
                                {(selectedBooking.status === "confirmed" || selectedBooking.status === "pending") && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            handleCancelBooking(selectedBooking.id)
                                            setShowDetailsDialog(false)
                                        }}
                                    >
                                        Cancel Booking
                                    </Button>
                                )}
                                {selectedBooking.status === "checked-out" && !hasReviewed(selectedBooking.id) && (
                                    <Button
                                        onClick={() => {
                                            handleWriteReview(selectedBooking)
                                            setShowDetailsDialog(false)
                                        }}
                                    >
                                        Write Review
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

export default UserBookingsPage
