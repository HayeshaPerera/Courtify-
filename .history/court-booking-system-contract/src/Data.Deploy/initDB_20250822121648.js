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
    const userEmail = process.env.USER_EMAIL || 'default@example.com';

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

    // Insert Admin user if not exists
    const adminEmail = "admin@example.com";
    const adminExists = await this.#runSelectQuery(
      `SELECT COUNT(*) as count FROM ${Tables.USER} WHERE Email = ?`,
      [adminEmail]
    );
    if (adminExists[0].count === 0) {
      await this.#runQuery(
        `INSERT INTO ${Tables.USER} 
          (XrplAddress, Email, Name, UserRole, Description, Lat, Lng) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          "rADMINXRPLADDRESS",
          adminEmail,
          "System Administrator",
          "admin",
          "Default admin user",
          0,
          0,
        ]
      );
    }

    // ✅ Insert dummy users if not already present
    const userCount = await this.#runSelectQuery(
      `SELECT COUNT(*) as count FROM ${Tables.USER} WHERE Email != ?`,
      [adminEmail]
    );
    if (userCount[0].count === 0) {
      const dummyUsers = [
        {
          xrpl: "rUSER1XRPLADDRESS",
          email: "john.doe@example.com",
          name: "John Doe",
          role: "user",
          desc: "Sports enthusiast",
          lat: 6.9271,
          lng: 79.8612,
        },
        {
          xrpl: "rUSER2XRPLADDRESS",
          email: "jane.smith@example.com",
          name: "Jane Smith",
          role: "user",
          desc: "Futsal player",
          lat: 6.9270,
          lng: 79.8600,
        },
        {
          xrpl: "rOWNER1XRPLADDRESS",
          email: "owner.one@example.com",
          name: "Owner One",
          role: "owner",
          desc: "Court Owner",
          lat: 6.9280,
          lng: 79.8620,
        },
      ];

      for (const user of dummyUsers) {
        await this.#runQuery(
          `INSERT INTO ${Tables.USER} 
            (XrplAddress, Email, Name, UserRole, Description, Lat, Lng)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            user.xrpl,
            user.email,
            user.name,
            user.role,
            user.desc,
            user.lat,
            user.lng,
          ]
        );
      }
    }

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
          Image1 TEXT,
          Image2 TEXT,
          Image3 TEXT,
          OwnerID INTEGER NOT NULL,
          AvailableDate TEXT,
          AvailableStartTime TEXT,
          AvailableEndTime TEXT,
          PRIMARY KEY("Id" AUTOINCREMENT)
      )
    `);

    // Create MintedNFTs table
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

    // Insert dummy court data if not already present
    const courtList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM ${Tables.COURT}`);
    if (courtList[0].count === 0) {
      await this.#runQuery(`INSERT INTO ${Tables.COURT} 
        (Name, Location, Type, PricePerHour, Email, Description, Availability, Image1, Image2, Image3, OwnerID, AvailableDate, AvailableStartTime, AvailableEndTime) 
        VALUES 
        ('Huskies Basketball Court', '475/5 Sigera Rd, Sri Jayawardenepura Kotte, Sri Lanka', 'Badminton', 1000.00, 'hayeshahp6@gmail.com', 'Indoor court with wooden flooring', 'Available','https://res.cloudinary.com/dhrejmsev/image/upload/v1753124854/badminton_court_yqevlh.webp','https://res.cloudinary.com/dhrejmsev/image/upload/v1753124854/badminton_court_yqevlh.webp','https://res.cloudinary.com/dhrejmsev/image/upload/v1753124854/badminton_court_yqevlh.webp', 1, '2025-05-10', '09:00', '17:00'),
        ('Shuttle Power Sports Complex', '136 Poorwarama Rd, Colombo 00600, Sri Lanka', 'Tennis', 1500.00, 'hayeshahp6@gmail.com', 'Outdoor hard court', 'Booked', 'https://res.cloudinary.com/dhrejmsev/image/upload/v1753865482/tennis_zhlw4r.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753865482/tennis_zhlw4r.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753865482/tennis_zhlw4r.jpg', 1, '2025-05-11', '08:00', '18:00'),
        ('Blues Basketball Complex','Sri Sambuddhathva Jayanthi Mawatha , Colombo 05, Sri Lanka', 'Futsal', 2000.00, 'hayeshahp6@gmail.com', 'Artificial turf futsal court', 'Available', 'https://res.cloudinary.com/dhrejmsev/image/upload/v1753866034/fustal_l0bljl.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753866034/fustal_l0bljl.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753866034/fustal_l0bljl.jpg', 1, '2025-05-12', '10:00', '20:00'),
        ('Basketball Court D', 'Community Center', 'Basketball', 25.00, 'hayeshahp6@gmail.com', 'Indoor basketball court', 'Available', 'https://res.cloudinary.com/dhrejmsev/image/upload/v1753124864/shutter_power_complex_s9xtfv.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753124864/shutter_power_complex_s9xtfv.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753124864/shutter_power_complex_s9xtfv.jpg', 1, '2025-05-13', '09:00', '21:00'),
        ('Squash Court E', 'Fitness Club', 'Squash', 18.00, 'hayeshahp6@gmail.com', 'Well-maintained squash court', 'Available', 'https://res.cloudinary.com/dhrejmsev/image/upload/v1753865641/sqash_ifyve0.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753865641/sqash_ifyve0.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753865641/sqash_ifyve0.jpg', 1, '2025-05-14', '08:00', '20:00'),
        ('Table Tennis Court F', 'Sports Complex', 'Table Tennis', 8.00, 'hayeshahp6@gmail.com', 'Indoor table tennis tables', 'Available', 'https://res.cloudinary.com/dhrejmsev/image/upload/v1753865770/Table-Tennis_jntlva.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753865770/Table-Tennis_jntlva.jpg','https://res.cloudinary.com/dhrejmsev/image/upload/v1753865770/Table-Tennis_jntlva.jpg', 1, '2025-05-15', '10:00', '18:00')
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
          BookingType TEXT DEFAULT 'Practice'
      )
    `);

    // Insert dummy bookings
    const bookingList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM bookings`);
    if (bookingList[0].count === 0) {
      const courts = await this.#runSelectQuery(`SELECT Id FROM ${Tables.COURT}`);
      if (courts.length > 0) {
        const now = new Date();

        const insertValues = courts.map((court, index) => {
          const bookingDate = new Date(now);
          bookingDate.setDate(now.getDate() + index);
          const date = bookingDate.toISOString().split("T")[0];
          const startTime = "10:00";
          const endTime = "11:00";

          return `('${userEmail}', ${court.Id}, '${date}', '${startTime}', '${endTime}', 'Confirmed', 'Practice')`;
        }).join(",");

        await this.#runQuery(`
          INSERT INTO bookings (UserEmail, CourtId, Date, StartTime, EndTime, Status, BookingType)
          VALUES ${insertValues}
        `);
      }
    }

    // Insert dummy MintedNFTs
    const nftList = await this.#runSelectQuery(`SELECT COUNT(*) as count FROM MintedNFTs`);
    if (nftList[0].count === 0) {
      const courts = await this.#runSelectQuery(`SELECT Id FROM ${Tables.COURT} LIMIT 3`);
      const nftTokenIds = [
        "000000008EDF5E57B26D668C7D6B73915C82C031657FA577C94526B60056121B",
        "000000008EDF5E57B26D668C7D6B73915C82C031657FA577B25F55B50056121A",
        "000000008EDF5E57B26D668C7D6B73915C82C031657FA5778493B3B300561218"
      ];

      if (courts.length >= 3) {
        const nftInsertValues = courts.map((court, index) => {
          const date = `2025-08-0${index + 1}`;
          return `(${court.Id}, '${nftTokenIds[index]}', '${date}', '09:00', '11:00')`;
        }).join(",");

        await this.#runQuery(`
          INSERT INTO MintedNFTs (CourtId, NFTokenID, AvailableDate, AvailableStartTime, AvailableEndTime)
          VALUES ${nftInsertValues}
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