import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/lib/api"
import { useAdminAuth } from "@/context/AdminAuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Shield,
  Users,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  LogOut,
  BarChart3,
  Hotel,
  Briefcase,
} from "lucide-react"
import { toast } from "sonner"

interface StatsData {
  users: number
  hotels: number
  bookings: number
  owners: number
  revenue: number
  recentBookings: Array<{
    id: string
    bookingId: string
    hotelName: string
    roomType: string
    checkIn: string
    checkOut: string
    status: string
    totalAmount: number
    createdAt: string
  }>
  bookingsByStatus: Record<string, number>
}

interface User {
  _id: string
  name: string
  email: string
  createdAt: string
}

interface Hotel {
  id: string
  name: string
  email: string
  phone?: string
  hotelName?: string
  hotelDescription?: string
  city?: string
  state?: string
  isVerified: boolean
  onboardingComplete: boolean
  createdAt: string
}

type DashboardTab = "overview" | "users" | "hotels" | "bookings"

export function AdminDashboard() {
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuth()
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'user' | 'hotel' } | null>(null)

  const queryClient = useQueryClient()

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminApi.getStats()
      return response.data as StatsData
    },
    enabled: activeTab === "overview",
  })

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: async () => {
      const response = await adminApi.getUsers(1, 20, searchQuery)
      return response.data
    },
    enabled: activeTab === "users",
  })

  // Fetch hotels
  const { data: hotelsData, isLoading: hotelsLoading } = useQuery({
    queryKey: ['admin-hotels', searchQuery],
    queryFn: async () => {
      const response = await adminApi.getHotels(1, 20, searchQuery)
      return response.data
    },
    enabled: activeTab === "hotels",
  })

  // Fetch bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await adminApi.getBookings(1, 20)
      return response.data
    },
    enabled: activeTab === "bookings",
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await adminApi.deleteUser(userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted successfully')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user')
    },
  })

  // Delete hotel mutation
  const deleteHotelMutation = useMutation({
    mutationFn: async (hotelId: string) => {
      await adminApi.deleteHotel(hotelId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] })
      toast.success('Hotel deleted successfully')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete hotel')
    },
  })

  // Verify hotel mutation
  const verifyHotelMutation = useMutation({
    mutationFn: async (hotelId: string) => {
      await adminApi.verifyHotel(hotelId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hotels'] })
      toast.success('Hotel verified successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify hotel')
    },
  })

  const handleDelete = () => {
    if (!itemToDelete) return
    if (itemToDelete.type === 'user') {
      deleteUserMutation.mutate(itemToDelete.id)
    } else if (itemToDelete.type === 'hotel') {
      deleteHotelMutation.mutate(itemToDelete.id)
    }
  }

  const confirmDelete = (id: string, type: 'user' | 'hotel') => {
    setItemToDelete({ id, type })
    setDeleteDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'verified':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'cancelled':
        return 'bg-red-500'
      case 'checked-in':
        return 'bg-blue-500'
      case 'checked-out':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const stats = statsData as StatsData | undefined

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  {admin?.name} • {admin?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                View Site
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'hotels', label: 'Hotels', icon: Hotel },
              { id: 'bookings', label: 'Bookings', icon: Briefcase },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-3xl font-bold">{stats?.users || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hotels</CardTitle>
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-3xl font-bold">{stats?.hotels || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Active hotels</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-3xl font-bold">{stats?.bookings || 0}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-3xl font-bold">{formatCurrency(stats?.revenue || 0)}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">From confirmed bookings</p>
                </CardContent>
              </Card>
            </div>

            {/* Bookings by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Bookings by Status
                </CardTitle>
                <CardDescription>Overview of bookings across different statuses</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex gap-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 flex-1" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(stats?.bookingsByStatus || {}).map(([status, count]) => (
                      <div
                        key={status}
                        className="p-4 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                          <span className="text-sm font-medium capitalize">{status}</span>
                        </div>
                        <div className="text-2xl font-bold">{count as number}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest bookings made on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Hotel</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(stats?.recentBookings || []).slice(0, 5).map((booking: any) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-sm">
                            {booking.bookingId}
                          </TableCell>
                          <TableCell>{booking.hotelName}</TableCell>
                          <TableCell>{booking.roomType}</TableCell>
                          <TableCell>{formatDate(booking.checkIn)}</TableCell>
                          <TableCell>{formatDate(booking.checkOut)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(booking.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>
                  {usersData?.pagination?.total || 0} total users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(usersData?.users || []).map((user: User) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDelete(user._id, 'user')}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hotels Tab */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search hotels..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registered Hotels</CardTitle>
                <CardDescription>
                  {hotelsData?.pagination?.total || 0} total hotels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hotelsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-24" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hotel Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Onboarding</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(hotelsData?.hotels || []).map((hotel: Hotel) => (
                        <TableRow key={hotel.id}>
                          <TableCell className="font-medium">
                            {hotel.hotelName || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{hotel.name}</div>
                              <div className="text-sm text-muted-foreground">{hotel.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {hotel.city && hotel.state ? (
                              <span>{`${hotel.city}, ${hotel.state}`}</span>
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={hotel.isVerified ? 'default' : 'secondary'}>
                              {hotel.isVerified ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <XCircle className="w-3 h-3 mr-1" />
                              )}
                              {hotel.isVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={hotel.onboardingComplete ? 'default' : 'secondary'}>
                              {hotel.onboardingComplete ? 'Complete' : 'Incomplete'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!hotel.isVerified && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => verifyHotelMutation.mutate(hotel.id)}
                                >
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmDelete(hotel.id, 'hotel')}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                {bookingsData?.pagination?.total || 0} total bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(bookingsData?.bookings || []).map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-sm">
                          {booking.bookingId}
                        </TableCell>
                        <TableCell>{booking.hotelName}</TableCell>
                        <TableCell>{booking.roomType}</TableCell>
                        <TableCell>
                          {booking.user?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(booking.checkIn)}</div>
                            <div className="text-muted-foreground">
                              to {formatDate(booking.checkOut)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(booking.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteUserMutation.isPending || deleteHotelMutation.isPending
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminDashboard
