import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
    Calendar,
    MapPin,
    Clock,
    Building2,
    Users,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Search,
    Loader2,
    DollarSign,
    TrendingUp,
} from "lucide-react"
import { bookingApi } from "@/lib/api"
import { clearAllAuthState } from "@/lib/authAtoms"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface Booking {
    id: string
    bookingId: string
    hotelName: string
    hotelImage: string
    location: string
    roomType: string
    checkIn: string
    checkOut: string
    guests: number
    numberOfNights: number
    pricePerNight: number
    totalAmount: number
    status: "pending" | "confirmed" | "checked-in" | "checked-out" | "cancelled"
    bookingDate: string
    guest: {
        name: string
        email: string
        phone?: string
    }
    specialRequests?: string
}

interface BookingStats {
    total: number
    pending: number
    confirmed: number
    checkedIn: number
    checkedOut: number
    cancelled: number
    totalRevenue: number
    upcomingRevenue: number
}

export function HotelOwnerBookingsPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)

    // Fetch bookings
    const { data: bookingsData, isLoading, refetch } = useQuery({
        queryKey: ['owner-bookings', statusFilter],
        queryFn: async () => {
            const response = await bookingApi.getOwnerBookings(statusFilter === "all" ? undefined : statusFilter)
            return response.data
        },
        retry: false,
    })

    // Fetch stats
    const { data: statsData } = useQuery({
        queryKey: ['owner-booking-stats'],
        queryFn: async () => {
            const response = await bookingApi.getBookingStats()
            return response.data as BookingStats
        },
        retry: false,
    })

    const bookings = bookingsData?.bookings || []
    const stats = statsData as BookingStats

    // Mutation for updating booking status
    const updateStatusMutation = useMutation({
        mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
            const response = await bookingApi.updateBookingStatus(bookingId, status)
            return response.data
        },
        onSuccess: () => {
            toast.success('Booking status updated successfully')
            refetch()
            queryClient.invalidateQueries({ queryKey: ['owner-booking-stats'] })
            setShowDetailsDialog(false)
        },
        onError: (error: any) => {
            toast.error('Failed to update booking status', {
                description: error.response?.data?.message || 'Please try again.',
            })
        },
    })

    const filteredBookings = bookings.filter((booking: Booking) => {
        const matchesSearch =
            booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.roomType.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
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
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusBadge = (status: Booking["status"]) => {
        const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
            pending: "outline",
            confirmed: "default",
            "checked-in": "default",
            "checked-out": "secondary",
            cancelled: "destructive",
        }
        const icons: Record<string, React.ElementType> = {
            pending: Clock,
            confirmed: CheckCircle,
            "checked-in": CheckCircle,
            "checked-out": CheckCircle,
            cancelled: XCircle,
        }
        const Icon = icons[status] || Clock
        return (
            <Badge variant={variants[status]} className="gap-1">
                <Icon className="w-3 h-3" />
                {status.replace("-", " ").toUpperCase()}
            </Badge>
        )
    }

    const getNextStatusOptions = (currentStatus: Booking["status"]) => {
        const transitions: Record<string, string[]> = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["checked-in", "cancelled"],
            "checked-in": ["checked-out"],
            "checked-out": [],
            cancelled: [],
        }
        return transitions[currentStatus] || []
    }

    const handleStatusUpdate = (bookingId: string, newStatus: string) => {
        updateStatusMutation.mutate({ bookingId, status: newStatus })
    }

    const handleViewDetails = (booking: Booking) => {
        setSelectedBooking(booking)
        setShowDetailsDialog(true)
    }

    const statsCards = [
        {
            title: "Total Bookings",
            value: stats?.total || 0,
            icon: Building2,
            color: "blue",
        },
        {
            title: "Confirmed",
            value: (stats?.confirmed || 0) + (stats?.checkedIn || 0),
            icon: CheckCircle,
            color: "green",
        },
        {
            title: "Pending",
            value: stats?.pending || 0,
            icon: Clock,
            color: "orange",
        },
        {
            title: "Cancelled",
            value: stats?.cancelled || 0,
            icon: XCircle,
            color: "red",
        },
        {
            title: "Total Revenue",
            value: formatCurrency(stats?.totalRevenue || 0),
            icon: DollarSign,
            color: "purple",
        },
        {
            title: "Upcoming Revenue",
            value: formatCurrency(stats?.upcomingRevenue || 0),
            icon: TrendingUp,
            color: "emerald",
        },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={() => navigate("/owner/dashboard")} className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Button>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                            clearAllAuthState(() => {})
                            navigate("/owner/login")
                        }}>
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
                    <p className="text-muted-foreground">View and manage all hotel bookings</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statsCards.map((stat) => {
                        const Icon = stat.icon
                        const colorClasses: Record<string, string> = {
                            blue: "bg-blue-100 text-blue-600",
                            green: "bg-green-100 text-green-600",
                            orange: "bg-orange-100 text-orange-600",
                            red: "bg-red-100 text-red-600",
                            purple: "bg-purple-100 text-purple-600",
                            emerald: "bg-emerald-100 text-emerald-600",
                        }
                        return (
                            <Card key={stat.title}>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                                            <p className="text-2xl font-bold">{stat.value}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-lg ${colorClasses[stat.color]} flex items-center justify-center`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Bookings Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base">All Bookings</CardTitle>
                                <CardDescription>Manage your hotel reservations</CardDescription>
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
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="checked-in">Checked In</SelectItem>
                                        <SelectItem value="checked-out">Checked Out</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground">Loading bookings...</p>
                            </div>
                        ) : filteredBookings.length > 0 ? (
                            <div className="space-y-4">
                                {filteredBookings.map((booking: Booking) => (
                                    <div
                                        key={booking.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4 flex-1">
                                                <div
                                                    className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer shrink-0"
                                                    onClick={() => handleViewDetails(booking)}
                                                >
                                                    <img
                                                        src={booking.hotelImage}
                                                        alt={booking.hotelName}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold">{booking.bookingId}</span>
                                                        {getStatusBadge(booking.status)}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Users className="w-4 h-4" />
                                                            <span>{booking.guest.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Building2 className="w-4 h-4" />
                                                            <span>{booking.roomType}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Clock className="w-4 h-4" />
                                                            <span>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-lg font-bold text-primary">
                                                    {formatCurrency(booking.totalAmount)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => handleViewDetails(booking)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                                <p className="text-muted-foreground">
                                    {searchQuery ? "Try adjusting your search" : "No bookings yet"}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Booking Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedBooking && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <span>{selectedBooking.bookingId}</span>
                                    {getStatusBadge(selectedBooking.status)}
                                </DialogTitle>
                                <DialogDescription>
                                    Booking details and guest information
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Guest Information */}
                                <div>
                                    <h4 className="font-semibold mb-3">Guest Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Name:</span>
                                            <p className="font-medium">{selectedBooking.guest.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Email:</span>
                                            <p className="font-medium">{selectedBooking.guest.email}</p>
                                        </div>
                                        {selectedBooking.guest.phone && (
                                            <div>
                                                <span className="text-muted-foreground">Phone:</span>
                                                <p className="font-medium">{selectedBooking.guest.phone}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-muted-foreground">Guests:</span>
                                            <p className="font-medium">{selectedBooking.guests} people</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Booking Details */}
                                <div>
                                    <h4 className="font-semibold mb-3">Booking Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Room Type:</span>
                                            <p className="font-medium">{selectedBooking.roomType}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Number of Nights:</span>
                                            <p className="font-medium">{selectedBooking.numberOfNights}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Check-in:</span>
                                            <p className="font-medium">{formatDate(selectedBooking.checkIn)}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Check-out:</span>
                                            <p className="font-medium">{formatDate(selectedBooking.checkOut)}</p>
                                        </div>
                                    </div>
                                </div>

                                {selectedBooking.specialRequests && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="font-semibold mb-2">Special Requests</h4>
                                            <p className="text-sm text-muted-foreground">{selectedBooking.specialRequests}</p>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                {/* Pricing */}
                                <div>
                                    <h4 className="font-semibold mb-3">Pricing</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Price per Night:</span>
                                            <span>{formatCurrency(selectedBooking.pricePerNight)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold">
                                            <span>Total Amount:</span>
                                            <span className="text-primary">{formatCurrency(selectedBooking.totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Update */}
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-3">Update Status</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {getNextStatusOptions(selectedBooking.status).map((status) => (
                                            <Button
                                                key={status}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusUpdate(selectedBooking.id, status)}
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                {updateStatusMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    status.replace("-", " ").toUpperCase()
                                                )}
                                            </Button>
                                        ))}
                                        {getNextStatusOptions(selectedBooking.status).length === 0 && (
                                            <p className="text-sm text-muted-foreground">No status updates available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default HotelOwnerBookingsPage
