const sqlite3 = require("sqlite3").verbose();
const settings = require("../../settings.json").settings;

export class AdminService {
  #db;

  constructor() {
    this.#db = new sqlite3.Database(settings.dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Connected to SQLite database (AdminService).");
      }
    });
  }

  // Remove user by email or ID
  async removeUser(userIdentifier) {
    return new Promise((resolve, reject) => {
      const query = typeof userIdentifier === "string"
        ? "DELETE FROM USERS WHERE Email = ?"
        : "DELETE FROM USERS WHERE Id = ?";
      
      this.#db.run(query, [userIdentifier], function (err) {
        if (err) {
          console.error("Error removing user:", err.message);
          reject(err);
        } else {
          resolve({ success: true, deletedRows: this.changes });
        }
      });
    });
  }

  // Remove court by ID
  async removeCourt(courtId) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM COURT WHERE Id = ?";

      this.#db.run(query, [courtId], function (err) {
        if (err) {
          console.error("Error removing court:", err.message);
          reject(err);
        } else {
          resolve({ success: true, deletedRows: this.changes });
        }
      });
    });
  }

  // Optional: List all users
  async getAllUsers() {
    return new Promise((resolve, reject) => {
      const query = "SELECT Id, Name, Email FROM USERS";
      this.#db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Error fetching users:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Optional: List all courts
  async getAllCourts() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM COURT";
      this.#db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Error fetching courts:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Optional: Remove pending court (if you store them in a separate table)
  async removePendingCourt(pendingCourtId) {
    return new Promise((resolve, reject) => {
      const query = "DELETE FROM PendingCourts WHERE Id = ?";
      this.#db.run(query, [pendingCourtId], function (err) {
        if (err) {
          console.error("Error removing pending court:", err.message);
          reject(err);
        } else {
          resolve({ success: true, deletedRows: this.changes });
        }
      });
    });
  }
}
