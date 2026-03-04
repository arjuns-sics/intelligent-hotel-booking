const HotelOwner = require("../models/HotelOwner")

/**
 * @desc    Get all rooms for hotel owner
 * @route   GET /api/owner/rooms
 * @access  Private
 */
const getOwnerRooms = async (req, res) => {
  try {
    const owner = await HotelOwner.findById(req.ownerId).select("rooms hotelName")

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    // Transform rooms to include status and id
    const rooms = owner.rooms.map((room, index) => ({
      id: room._id?.toString() || `room-${index}`,
      name: room.name,
      description: room.description || "",
      price: room.price,
      maxGuests: room.maxGuests || 2,
      beds: room.beds || "1 King Bed",
      size: room.size || "30 sqm",
      amenities: room.amenities || [],
      status: room.status || "available",
      roomNumber: room.roomNumber || "",
      floor: room.floor || "",
    }))

    res.status(200).json({
      success: true,
      message: "Rooms retrieved successfully",
      data: {
        hotelName: owner.hotelName,
        rooms,
      },
    })
  } catch (error) {
    console.error("Get rooms error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve rooms",
      error: error.message,
    })
  }
}

/**
 * @desc    Get single room by ID
 * @route   GET /api/owner/rooms/:roomId
 * @access  Private
 */
const getRoomById = async (req, res) => {
  try {
    const owner = await HotelOwner.findById(req.ownerId).select("rooms")

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    const room = owner.rooms.id(req.params.roomId)

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Room retrieved successfully",
      data: {
        id: room._id.toString(),
        name: room.name,
        description: room.description || "",
        price: room.price,
        maxGuests: room.maxGuests || 2,
        beds: room.beds || "1 King Bed",
        size: room.size || "30 sqm",
        amenities: room.amenities || [],
        status: room.status || "available",
        roomNumber: room.roomNumber || "",
        floor: room.floor || "",
      },
    })
  } catch (error) {
    console.error("Get room error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve room",
      error: error.message,
    })
  }
}

/**
 * @desc    Create a new room
 * @route   POST /api/owner/rooms
 * @access  Private
 */
const createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      maxGuests,
      beds,
      size,
      amenities,
      status,
      roomNumber,
      floor,
    } = req.body

    // Validation
    if (!name || !price || !maxGuests || !beds || !size) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      })
    }

    const owner = await HotelOwner.findById(req.ownerId)

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    // Create new room object
    const newRoom = {
      name,
      description: description || "",
      price,
      maxGuests,
      beds,
      size,
      amenities: amenities || [],
      status: status || "available",
      roomNumber: roomNumber || "",
      floor: floor || "",
    }

    // Add room to owner's rooms array
    owner.rooms.push(newRoom)
    await owner.save()

    // Get the newly created room (last item in array)
    const createdRoom = owner.rooms[owner.rooms.length - 1]

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: {
        id: createdRoom._id.toString(),
        name: createdRoom.name,
        description: createdRoom.description || "",
        price: createdRoom.price,
        maxGuests: createdRoom.maxGuests || 2,
        beds: createdRoom.beds || "1 King Bed",
        size: createdRoom.size || "30 sqm",
        amenities: createdRoom.amenities || [],
        status: createdRoom.status || "available",
        roomNumber: createdRoom.roomNumber || "",
        floor: createdRoom.floor || "",
      },
    })
  } catch (error) {
    console.error("Create room error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create room",
      error: error.message,
    })
  }
}

/**
 * @desc    Update a room
 * @route   PUT /api/owner/rooms/:roomId
 * @access  Private
 */
const updateRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      maxGuests,
      beds,
      size,
      amenities,
      status,
      roomNumber,
      floor,
    } = req.body

    // Validation
    if (!name || !price || !maxGuests || !beds || !size) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      })
    }

    const owner = await HotelOwner.findById(req.ownerId).select("rooms")

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    const room = owner.rooms.id(req.params.roomId)

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    // Update room fields
    room.name = name
    room.description = description || ""
    room.price = price
    room.maxGuests = maxGuests
    room.beds = beds
    room.size = size
    room.amenities = amenities || []
    room.status = status || "available"
    room.roomNumber = roomNumber || ""
    room.floor = floor || ""

    await owner.save()

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: {
        id: room._id.toString(),
        name: room.name,
        description: room.description || "",
        price: room.price,
        maxGuests: room.maxGuests || 2,
        beds: room.beds || "1 King Bed",
        size: room.size || "30 sqm",
        amenities: room.amenities || [],
        status: room.status || "available",
        roomNumber: room.roomNumber || "",
        floor: room.floor || "",
      },
    })
  } catch (error) {
    console.error("Update room error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update room",
      error: error.message,
    })
  }
}

/**
 * @desc    Delete a room
 * @route   DELETE /api/owner/rooms/:roomId
 * @access  Private
 */
const deleteRoom = async (req, res) => {
  try {
    const owner = await HotelOwner.findById(req.ownerId).select("rooms")

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner not found",
      })
    }

    const room = owner.rooms.id(req.params.roomId)

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    // Remove room from array
    room.remove()
    await owner.save()

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    })
  } catch (error) {
    console.error("Delete room error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete room",
      error: error.message,
    })
  }
}

module.exports = {
  getOwnerRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
}
