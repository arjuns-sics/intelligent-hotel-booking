import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ownerApi, type Room, type CreateRoomData, type UpdateRoomData } from "@/lib/api"
import { toast } from "sonner"

export function useRooms() {
  return useQuery<Room[]>({
    queryKey: ["owner", "rooms"],
    queryFn: async () => {
      const response = await ownerApi.getRooms()
      return response.data.rooms
    },
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useRoom(roomId: string) {
  return useQuery<Room>({
    queryKey: ["owner", "room", roomId],
    queryFn: async () => {
      const response = await ownerApi.getRoom(roomId)
      return response.data
    },
    enabled: !!roomId,
    retry: 2,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateRoomData) => {
      const response = await ownerApi.createRoom(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "rooms"] })
      toast.success("Room created successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create room")
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ roomId, data }: { roomId: string; data: UpdateRoomData }) => {
      const response = await ownerApi.updateRoom(roomId, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "rooms"] })
      toast.success("Room updated successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update room")
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomId: string) => {
      const response = await ownerApi.deleteRoom(roomId)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner", "rooms"] })
      toast.success("Room deleted successfully")
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete room")
    },
  })
}
