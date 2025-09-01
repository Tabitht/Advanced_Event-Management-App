/**
 * @file db.js
 * @module src/config/db.js
 * @description Database configuration using pg (node-postgres)
 */
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Create a new pool instance with configuration from environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Function to connect to the database and handle connection errors
const connectDB = async () => {
  try {
    await pool.connect();
    console.log("Connected to PostgreSQL Suscessfully");
  } catch (err) {
    console.error("Connection error:", err.message);
    process.exit(1); 
  }
};

connectDB();

export default pool;
