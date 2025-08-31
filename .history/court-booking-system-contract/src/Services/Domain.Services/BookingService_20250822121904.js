const sqlite3 = require("sqlite3").verbose();
const settings = require("../../settings.json").settings;

export class BookingService {
  #db;
  message;

  constructor(message) {
    this.message = message;
    this.#db = new sqlite3.Database(settings.dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Connected to SQLite database.");
      }
    });
  }

  async createBooking(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO bookings (UserEmail, CourtId, Date, StartTime, EndTime, Status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
      `;

      const { UserEmail, CourtId, Date, StartTime, EndTime } = data;

      if (!UserEmail || !CourtId || !Date || !StartTime || !EndTime) {
        return reject(new Error("Missing booking fields"));
      }

      this.#db.run(query, [UserEmail, CourtId, Date, StartTime, EndTime], function (err) {
        if (err) {
          console.error("Error inserting booking:", err.message);
          reject(err);
        } else {
          resolve({
            success: true,
            bookingId: this.lastID,
          });
        }
      });
    });
  }

  async getUserBookings(userEmail) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*, c.Name AS CourtName
        FROM bookings b
        LEFT JOIN COURT c ON b.CourtId = c.Id
        WHERE b.UserEmail = ?
        ORDER BY b.Date DESC, b.StartTime ASC
      `;

      this.#db.all(query, [userEmail], (err, rows) => {
        if (err) {
          console.error("Error fetching bookings:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getCourtBookingStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT
          c.Name AS courtName,
          COUNT(b.Id) AS bookings,
          b.UserEmail,
          b.Date,
          b.StartTime,
          b.EndTime
        FROM COURT c
        LEFT JOIN bookings b ON c.Id = b.CourtId
        GROUP BY c.Id, b.UserEmail, b.Date, b.StartTime, b.EndTime
        ORDER BY bookings DESC
      `;

      this.#db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Error fetching booking stats:", err.message);
          reject({
            error: "Error fetching booking statistics.",
            details: err.message,
          });
        } else {
          const mappedRows = rows.map((row) => ({
            courtName: row.courtName,
            bookings: Number(row.bookings) || 0,
            userEmail: row.UserEmail,
            date: row.Date,
            startTime: row.StartTime,
            endTime: row.EndTime,
          }));

          resolve({
            reqId: this.message?.reqId,
            success: mappedRows,
          });
        }
      });
    });
  }

  async cancelBooking(bookingId, reason) {
    return new Promise((resolve, reject) => {
      const updateQuery = `
        UPDATE bookings
        SET Status = 'Cancelled', CancellationReason = ?
        WHERE Id = ? AND Status IN ('Active', 'Pending', 'Confirmed')
      `;

      this.#db.run(updateQuery, [reason, bookingId], function (err) {
        if (err) {
          console.error("Error cancelling booking:", err.message);
          reject(err);
        } else if (this.changes === 0) {
          resolve({ success: false, message: "No cancellable booking found for this booking ID." });
        } else {
          resolve({ success: true, message: "Booking cancelled successfully." });
        }
      });
    });
  }

  async getCourtBookingsByDate(courtId, date) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT b.*, c.Name AS CourtName
        FROM bookings b
        LEFT JOIN COURT c ON b.CourtId = c.Id
        WHERE b.CourtId = ? AND b.Date = ?
        ORDER BY b.StartTime ASC
      `;
      this.#db.all(query, [courtId, date], (err, rows) => {
        if (err) {
          console.error("Error fetching court bookings by date:", err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

