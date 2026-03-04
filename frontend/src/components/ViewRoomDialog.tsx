import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Room } from "@/lib/api"
import { Users, Home, Building2, Calendar, DollarSign } from "lucide-react"

interface ViewRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
}

export function ViewRoomDialog({ open, onOpenChange, room }: ViewRoomDialogProps) {
  if (!room) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: Room["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "default",
      occupied: "secondary",
      maintenance: "destructive",
    }
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{room.name}</DialogTitle>
            {getStatusBadge(room.status)}
          </div>
          <DialogDescription>
            Room Details Overview
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {room.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{room.description}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Price per Night</span>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(room.price)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>Maximum Guests</span>
              </div>
              <p className="text-lg font-semibold">{room.maxGuests} Guests</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home className="w-4 h-4" />
                <span>Bed Configuration</span>
              </div>
              <p className="text-base font-medium">{room.beds}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>Room Size</span>
              </div>
              <p className="text-base font-medium">{room.size}</p>
            </div>
          </div>

          {(room.roomNumber || room.floor) && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                {room.roomNumber && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Room Number</span>
                    </div>
                    <p className="text-base font-medium">{room.roomNumber}</p>
                  </div>
                )}
                {room.floor && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>Floor</span>
                    </div>
                    <p className="text-base font-medium">{room.floor}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {room.amenities && room.amenities.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
