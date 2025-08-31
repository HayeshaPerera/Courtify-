const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
const { Tables } = require("../../Constants/Tables");

class CourtService {
  #message = null;
  #dbPath = settings.dbPath;
  #dbContext = null;

  constructor(message) {
    this.#message = message;
    this.#dbContext = new SqliteDatabase(this.#dbPath);
  }

  async addCourt(data) {
    const resObj = { reqId: this.#message.reqId };

    try {
      if (
        !data.Name ||
        !data.Location ||
        !data.Type ||
        data.PricePerHour === undefined ||
        !data.Email ||
        !data.Availability
      ) {
        throw new Error(
          "Missing required fields: Name, Location, Type, PricePerHour, Email, or Availability."
        );
      }

      await this.#dbContext.open();

      const ownerQuery = `SELECT Id FROM ${Tables.USER} WHERE Email = ?`;
      const ownerResult = await this.#dbContext.runSelectQuery(ownerQuery, [data.Email]);

      if (!ownerResult || ownerResult.length === 0) {
        throw new Error(`No user found with email: ${data.Email}.`);
      }

      const ownerId = ownerResult[0].Id;

      const insertQuery = `
        INSERT INTO ${Tables.COURT} 
        (Name, Location, Type, PricePerHour, Email, description, Availability, Image1, Image2, Image3, OwnerID, AvailableDate, AvailableStartTime, AvailableEndTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const rowValues = [
        data.Name,
        data.Location,
        data.Type,
        data.PricePerHour,
        data.Email,
        data.description || null,
        data.Availability,
        data.Image1 || null,
        data.Image2 || null,
        data.Image3 || null,
        ownerId,
        data.AvailableDate || null,
        data.AvailableStartTime || null,
        data.AvailableEndTime || null,
      ];

      const result = await this.#dbContext.runQuery(insertQuery, rowValues);

      resObj.success = {
        message: "Court added successfully",
        courtId: result.lastID,
        changes: result.changes,
      };
      return resObj;
    } catch (error) {
      console.log("Error in adding court:", error);
      resObj.error = `Error in adding court: ${error.message}`;
      return resObj;
    } finally {
      this.#dbContext.close();
    }
  }

  // The rest of your class remains unchanged...
  // Make sure your COURT table schema includes Image1, Image2, Image3 columns

  async editCourt(courtId, updatedData) {
    const resObj = { reqId: this.#message.reqId };

    try {
      await this.#dbContext.open();

      const fields = [];
      const values = [];

      for (const key in updatedData) {
        fields.push(`${key} = ?`);
        values.push(updatedData[key]);
      }
      values.push(courtId);

      const updateQuery = `UPDATE ${Tables.COURT} SET ${fields.join(", ")} WHERE Id = ?`;
      const updateResult = await this.#dbContext.runQuery(updateQuery, values);

      resObj.success = updateResult.changes > 0 ? "Court updated successfully." : "No changes made.";
      return resObj;
    } catch (error) {
      console.log("Error in editing court:", error);
      resObj.error = `Error in editing court: ${error.message}`;
      return resObj;
    } finally {
      this.#dbContext.close();
    }
  }

  async deleteCourt(courtId) {
    const resObj = { reqId: this.#message.reqId };

    try {
      await this.#dbContext.open();

      const deleteQuery = `DELETE FROM ${Tables.COURT} WHERE Id = ?`;
      const result = await this.#dbContext.runQuery(deleteQuery, [courtId]);

      resObj.success = result.changes > 0 ? "Court deleted successfully." : "No court found to delete.";
      return resObj;
    } catch (error) {
      console.log("Error in deleting court:", error);
      resObj.error = `Error in deleting court: ${error.message}`;
      return resObj;
    } finally {
      this.#dbContext.close();
    }
  }

  async getAllCourts() {
    const resObj = {};

    try {
      await this.#dbContext.open();

      const query = `SELECT * FROM ${Tables.COURT}`;
      const courts = await this.#dbContext.runSelectQuery(query);

      resObj.success = courts.length > 0 ? courts : null;
      return resObj;
    } catch (error) {
      console.log("Error in retrieving courts:", error);
      resObj.error = `Error in retrieving courts: ${error.message}`;
      return resObj;
    } finally {
      this.#dbContext.close();
    }
  }

  async getCourtByOwner(email) {
    if (!email) throw new Error("Email is required to fetch courts.");

    try {
      await this.#dbContext.open();

      const query = `SELECT * FROM ${Tables.COURT} WHERE Email = ?`;
      const courts = await this.#dbContext.runSelectQuery(query, [email]);

      if (courts.length === 0) {
        return { success: null, message: "No courts found for the provided email." };
      }
      return { success: courts };
    } catch (error) {
      console.error("Error fetching courts:", error.message);
      return { success: null, message: "An error occurred while fetching courts." };
    } finally {
      this.#dbContext.close();
    }
  }

  async addAvailability(data) {
    const resObj = { reqId: this.#message.reqId };

    try {
      await this.#dbContext.open();

      if (!data.courtId || !data.AvailableDate || !data.AvailableStartTime || !data.AvailableEndTime) {
        throw new Error("Missing required fields: courtId, AvailableDate, AvailableStartTime, AvailableEndTime.");
      }

      const updateQuery = `
        UPDATE ${Tables.COURT}
        SET AvailableDate = ?, AvailableStartTime = ?, AvailableEndTime = ?
        WHERE Id = ?
      `;

      const values = [data.AvailableDate, data.AvailableStartTime, data.AvailableEndTime, data.courtId];
      const result = await this.#dbContext.runQuery(updateQuery, values);

      resObj.success = result.changes > 0 ? "Availability updated successfully." : "No changes made.";
      return resObj;
    } catch (error) {
      console.log("Error in adding availability:", error);
      resObj.error = `Error in adding availability: ${error.message}`;
      return resObj;
    } finally {
      this.#dbContext.close();
    }
  }

  async saveMintedNFT(data) {
    const resObj = { reqId: this.#message.reqId };

    try {
      await this.#dbContext.open();

      const insertQuery = `
        INSERT INTO MintedNFTs (CourtId, NFTokenID, AvailableDate, AvailableStartTime, AvailableEndTime)
        VALUES (?, ?, ?, ?, ?)
      `;

      const values = [data.courtId, data.NFTokenID, data.AvailableDate, data.AvailableStartTime, data.AvailableEndTime];
      const result = await this.#dbContext.runQuery(insertQuery, values);

      resObj.success = { message: "NFT minting data saved", nftId: result.lastID };
      return resObj;
    } catch (error) {
      console.log("Error saving NFT:", error);
      resObj.error = `Error saving NFT data: ${error.message}`;
      return resObj;
    } finally {
      this.#dbContext.close();
    }
  }



  
}

module.exports = CourtService;
