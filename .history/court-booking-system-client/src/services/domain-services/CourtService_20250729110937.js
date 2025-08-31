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
    return await hotPocketService.getServerReadReqResponse({
      type: "Court",
      subType: "getCourtById",
      data: { courtId },
    });
  }

  // Get courts by owner email
  async getCourtByOwner(ownerEmail) {
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

  // ✅ FIXED: Update court details using subType "editCourt"
  async updateCourt(courtId, updatedData) {
    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "editCourt", // ✅ MUST match backend
      data: { courtId, updatedData },
    });
  }

  // Delete court
  async deleteCourt(courtId) {
    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "deleteCourt",
      data: { courtId },
    });
  }

  // Add availability to court
  async addAvailability(availabilityData) {
    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "addAvailability",
      data: availabilityData,
    });
  }

  // Create booking
  async createBooking(bookingData) {
    if (
      !bookingData.UserEmail ||
      !bookingData.CourtId ||
      !bookingData.Date ||
      !bookingData.StartTime ||
      !bookingData.EndTime
    ) {
      throw new Error(
        "Missing required fields: UserEmail, CourtId, Date, StartTime, or EndTime."
      );
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
      throw new Error("CourtId and date are required to fetch bookings.");
    }
    return await hotPocketService.getServerReadReqResponse({
      type: "Court",
      subType: "getCourtBookingsByDate",
      data: { CourtId: courtId, Date: date },
    });
  }

  // Mint NFT on server
  async mintNFTOnServer(mintData) {
    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "mintNFT",
      data: mintData,
    });
  }
}

export default new CourtService();
