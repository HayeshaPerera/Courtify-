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
                        bookingId: this.lastID
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