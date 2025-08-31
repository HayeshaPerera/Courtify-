import { Tables } from "../../Constants/Tables";
const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;

export class UserService {
	#message = null;
	#dbPath = settings.dbPath;
	#dbContext = null;

	constructor(message) {
		this.#message = message;
		this.#dbContext = new SqliteDatabase(this.#dbPath);
	}

	async registerUser() {
		let resObj = {};
		resObj.reqId = this.#message.reqId;

		try {
			this.#dbContext.open();
			const data = this.#message.data;

			const userEntity = {
				xrplAddress: data.xrplAddress,
				email: data.email,
				name: data.name,
				userRole: data.userRole,
			};

			const rowId = await this.#dbContext.insertValue(Tables.USER, userEntity);
			resObj.success = { message: "Registered user successfully", rowId: rowId };
			return resObj;
		} catch (error) {
			// Handle the error
			console.log("Error during user registration:", error.message);
			resObj.error = "Error registering user.";
			return resObj;
		} finally {
			this.#dbContext.close();
		}
	}

	async getUserList() {
		let resObj = {};
		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER`;

			let userRows = await this.#dbContext.runSelectQuery(query);

			console.log(userRows);

			if (!(userRows && userRows.length > 0)) {
				resObj.success = null;
				return resObj;
			}
			resObj.success = userRows;
			return resObj;
		} catch (error) {
			console.log("Error in listing users: ", error.message);
			resObj.error = "Error in listing users.";
			return resObj;
		} finally {
			this.#dbContext.close();
		}
	}

	async checkIfUserExists() {
		let resObj = {};
		const email = this.#message.data?.email;
		console.log("checkIfUserExists user email: ", email);

		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER WHERE Email = ?`;
			let userRows = await this.#dbContext.runSelectQuery(query, [email]);
			console.log("userRows: ", userRows);

			if (!(userRows && userRows.length > 0)) {
				resObj.success = false; // Indicates user not found
				return resObj;
			}
			resObj.success = true; // Indicates user exists
			resObj.user = userRows[0]; // Return the user data if found
			return resObj;
		} catch (error) {
			console.log("Error in checking user: ", error.message); // Log error message
			resObj.error = "Error in checking user.";
			return resObj;
		} finally {
			this.#dbContext.close();
		}
	}


	async deleteUser() {
  let resObj = {};
  const id = this.#message.data?.id;

  try {
    await this.#dbContext.open();

    let query = `DELETE FROM USER WHERE Id = ?`;
    await this.#dbContext.runQuery(query, [id]);

    resObj.success = { message: "User deleted successfully" };
    return resObj;
  } catch (error) {
    console.log("Error in deleting user: ", error.message);
    resObj.error = "Error in deleting user.";
    return resObj;
  } finally {
    this.#dbContext.close();
  }
}



	


	async getFoodRecipientList() {
		let resObj = {};

		try {
			await this.#dbContext.open();

			let query = `SELECT * FROM USER WHERE UserRole = 'FoodRecipient'`;

			let userRows = await this.#dbContext.runSelectQuery(query);

			if (!(userRows && userRows.length > 0)) {
				resObj.success = null;
				return resObj;
			}
			resObj.success = userRows;
			return resObj;
		} catch (error) {
			console.log("Error in listing food recipients: ", error.message);
			resObj.error = "Error in listing food recipients.";
			return resObj;
		} finally {
			this.#dbContext.close();
		}
	}
}
