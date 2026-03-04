import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateRoom } from "@/hooks/useRooms"
import type { CreateRoomData } from "@/lib/api"

interface AddRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COMMON_AMENITIES = [
  "WiFi",
  "TV",
  "Air Conditioning",
  "Mini Bar",
  "Room Service",
  "Safe",
  "Balcony",
  "Ocean View",
  "Bathtub",
  "Shower",
  "Hair Dryer",
  "Iron",
  "Desk",
  "Seating Area",
]

export function AddRoomDialog({ open, onOpenChange }: AddRoomDialogProps) {
  const createRoom = useCreateRoom()
  const [formData, setFormData] = useState<CreateRoomData>({
    name: "",
    description: "",
    price: 0,
    maxGuests: 2,
    beds: "1 King Bed",
    size: "",
    amenities: [],
    status: "available",
    roomNumber: "",
    floor: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Room name is required"
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0"
    }
    if (!formData.maxGuests || formData.maxGuests < 1) {
      newErrors.maxGuests = "Maximum guests must be at least 1"
    }
    if (!formData.beds.trim()) {
      newErrors.beds = "Bed information is required"
    }
    if (!formData.size.trim()) {
      newErrors.size = "Room size is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    await createRoom.mutateAsync(formData)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      maxGuests: 2,
      beds: "1 King Bed",
      size: "",
      amenities: [],
      status: "available",
      roomNumber: "",
      floor: "",
    })
    setErrors({})
    onOpenChange(false)
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
          <DialogDescription>
            Add a new room to your hotel inventory
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Deluxe Sea View Room"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                placeholder="e.g., 101"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the room features and amenities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price per Night (₹) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                placeholder="5000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGuests">Max Guests *</Label>
              <Input
                id="maxGuests"
                type="number"
                min="1"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
              />
              {errors.maxGuests && <p className="text-sm text-destructive">{errors.maxGuests}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Room Size *</Label>
              <Input
                id="size"
                placeholder="e.g., 30 sqm"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
              {errors.size && <p className="text-sm text-destructive">{errors.size}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beds">Bed Configuration *</Label>
            <Input
              id="beds"
              placeholder="e.g., 1 King Bed or 2 Twin Beds"
              value={formData.beds}
              onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
            />
            {errors.beds && <p className="text-sm text-destructive">{errors.beds}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                placeholder="e.g., 1st Floor"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "available" | "occupied" | "maintenance" })}
                className="flex h-9 w-full rounded-xl border border-input bg-input/30 px-3 py-1 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities?.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="h-4 w-4 rounded border-input"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createRoom.isPending}>
            {createRoom.isPending ? "Creating..." : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
