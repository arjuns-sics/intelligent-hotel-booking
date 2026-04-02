import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Lock,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  Shield,
} from "lucide-react"
import { bookingApi } from "@/lib/api"
import { toast } from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface PaymentPageState {
  hotel: {
    id: string
    name: string
    image: string
    location: string
  }
  selectedRoom: {
    id: string
    name: string
    price: number
    maxGuests: number
    beds: string
    size: string
    amenities: string[]
  }
  bookingData: {
    checkIn: string
    checkOut: string
    guests: number
    specialRequests: string
  }
  totalPrice: number
  numberOfNights: number
}

interface CardDetails {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
}

export function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "success">("details")
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  })
  const [errors, setErrors] = useState<Partial<CardDetails>>({})

  const bookingState = location.state as PaymentPageState | null

  useEffect(() => {
    if (!bookingState) {
      toast.error("No booking details found", {
        description: "Please select a room and dates first.",
      })
      navigate("/dashboard")
    }
  }, [bookingState, navigate])

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await bookingApi.createBooking(bookingData)
      return response.data
    },
    onSuccess: (data) => {
      setPaymentStep("success")
      toast.success("Payment Successful!", {
        description: `Your booking ${data.bookingId} has been confirmed.`,
      })
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      
      // Redirect to bookings page after 3 seconds
      setTimeout(() => {
        navigate("/bookings")
      }, 3000)
    },
    onError: (error: any) => {
      setIsProcessing(false)
      setPaymentStep("details")
      toast.error("Payment Failed", {
        description: error.response?.data?.message || "Unable to process payment. Please try again.",
      })
    },
  })

  if (!bookingState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  const { hotel, selectedRoom, bookingData, totalPrice, numberOfNights } = bookingState

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19)
  }

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    // Add slash after MM
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }
    return digits
  }

  const validateCardDetails = (): boolean => {
    const newErrors: Partial<CardDetails> = {}

    // Card number validation (16 digits)
    const cardNumberDigits = cardDetails.cardNumber.replace(/\D/g, "")
    if (cardNumberDigits.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits"
    }

    // Cardholder name validation
    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required"
    }

    // Expiry date validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
    if (!expiryRegex.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = "Valid expiry date required (MM/YY)"
    } else {
      // Check if card is not expired
      const [month, year] = cardDetails.expiryDate.split("/").map(Number)
      const expiryDate = new Date(2000 + year, month - 1)
      const now = new Date()
      if (expiryDate < now) {
        newErrors.expiryDate = "Card has expired"
      }
    }

    // CVV validation (3-4 digits)
    const cvvDigits = cardDetails.cvv.replace(/\D/g, "")
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      newErrors.cvv = "CVV must be 3-4 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardDetails((prev) => ({ ...prev, cardNumber: formatted }))
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: undefined }))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setCardDetails((prev) => ({ ...prev, expiryDate: formatted }))
    if (errors.expiryDate) {
      setErrors((prev) => ({ ...prev, expiryDate: undefined }))
    }
  }

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCardDetails((prev) => ({ ...prev, cvv: digits }))
    if (errors.cvv) {
      setErrors((prev) => ({ ...prev, cvv: undefined }))
    }
  }

  const handlePayment = () => {
    if (!validateCardDetails()) {
      toast.error("Invalid card details", {
        description: "Please check your card information and try again.",
      })
      return
    }

    setIsProcessing(true)
    setPaymentStep("processing")

    // Simulate payment processing delay (2-3 seconds)
    setTimeout(() => {
      // Create the booking after "successful" payment
      createBookingMutation.mutate({
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        roomType: selectedRoom.name,
        roomDetails: {
          price: selectedRoom.price,
          maxGuests: selectedRoom.maxGuests,
          beds: selectedRoom.beds,
          size: selectedRoom.size,
          amenities: selectedRoom.amenities,
        },
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        pricePerNight: selectedRoom.price,
        specialRequests: bookingData.specialRequests,
      })
    }, 2500)
  }

  const taxesAndFees = Math.round(totalPrice * 0.18) // 18% GST
  const finalTotal = totalPrice + taxesAndFees

  // Success Page
  if (paymentStep === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-emerald-200">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-emerald-700 mb-6">
                Your booking has been confirmed
              </p>

              <Separator className="my-6 bg-emerald-200" />

              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-emerald-700">Hotel:</span>
                  <span className="font-medium text-emerald-900">{hotel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Room:</span>
                  <span className="font-medium text-emerald-900">{selectedRoom.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Amount Paid:</span>
                  <span className="font-bold text-emerald-900">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Separator className="my-6 bg-emerald-200" />

              <p className="text-sm text-emerald-600">
                Redirecting to your bookings...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Processing State
  if (paymentStep === "processing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
              
              <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
              <p className="text-muted-foreground mb-6">
                Please wait while we process your payment securely...
              </p>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{formatPrice(finalTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hotel:</span>
                  <span className="font-medium">{hotel.name}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-6">
                <Shield className="w-3 h-3 inline mr-1" />
                Secure 256-bit SSL encryption
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Payment Details Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/95 border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              Secure Payment
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Complete your payment securely
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardDetails.cardNumber}
                        onChange={handleCardNumberChange}
                        className={`pl-10 ${errors.cardNumber ? "border-red-500" : ""}`}
                        maxLength={19}
                      />
                    </div>
                    {errors.cardNumber && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  {/* Cardholder Name */}
                  <div className="space-y-2">
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      placeholder="John Doe"
                      value={cardDetails.cardholderName}
                      onChange={(e) =>
                        setCardDetails((prev) => ({
                          ...prev,
                          cardholderName: e.target.value,
                        }))
                      }
                      className={errors.cardholderName ? "border-red-500" : ""}
                    />
                    {errors.cardholderName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cardholderName}
                      </p>
                    )}
                  </div>

                  {/* Expiry Date and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={handleExpiryChange}
                        className={errors.expiryDate ? "border-red-500" : ""}
                        maxLength={5}
                      />
                      {errors.expiryDate && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          value={cardDetails.cvv}
                          onChange={handleCVVChange}
                          className={`pl-10 ${errors.cvv ? "border-red-500" : ""}`}
                          maxLength={4}
                        />
                      </div>
                      {errors.cvv && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.cvv}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">
                        Your payment is secure
                      </p>
                      <p>
                        Your card information is encrypted and securely processed. 
                        We don't store your card details.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="security">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Security & Privacy
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p>
                          🔒 <strong>256-bit SSL Encryption:</strong> All data is encrypted using industry-standard SSL encryption.
                        </p>
                        <p>
                          🛡️ <strong>PCI DSS Compliant:</strong> We follow Payment Card Industry Data Security Standards.
                        </p>
                        <p>
                          🔐 <strong>No Data Storage:</strong> Your card details are never stored on our servers.
                        </p>
                        <p>
                          ✅ <strong>Verified by Visa / Mastercard SecureCode:</strong> Additional security layer for online transactions.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hotel Info */}
                <div className="flex gap-3">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{hotel.location}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Room Info */}
                <div>
                  <div className="text-sm font-medium">{selectedRoom.name}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {selectedRoom.maxGuests} guests
                    </span>
                    <span>{selectedRoom.beds}</span>
                    <span>{selectedRoom.size}</span>
                  </div>
                </div>

                <Separator />

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Check-in</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDate(bookingData.checkIn)}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Check-out</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDate(bookingData.checkOut)}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {numberOfNights} {numberOfNights === 1 ? "night" : "nights"}
                  </Badge>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {formatPrice(selectedRoom.price)} × {numberOfNights} nights
                    </span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes & fees (18% GST)</span>
                    <span>{formatPrice(taxesAndFees)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Separator />

                {/* Pay Button */}
                <Button
                  className="w-full h-12 text-lg"
                  onClick={handlePayment}
                  disabled={isProcessing || createBookingMutation.isPending}
                >
                  {isProcessing || createBookingMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Pay {formatPrice(finalTotal)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By clicking "Pay", you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Free cancellation up to 24 hours before check-in. 
                  After that, 50% of the total amount will be charged.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
