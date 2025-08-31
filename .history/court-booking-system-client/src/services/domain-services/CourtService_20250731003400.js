import hotPocketService from "../common-services/HotPocketService";

class CourtService {
  // Add a new court
  async addCourt(courtData) {
    if (!courtData.imageUrl) {
      throw new Error("Image URL is required.");
    }

    const message = {
      type: "Court",
      subType: "addCourt",
      data: {
        Name: courtData.name,
        Location: courtData.location,
        Type: courtData.sport,
        PricePerHour: Number(courtData.price),
        Email: courtData.email,
        Availability: courtData.availability || [],
        MoreDetails: courtData.moreDetails || null,
        Image: courtData.imageUrl,
      },
    };

    return await hotPocketService.getServerInputResponse(message);
  }

  // Get all courts
  async getAllCourts() {
    return await hotPocketService.getServerReadReqResponse({
      type: "Court",
      subType: "getAllCourts",
    });
  }

  // Get court by ID
  async getCourtById(courtId) {
    if (!courtId) throw new Error("Court ID is required.");
    return await hotPocketService.getServerReadReqResponse({
      type: "Court",
      subType: "getCourtById",
      data: { courtId },
    });
  }

  // Get courts by owner email
  async getCourtByOwner(ownerEmail) {
    if (!ownerEmail) throw new Error("Owner email is required.");
    return await hotPocketService.getServerReadReqResponse({
      type: "Court",
      subType: "getCourtByOwner",
      data: { email: ownerEmail },
    });
  }

  // Alias for getting courts owned by current user
  async getMyCourts(email) {
    return this.getCourtByOwner(email);
  }

  // Update court details
  async updateCourt(courtId, updatedData) {
    if (!courtId || !updatedData) {
      throw new Error("Court ID and updated data are required.");
    }

    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "editCourt",
      data: { courtId, updatedData },
    });
  }

  // Delete court
  async deleteCourt(courtId) {
    if (!courtId) throw new Error("Court ID is required.");
    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "deleteCourt",
      data: { courtId },
    });
  }

  // Add availability to court
  async addAvailability(availabilityData) {
    if (!availabilityData || !availabilityData.CourtId) {
      throw new Error("Availability data with CourtId is required.");
    }

    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "addAvailability",
      data: availabilityData,
    });
  }

  // Create booking
  async createBooking(bookingData) {
    const requiredFields = ["UserEmail", "CourtId", "Date", "StartTime", "EndTime"];
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "createBooking",
      data: bookingData,
    });
  }

  // Confirm booking
  async confirmBooking(bookingId) {
    if (!bookingId) {
      throw new Error("Booking ID is required to confirm a booking.");
    }

    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "confirmBooking",
      data: { bookingId },
    });
  }

  // Get bookings for a user
  async getUserBookings(userEmail) {
    if (!userEmail) {
      throw new Error("UserEmail is required to fetch bookings.");
    }

    return await hotPocketService.getServerReadReqResponse({
      type: "Court",
      subType: "getUserBookings",
      data: { UserEmail: userEmail },
    });
  }

  // Get all bookings for a court on a specific date
  async getCourtBookingsByDate(courtId, date) {
    if (!courtId || !date) {
      throw new Error("CourtId and Date are required to fetch court bookings.");
    }

    return await hotPocketService.getServerReadReqResponse({
      type: "Court",
      subType: "getCourtBookingsByDate",
      data: { CourtId: courtId, Date: date },
    });
  }

  // Cancel booking
async cancelBooking(cancelData) {
  const { CourtId, reason } = cancelData;

  if (!CourtId || !reason) {
    throw new Error("Booking ID and reason are required.");
  }

  return await hotPocketService.getServerInputResponse({
    type: "Court",
    subType: "cancelBooking",
    data: { CourtId, reason },
  });
}


  // Mint NFT on server
  async mintNFTOnServer(mintData) {
    if (!mintData || !mintData.bookingId) {
      throw new Error("Mint data with bookingId is required.");
    }

    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "mintNFT",
      data: mintData,
    });
  }
}

export default new CourtService();
