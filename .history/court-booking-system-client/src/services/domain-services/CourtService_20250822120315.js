import hotPocketService from "../common-services/HotPocketService";

class CourtService {
  // Add a new court with 3 images
  async addCourt(courtData) {
    if (!courtData.imageUrls?.length) {
      throw new Error("Image URLs are required.");
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
        Description: courtData.description || null,
        Image1: courtData.imageUrls[0] || null,
        Image2: courtData.imageUrls[1] || null,
        Image3: courtData.imageUrls[2] || null,
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

  // Update court details with 3 images and availability
  async updateCourt(courtId, updatedData) {
    if (!courtId || !updatedData) {
      throw new Error("Court ID and updated data are required.");
    }
    const message = {
      type: "Court",
      subType: "editCourt",
      data: {
        courtId,
        updatedData: {
          Name: updatedData.name,
          Location: updatedData.location,
          Type: updatedData.sport,
          PricePerHour: Number(updatedData.price),
          Email: updatedData.email,
          Availability: updatedData.availability || [],
          Description: updatedData.description || null,
          Image1: updatedData.imageUrls?.[0] || null,
          Image2: updatedData.imageUrls?.[1] || null,
          Image3: updatedData.imageUrls?.[2] || null,
          AvailableDate: updatedData.AvailableDate || null,
          AvailableStartTime: updatedData.AvailableStartTime || null,
          AvailableEndTime: updatedData.AvailableEndTime || null,
        },
      },
    };

    return await hotPocketService.getServerInputResponse(message);
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

  // Add availability
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
  async confirmBooking(CourtId) {
    if (!CourtId) {
      throw new Error("Booking ID is required to confirm a booking.");
    }

    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "confirmBooking",
      data: { CourtId },
    });
  }

  // Get user bookings
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
  async cancelBooking({ bookingId, reason }) {
    if (!bookingId || !reason) {
      throw new Error("Booking ID and reason are required.");
    }

    return await hotPocketService.getServerInputResponse({
      type: "Court",
      subType: "cancelBooking",
      data: { bookingId, reason },
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

  // Get court booking stats
  async getCourtBookingStats() {
    const message = {
      type: "Court",
      subType: "getCourtBookingStats",
      data: {},
    };

    const response = await hotPocketService.getServerReadReqResponse(message);
    console.log("[CourtService] getCourtBookingStats response:", response);

    // Return the array of stats or empty array if undefined
    return response.success || [];
  }
}

export default new CourtService();