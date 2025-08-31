import CourtService from "../Services/Domain.Services/CourtService.js";
import { BookingService } from "../Services/Domain.Services/BookingService.js";

export class CourtController {
  #message = null;
  #courtService = null;
  #bookingService = null;

  constructor(message) {
    this.#message = message;
    this.#courtService = new CourtService(message);
    this.#bookingService = new BookingService(message);
    console.log("[CourtController] Services initialized.");
  }

  async handleRequest() {
    try {
      const subType = this.#message?.subType;
      const data = this.#message?.data;

      console.log("[CourtController] Received subType:", subType);

      switch (subType) {
        // COURT MANAGEMENT
        case "addCourt":
          if (!data || Object.keys(data).length === 0) {
            return { error: "Data for court is missing.", request: this.#message };
          }
          return await this.#courtService.addCourt(data);

        case "editCourt":
          if (!data?.courtId || !data?.updatedData) {
            return { error: "Missing 'courtId' or 'updatedData'." };
          }
          return await this.#courtService.editCourt(data.courtId, data.updatedData);

        case "deleteCourt":
          if (!data?.courtId) {
            return { error: "Missing 'courtId'." };
          }
          return await this.#courtService.deleteCourt(data.courtId);

        case "getAllCourts":
          return await this.#courtService.getAllCourts();

        case "getCourtByOwner":
          if (!data?.email) {
            return { error: "Missing owner email." };
          }
          return await this.#courtService.getCourtByOwner(data.email);

        // AVAILABILITY
        case "addAvailability":
          if (!data?.courtId || !data?.AvailableDate || !data?.AvailableStartTime || !data?.AvailableEndTime) {
            return { error: "Missing required fields for availability." };
          }
          return await this.#courtService.addAvailability(data);

        // NFT MINTING
        case "mintNFT":
          if (!data?.courtId || !data?.NFTokenID || !data?.AvailableDate || !data?.AvailableStartTime || !data?.AvailableEndTime) {
            return { error: "Missing NFT minting fields." };
          }
          return await this.#courtService.saveMintedNFT(data);

        // BOOKING MANAGEMENT
        case "createBooking":
          if (!data?.CourtId || !data?.UserEmail || !data?.Date || !data?.StartTime || !data?.EndTime) {
            return { error: "Missing booking fields." };
          }
          return await this.#bookingService.createBooking(data);

        case "getUserBookings":
          if (!data?.UserEmail) {
            return { error: "Missing 'UserEmail' for booking retrieval." };
          }
          return await this.#bookingService.getUserBookings(data.UserEmail);

        case "getCourtBookingsByDate":
          if (!data?.CourtId || !data?.Date) {
            return { error: "Missing CourtId or Date." };
          }
          return await this.#bookingService.getCourtBookingsByDate(data.CourtId, data.Date);

        case "cancelBooking":
          if (!data?.bookingId || !data?.reason) {
            return { error: "Missing bookingId or reason for cancellation." };
          }
          return await this.#bookingService.cancelBooking(data.bookingId, data.reason);

        // COURT BOOKING STATS
        case "getCourtBookingStats":
          return await this.#bookingService.getCourtBookingStats();

        // DEFAULT (unknown subType)
        default:
          console.error("[CourtController] Invalid subType received:", subType);
          return {
            error: "Invalid request subType.",
            request: this.#message,
          };
      }
    } catch (err) {
      console.error("[CourtController] Error:", err);
      return {
        error: err.message || "An unexpected error occurred.",
        request: this.#message,
      };
    }
  }
}