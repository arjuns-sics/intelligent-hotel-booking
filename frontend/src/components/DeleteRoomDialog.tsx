import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useDeleteRoom } from "@/hooks/useRooms"

interface DeleteRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string | null
  roomName: string
}

export function DeleteRoomDialog({ open, onOpenChange, roomId, roomName }: DeleteRoomDialogProps) {
  const deleteRoom = useDeleteRoom()

  const handleDelete = async () => {
    if (!roomId) return
    await deleteRoom.mutateAsync(roomId)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Room</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{roomName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRoom.isPending}
          >
            {deleteRoom.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
