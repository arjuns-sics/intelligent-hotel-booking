import { useQuery } from "@tanstack/react-query"
import { ownerApi, type Room } from "@/lib/api"

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
