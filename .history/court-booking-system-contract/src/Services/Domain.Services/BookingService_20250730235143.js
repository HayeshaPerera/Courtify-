const sqlite3 = require("sqlite3").verbose();
const settings = require("../../settings.json").settings;

export class BookingService {
    #db;

    constructor(message) {
        this.#db = new sqlite3.Database(settings.dbPath, (err) => {
            if (err) {
                console.error("Error opening database:", err.message);
            } else {
                console.log("Connected to SQLite database.");
            }
        });
    }

    async createBooking(newBooking) {
        return new Promise(async (resolve, reject) => {
            const { UserEmail, CourtId, Date, StartTime, EndTime } = newBooking;

            if (!UserEmail || !CourtId || !Date || !StartTime || !EndTime) {
                return reject(new Error("Missing booking fields"));
            }

            try {
                const existingBookings = await this.getCourtBookingsByDate(CourtId, Date);

                // Check for overlap
                const isOverlapping = existingBookings.some(booking =>
                    StartTime < booking.EndTime && EndTime > booking.StartTime
                );

                if (isOverlapping) {
                    return reject(new Error("This time slot is already booked."));
                }

                // No overlap found — insert booking
                const insertQuery = `
                    INSERT INTO bookings (UserEmail, CourtId, Date, StartTime, EndTime, Status)
                    VALUES (?, ?, ?, ?, ?, 'Pending')
                `;
                this.#db.run(
                    insertQuery,
                    [UserEmail, CourtId, Date, StartTime, EndTime],
                    function (insertErr) {
                        if (insertErr) {
                            console.error("Error inserting booking:", insertErr.message);
                            reject(insertErr);
                        } else {
                            resolve({
                                success: true,
                                bookingId: this.lastID
                            });
                        }
                    }
                );
            } catch (err) {
                console.error("Error during booking creation:", err.message);
                reject(err);
            }
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

    async cancelBooking(bookingId, reason) {
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE bookings
      SET Status = 'Cancelled', CancellationReason = ?
      WHERE Id = ?
    `;

    this.#db.run(updateQuery, [reason, bookingId], function (err) {
      if (err) {
        console.error("Error cancelling booking:", err.message);
        reject(err);
      } else if (this.changes === 0) {
        resolve({ success: false, message: "Booking not found." });
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
