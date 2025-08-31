import { Tables } from "../Constants/Tables";

const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const settings = require("../settings.json").settings;

// Load environment variables
require("dotenv").config();

export class DBInitializer {
    static #db = null;

    static async init() {
        this.#db = new sqlite3.Database(settings.dbPath);

        // Get email from environment variable
        const userEmail = process.env.USER_EMAIL || 'thameeshisenade@gmail.com';

        // Create User table
        await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.USER} (
            Id INTEGER,
            XrplAddress TEXT NOT NULL UNIQUE,
            Email TEXT NOT NULL,
            Name TEXT NOT NULL,
            UserRole TEXT NOT NULL,
            Description TEXT,
            Lat REAL,
            Lng REAL,
            PRIMARY KEY("Id" AUTOINCREMENT)
        )`);

        // Create Court table with new fields
        await this.#runQuery(`
            CREATE TABLE IF NOT EXISTS ${Tables.COURT} (
                Id INTEGER,
                Name TEXT NOT NULL,
                Location TEXT NOT NULL,
                Type TEXT NOT NULL,
                PricePerHour REAL NOT NULL,
                Email TEXT NOT NULL,
                Description TEXT,
                Availability TEXT NOT NULL,
                Image TEXT,
                OwnerID INTEGER NOT NULL,
                AvailableDate TEXT,
                AvailableStartTime TEXT,
                AvailableEndTime TEXT,
                PRIMARY KEY("Id" AUTOINCREMENT)
            )
        `);

        await this.#runQuery(`
        CREATE TABLE IF NOT EXISTS MintedNFTs (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            CourtId INTEGER NOT NULL,
            NFTokenID TEXT NOT NULL,
            AvailableDate TEXT NOT NULL,
            AvailableStartTime TEXT NOT NULL,
            AvailableEndTime TEXT NOT NULL,
            MintedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
        `);


        // Insert dummy court data with new fields
        const courtList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM ${Tables.COURT}`);
        if (courtList[0].count === 0) {
            await this.#runQuery(`INSERT INTO ${Tables.COURT} 
                (Name, Location, Type, PricePerHour, Email, Description, Availability, Image, OwnerID, AvailableDate, AvailableStartTime, AvailableEndTime) 
                VALUES 
                ('Badminton Court A', 'Huskies Basketball Court', 'Badminton', 10.00, 'thameeshisenade@gmail.com', 'Indoor court with wooden flooring', 'Available', 'badminton court.jpg', 1, '2025-05-10', '09:00', '17:00'),
                ('Tennis Court B', 'Shuttle Power Sports Complex', 'Tennis', 15.00, 'thameeshisenade@gmail.com', 'Outdoor hard court', 'Booked', 'pickleBall island.jpg', 1, '2025-05-11', '08:00', '18:00'),
                ('Futsal Court C', 'Blues Basketball Complex', 'Futsal', 20.00, 'thameeshisenade@gmail.com', 'Artificial turf futsal court', 'Available', 'volleyball-court-construction.jpg', 1, '2025-05-12', '10:00', '20:00')
            `);
        }

        // Create bookings table
        await this.#runQuery(`
            CREATE TABLE IF NOT EXISTS bookings (
                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                UserEmail TEXT NOT NULL,
                CourtId INTEGER NOT NULL,
                Date TEXT NOT NULL,
                StartTime TEXT NOT NULL,
                EndTime TEXT NOT NULL,
                Status TEXT NOT NULL,
                BookingType TEXT DEFAULT 'Practice',
                CancellationReason TEXT
            )
        `);

        // Insert dummy bookings
const bookingList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM bookings`);
if (bookingList[0].count === 0) {
    const courts = await this.#runSelectQuery(`SELECT Id FROM ${Tables.COURT}`);
    if (courts.length > 0) {
        const now = new Date();

        const insertValues = courts.slice(0, 2).map((court, index) => {
            const bookingDate = new Date(now);
            bookingDate.setDate(now.getDate() + index);
            const date = bookingDate.toISOString().split("T")[0];
            const startTime = "10:00";
            const endTime = "11:00";

            return `('${userEmail}', ${court.Id}, '${date}', '${startTime}', '${endTime}', 'Active', 'Practice')`;
        }).join(",");

        await this.#runQuery(`
            INSERT INTO bookings (UserEmail, CourtId, Date, StartTime, EndTime, Status, BookingType)
            VALUES ${insertValues}
        `);
    }
}


        this.#db.close();
    }

    static #runQuery(query, params = null) {
        return new Promise((resolve, reject) => {
            this.#db.run(query, params ? params : [], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ lastId: this.lastID, changes: this.changes });
            });
        });
    }

    static #runSelectQuery(query, params = null) {
        return new Promise((resolve, reject) => {
            this.#db.all(query, params ? params : [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
}
