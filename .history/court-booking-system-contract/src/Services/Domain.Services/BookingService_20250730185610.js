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

    // ✅ Create a new booking after checking for overlaps
    async createBooking(newBooking) {
        return new Promise(async (resolve, reject) => {
            const { UserEmail, CourtId, Date, StartTime, EndTime } = newBooking;

            if (!UserEmail || !CourtId || !Date || !StartTime || !EndTime) {
                return reject(new Error("Missing booking fields"));
            }

            try {
                const overlappingBookings = await this.getCourtBookingsByDate(CourtId, Date, StartTime, EndTime);
                if (overlappingBookings.length > 0) {
                    return reject(new Error("This time slot is already booked."));
                }

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
                reject(err);
            }
        });
    }

    // ✅ Fetch bookings for a specific user
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

    // ✅ Fetch bookings for a court on a specific date, optionally checking for overlap
    async getCourtBookingsByDate(courtId, date, startTime = null, endTime = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT b.*, c.Name AS CourtName
                FROM bookings b
                LEFT JOIN COURT c ON b.CourtId = c.Id
                WHERE b.CourtId = ? AND b.Date = ?
            `;
            const params = [courtId, date];

            // Only check overlaps if both times are provided
            if (startTime && endTime) {
                query += ` AND b.StartTime < ? AND b.EndTime > ?`;
                params.push(endTime, startTime);
            }

            query += ` ORDER BY b.StartTime ASC`;

            this.#db.all(query, params, (err, rows) => {
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
