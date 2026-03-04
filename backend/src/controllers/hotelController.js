const HotelOwner = require("../models/HotelOwner")

/**
 * @desc    Get all hotels (public endpoint)
 * @route   GET /api/hotels
 * @access  Public
 */
const getAllHotels = async (req, res) => {
  try {
    const {
      location,
      checkIn,
      checkOut,
      guests,
      minPrice,
      maxPrice,
      rating,
      amenities,
      sortBy = 'rating',
      sortOrder = 'desc',
    } = req.query

    // Fetch all hotel owners with completed onboarding
    const owners = await HotelOwner.find({
      onboardingComplete: true,
      hotelName: { $exists: true, $ne: "" },
    }).select('name hotelName hotelDescription address city state pincode amenities rooms rating')

    // Transform owners to hotels format
    let hotels = owners.map((owner) => {
      // Calculate minimum room price for filtering (shows starting price)
      const minPrice = owner.rooms && owner.rooms.length > 0
        ? Math.min(...owner.rooms.map(r => r.price || 0))
        : 0

      // Count available rooms
      const availableRooms = owner.rooms?.filter(room => room.status === 'available').length || 0

      // Build location string
      const locationParts = []
      if (owner.city) locationParts.push(owner.city)
      if (owner.state) locationParts.push(owner.state)
      const locationString = locationParts.join(', ') || owner.address || 'India'

      // Generate a deterministic rating based on hotel name (for demo purposes)
      // In production, this would be actual reviews
      const nameHash = owner.hotelName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0
      const generatedRating = 4 + (nameHash % 10) / 10 // Rating between 4.0 and 4.9

      // Generate random review count (deterministic based on hotel name)
      const reviewCount = 100 + (nameHash % 500)

      // Map amenities to feature IDs
      const featureMap = {
        'wifi': 'wifi',
        'WiFi': 'wifi',
        'Free WiFi': 'wifi',
        'restaurant': 'restaurant',
        'Restaurant': 'restaurant',
        'parking': 'parking',
        'Parking': 'parking',
        'Valet Parking': 'parking',
        'spa': 'spa',
        'Spa': 'spa',
        'Spa & Wellness': 'spa',
        'pool': 'pool',
        'Pool': 'pool',
      }

      const features = (owner.amenities || []).map(a => featureMap[a] || a.toLowerCase()).filter(Boolean)

      // Get max guests from rooms
      const maxGuests = owner.rooms && owner.rooms.length > 0
        ? Math.max(...owner.rooms.map(r => r.maxGuests || 2))
        : 2

      return {
        id: owner._id.toString(),
        name: owner.hotelName || 'Hotel',
        location: locationString,
        price: minPrice,
        rating: generatedRating,
        reviews: reviewCount,
        image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`, // Placeholder image
        features: features.length > 0 ? features : ['wifi', 'restaurant'],
        availableRooms,
        guests: maxGuests,
        description: owner.hotelDescription || '',
        rooms: (owner.rooms || []).map((room, index) => ({
          id: room._id?.toString() || `room-${index}`,
          name: room.name,
          description: room.description || '',
          price: room.price,
          maxGuests: room.maxGuests || 2,
          beds: room.beds || '1 King Bed',
          size: room.size || '30 sqm',
          amenities: room.amenities || [],
          status: room.status || 'available',
          roomNumber: room.roomNumber || '',
          floor: room.floor || '',
        })),
      }
    })

    // Apply filters
    if (location) {
      const searchLower = location.toLowerCase()
      hotels = hotels.filter(hotel =>
        hotel.location.toLowerCase().includes(searchLower) ||
        hotel.name.toLowerCase().includes(searchLower)
      )
    }

    if (minPrice) {
      hotels = hotels.filter(hotel => hotel.price >= parseInt(minPrice))
    }

    if (maxPrice) {
      hotels = hotels.filter(hotel => hotel.price <= parseInt(maxPrice))
    }

    if (rating) {
      hotels = hotels.filter(hotel => hotel.rating >= parseFloat(rating))
    }

    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : amenities.split(',')
      hotels = hotels.filter(hotel =>
        amenityList.every(amenity => hotel.features.includes(amenity))
      )
    }

    if (guests) {
      hotels = hotels.filter(hotel => hotel.guests >= parseInt(guests))
    }

    // Sort hotels
    hotels = [...hotels].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'price') {
        comparison = a.price - b.price
      } else if (sortBy === 'rating') {
        comparison = a.rating - b.rating
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    res.status(200).json({
      success: true,
      message: "Hotels retrieved successfully",
      data: {
        hotels,
        count: hotels.length,
      },
    })
  } catch (error) {
    console.error("Get all hotels error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hotels",
      error: error.message,
    })
  }
}

/**
 * @desc    Get single hotel by ID (public endpoint)
 * @route   GET /api/hotels/:id
 * @access  Public
 */
const getHotelById = async (req, res) => {
  try {
    const owner = await HotelOwner.findById(req.params.id)

    if (!owner || !owner.onboardingComplete) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      })
    }

    // Calculate minimum room price
    const minPrice = owner.rooms && owner.rooms.length > 0
      ? Math.min(...owner.rooms.map(r => r.price || 0))
      : 0

    // Count available rooms
    const availableRooms = owner.rooms?.filter(room => room.status === 'available').length || 0

    // Build location string
    const locationParts = []
    if (owner.city) locationParts.push(owner.city)
    if (owner.state) locationParts.push(owner.state)
    const locationString = locationParts.join(', ') || owner.address || 'India'

    // Generate rating and reviews
    const nameHash = owner.hotelName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0
    const generatedRating = 4 + (nameHash % 10) / 10
    const reviewCount = 100 + (nameHash % 500)

    // Map amenities
    const featureMap = {
      'wifi': 'wifi',
      'WiFi': 'wifi',
      'Free WiFi': 'wifi',
      'restaurant': 'restaurant',
      'Restaurant': 'restaurant',
      'parking': 'parking',
      'Parking': 'parking',
      'Valet Parking': 'parking',
      'spa': 'spa',
      'Spa': 'spa',
      'Spa & Wellness': 'spa',
      'pool': 'pool',
      'Pool': 'pool',
    }

    const features = (owner.amenities || []).map(a => featureMap[a] || a.toLowerCase()).filter(Boolean)

    const maxGuests = owner.rooms && owner.rooms.length > 0
      ? Math.max(...owner.rooms.map(r => r.maxGuests || 2))
      : 2

    const hotel = {
      id: owner._id.toString(),
      name: owner.hotelName || 'Hotel',
      location: locationString,
      price: minPrice,
      rating: generatedRating,
      reviews: reviewCount,
      image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80`,
      features: features.length > 0 ? features : ['wifi', 'restaurant'],
      availableRooms,
      guests: maxGuests,
      description: owner.hotelDescription || '',
      address: owner.address,
      city: owner.city,
      state: owner.state,
      pincode: owner.pincode,
      website: owner.website,
      amenities: owner.amenities || [],
      checkInTime: owner.checkInTime || '14:00',
      checkOutTime: owner.checkOutTime || '11:00',
      cancellationPolicy: owner.cancellationPolicy || 'flexible',
      petPolicy: owner.petPolicy || 'not-allowed',
      rooms: (owner.rooms || []).map((room, index) => ({
        id: room._id?.toString() || `room-${index}`,
        name: room.name,
        description: room.description || '',
        price: room.price,
        maxGuests: room.maxGuests || 2,
        beds: room.beds || '1 King Bed',
        size: room.size || '30 sqm',
        amenities: room.amenities || [],
        status: room.status || 'available',
        roomNumber: room.roomNumber || '',
        floor: room.floor || '',
      })),
    }

    res.status(200).json({
      success: true,
      message: "Hotel retrieved successfully",
      data: hotel,
    })
  } catch (error) {
    console.error("Get hotel by ID error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve hotel",
      error: error.message,
    })
  }
}

module.exports = {
  getAllHotels,
  getHotelById,
}
