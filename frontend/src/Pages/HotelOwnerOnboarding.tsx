import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Image as ImageIcon,
    Wifi,
    UtensilsCrossed,
    Car,
    Dumbbell,
    Plus,
    X,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    DollarSign,
    Users,
    Bed,
    Info,
} from "lucide-react"

const AMENITIES = [
    { id: "wifi", label: "Free WiFi", icon: Wifi },
    { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
    { id: "parking", label: "Parking", icon: Car },
    { id: "spa", label: "Spa & Wellness", icon: Dumbbell },
    { id: "pool", label: "Swimming Pool", icon: Building2 },
    { id: "gym", label: "Fitness Center", icon: Dumbbell },
    { id: "bar", label: "Bar & Lounge", icon: UtensilsCrossed },
    { id: "concierge", label: "Concierge Service", icon: Users },
    { id: "roomService", label: "Room Service", icon: Clock },
    { id: "laundry", label: "Laundry Service", icon: CheckCircle },
]

function Clock({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}

interface RoomData {
    id: string
    name: string
    description: string
    price: string
    maxGuests: string
    beds: string
    size: string
    amenities: string[]
}

export function HotelOwnerOnboarding() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        hotelName: "",
        hotelDescription: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        email: "",
        website: "",
        // Step 2: Amenities
        amenities: [] as string[],
        // Step 3: Rooms
        rooms: [] as RoomData[],
        // Step 4: Policies
        checkInTime: "14:00",
        checkOutTime: "11:00",
        cancellationPolicy: "flexible",
        petPolicy: "not-allowed",
    })

    const totalSteps = 4

    const updateFormData = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    const addRoom = () => {
        const newRoom: RoomData = {
            id: `room-${Date.now()}`,
            name: "",
            description: "",
            price: "",
            maxGuests: "2",
            beds: "1 Queen Bed",
            size: "",
            amenities: [],
        }
        updateFormData("rooms", [...formData.rooms, newRoom])
    }

    const updateRoom = (index: number, key: string, value: string) => {
        const updatedRooms = [...formData.rooms]
        updatedRooms[index] = { ...updatedRooms[index], [key]: value }
        updateFormData("rooms", updatedRooms)
    }

    const removeRoom = (index: number) => {
        const updatedRooms = formData.rooms.filter((_, i) => i !== index)
        updateFormData("rooms", updatedRooms)
    }

    const toggleAmenity = (amenityId: string) => {
        const amenities = formData.amenities.includes(amenityId)
            ? formData.amenities.filter((id) => id !== amenityId)
            : [...formData.amenities, amenityId]
        updateFormData("amenities", amenities)
    }

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.hotelName && formData.address && formData.city && formData.phone && formData.email)
            case 2:
                return formData.amenities.length >= 1
            case 3:
                return formData.rooms.length >= 1 && formData.rooms.every((r) => r.name && r.price)
            case 4:
                return true
            default:
                return true
        }
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
        }
    }

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const handleSubmit = async () => {
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            // Save hotel data
            const hotelData = {
                id: `hotel-${Date.now()}`,
                ownerId: "owner-1",
                ...formData,
                status: "pending",
                createdAt: new Date().toISOString(),
            }

            localStorage.setItem("hotelData", JSON.stringify(hotelData))
            localStorage.setItem("onboardingComplete", "true")

            setLoading(false)
            navigate("/owner/dashboard")
        }, 1500)
    }

    const getStepProgress = () => (currentStep / totalSteps) * 100

    const renderStepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground">{Math.round(getStepProgress())}% Complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
            <div className="flex justify-between mt-4">
                {[
                    { num: 1, label: "Basic Info" },
                    { num: 2, label: "Amenities" },
                    { num: 3, label: "Rooms" },
                    { num: 4, label: "Policies" },
                ].map((step) => (
                    <div key={step.num} className="flex flex-col items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                currentStep >= step.num
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {currentStep > step.num ? <CheckCircle className="w-4 h-4" /> : step.num}
                        </div>
                        <span className={`text-xs mt-1 ${currentStep >= step.num ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )

    const renderStep1 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Tell us about your property</h3>
                <p className="text-sm text-muted-foreground">
                    Provide basic information about your hotel
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label htmlFor="hotelName">Hotel Name *</Label>
                    <Input
                        id="hotelName"
                        placeholder="e.g., The Grand Palace Hotel"
                        value={formData.hotelName}
                        onChange={(e) => updateFormData("hotelName", e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Describe your property's unique features..."
                        value={formData.hotelDescription}
                        onChange={(e) => updateFormData("hotelDescription", e.target.value)}
                        className="mt-1"
                        rows={4}
                    />
                </div>

                <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="address"
                            placeholder="123 Main Street"
                            value={formData.address}
                            onChange={(e) => updateFormData("address", e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                        id="city"
                        placeholder="Mumbai"
                        value={formData.city}
                        onChange={(e) => updateFormData("city", e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                        id="state"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={(e) => updateFormData("state", e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                        id="pincode"
                        placeholder="400001"
                        value={formData.pincode}
                        onChange={(e) => updateFormData("pincode", e.target.value)}
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => updateFormData("phone", e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="contact@hotel.com"
                            value={formData.email}
                            onChange={(e) => updateFormData("email", e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                        id="website"
                        placeholder="www.yourhotel.com"
                        value={formData.website}
                        onChange={(e) => updateFormData("website", e.target.value)}
                        className="mt-1"
                    />
                </div>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Select Amenities</h3>
                <p className="text-sm text-muted-foreground">
                    What facilities does your property offer?
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES.map((amenity) => {
                    const Icon = amenity.icon
                    const isSelected = formData.amenities.includes(amenity.id)
                    return (
                        <button
                            key={amenity.id}
                            onClick={() => toggleAmenity(amenity.id)}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium">{amenity.label}</span>
                            </div>
                        </button>
                    )
                })}
            </div>

            {formData.amenities.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Info className="w-4 h-4" />
                    <span>Select at least one amenity to continue</span>
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenityId) => {
                    const amenity = AMENITIES.find((a) => a.id === amenityId)
                    if (!amenity) return null
                    return (
                        <Badge key={amenityId} variant="secondary" className="px-3 py-1">
                            {amenity.label}
                            <X
                                className="w-3 h-3 ml-2 cursor-pointer"
                                onClick={() => toggleAmenity(amenityId)}
                            />
                        </Badge>
                    )
                })}
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Add Rooms</h3>
                    <p className="text-sm text-muted-foreground">
                        List the room types available at your property
                    </p>
                </div>
                <Button onClick={addRoom} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Room
                </Button>
            </div>

            {formData.rooms.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No rooms added yet</p>
                        <Button onClick={addRoom} variant="outline">
                            Add Your First Room
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {formData.rooms.map((room, index) => (
                        <Card key={room.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Room {index + 1}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRoom(index)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Room Name *</Label>
                                        <Input
                                            placeholder="e.g., Deluxe Sea View"
                                            value={room.name}
                                            onChange={(e) => updateRoom(index, "name", e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Price per Night (₹) *</Label>
                                        <div className="relative mt-1">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                placeholder="5000"
                                                value={room.price}
                                                onChange={(e) => updateRoom(index, "price", e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            placeholder="Describe the room features..."
                                            value={room.description}
                                            onChange={(e) => updateRoom(index, "description", e.target.value)}
                                            className="mt-1"
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <Label>Max Guests</Label>
                                        <div className="relative mt-1">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={room.maxGuests}
                                                onChange={(e) => updateRoom(index, "maxGuests", e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Bed Configuration</Label>
                                        <div className="relative mt-1">
                                            <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="1 King Bed"
                                                value={room.beds}
                                                onChange={(e) => updateRoom(index, "beds", e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Room Size (sq ft)</Label>
                                        <Input
                                            placeholder="450"
                                            value={room.size}
                                            onChange={(e) => updateRoom(index, "size", e.target.value)}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )

    const renderStep4 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Set Policies</h3>
                <p className="text-sm text-muted-foreground">
                    Define your hotel's rules and policies
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Check-in / Check-out
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Check-in Time</Label>
                            <Input
                                type="time"
                                value={formData.checkInTime}
                                onChange={(e) => updateFormData("checkInTime", e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Check-out Time</Label>
                            <Input
                                type="time"
                                value={formData.checkOutTime}
                                onChange={(e) => updateFormData("checkOutTime", e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Cancellation Policy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[
                                { value: "flexible", label: "Flexible", desc: "Free cancellation up to 24 hours before" },
                                { value: "moderate", label: "Moderate", desc: "Free cancellation up to 48 hours before" },
                                { value: "strict", label: "Strict", desc: "50% refund up to 7 days before" },
                                { value: "non-refundable", label: "Non-refundable", desc: "No refund for cancellations" },
                            ].map((policy) => (
                                <label
                                    key={policy.value}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                        formData.cancellationPolicy === policy.value
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="cancellationPolicy"
                                        value={policy.value}
                                        checked={formData.cancellationPolicy === policy.value}
                                        onChange={(e) => updateFormData("cancellationPolicy", e.target.value)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className="font-medium text-sm">{policy.label}</div>
                                        <div className="text-xs text-muted-foreground">{policy.desc}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Pet Policy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <label
                                className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                    formData.petPolicy === "allowed"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="petPolicy"
                                    value="allowed"
                                    checked={formData.petPolicy === "allowed"}
                                    onChange={(e) => updateFormData("petPolicy", e.target.value)}
                                />
                                <div>
                                    <div className="font-medium">Pets Allowed</div>
                                    <div className="text-xs text-muted-foreground">Welcome pets with additional fees</div>
                                </div>
                            </label>
                            <label
                                className={`flex-1 flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                    formData.petPolicy === "not-allowed"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="petPolicy"
                                    value="not-allowed"
                                    checked={formData.petPolicy === "not-allowed"}
                                    onChange={(e) => updateFormData("petPolicy", e.target.value)}
                                />
                                <div>
                                    <div className="font-medium">No Pets</div>
                                    <div className="text-xs text-muted-foreground">Pets not allowed on property</div>
                                </div>
                            </label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    What happens next?
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your property will be reviewed within 24-48 hours</li>
                    <li>• Our team will contact you for verification</li>
                    <li>• Once approved, your hotel will be live on the platform</li>
                    <li>• You can start managing bookings from your dashboard</li>
                </ul>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-primary" />
                        <span className="font-semibold">List Your Property</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {renderStepIndicator()}

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {currentStep === 1 && "Basic Information"}
                            {currentStep === 2 && "Amenities & Facilities"}
                            {currentStep === 3 && "Room Details"}
                            {currentStep === 4 && "Policies & Rules"}
                        </CardTitle>
                        <CardDescription>
                            {currentStep === 1 && "Start with your property's basic details"}
                            {currentStep === 2 && "Showcase what makes your property special"}
                            {currentStep === 3 && "Add the rooms you offer"}
                            {currentStep === 4 && "Set the rules for your property"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}

                        <Separator className="my-6" />

                        <div className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1 || loading}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            {currentStep === totalSteps ? (
                                <Button onClick={handleSubmit} disabled={loading || !validateStep(currentStep)} className="gap-2">
                                    {loading ? (
                                        "Submitting..."
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Submit Property
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    disabled={!validateStep(currentStep)}
                                    className="gap-2"
                                >
                                    Next
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default HotelOwnerOnboarding
