import { AdminService } from "../Services/Domain.Services/AdminService.js";

export class AdminController {
	#message = null;
	#service = null;

	constructor(message) {
		this.#message = message;
		this.#service = new AdminService();
		console.log("[AdminController] Service initialized.");
	}

	async handleRequest() {
		try {
			const subType = this.#message?.subType;
			const data = this.#message?.data;

			console.log("[AdminController] Received subType:", subType);

			switch (subType) {
				case "removeUser":
					if (!data?.userIdentifier) {
						return { error: "Missing 'userIdentifier'." };
					}
					return await this.#service.removeUser(data.userIdentifier);

				case "removeCourt":
					if (!data?.courtId) {
						return { error: "Missing 'courtId'." };
					}
					return await this.#service.removeCourt(data.courtId);

				case "removePendingCourt":
					if (!data?.pendingCourtId) {
						return { error: "Missing 'pendingCourtId'." };
					}
					return await this.#service.removePendingCourt(data.pendingCourtId);

				case "getAllUsers":
					return await this.#service.getAllUsers();

				case "getAllCourts":
					return await this.#service.getAllCourts();

				default:
					console.error("[AdminController] Invalid subType:", subType);
					return { error: "Invalid request subType.", request: this.#message };
			}
		} catch (err) {
			console.error("[AdminController] Error:", err);
			return {
				error: err.message || "An unexpected error occurred.",
				request: this.#message
			};
		}
	}
}
