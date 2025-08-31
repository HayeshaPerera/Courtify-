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

            // 1. Check for overlap
            const overlapQuery = `
                SELECT * FROM bookings
                WHERE CourtId = ? AND Date = ?
                  AND StartTime < ? AND EndTime > ?
            `;
            this.#db.all(
                overlapQuery,
                [CourtId, Date, EndTime, StartTime],
                (err, rows) => {
                    if (err) {
                        console.error("Error checking for overlapping bookings:", err.message);
                        reject(err);
                    } else if (rows.length > 0) {
                        // Overlap found
                        reject(new Error("This time slot is already booked."));
                    } else {
                        // 2. If no overlap, proceed to insert booking as usual
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
                    }
                }
            );
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