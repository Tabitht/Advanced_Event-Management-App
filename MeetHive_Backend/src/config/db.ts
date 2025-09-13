/**
 * @file db.ts
 * @module src/config/db.ts
 * @description Database configuration using pg (node-postgres)
 */
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// Create a new pool instance with configuration from environment variables
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "db",
  database: process.env.DB_NAME || "mydb",
  password: process.env.DB_PASSWORD || "postgres",
  port: Number(process.env.DB_PORT) || 5432,
});

// Function to connect to the database and handle connection errors
export const connectDB = async (): Promise<void> => {
  try {
    await pool.connect();
    console.log("Connected to PostgreSQL successfully");
  } catch (err) {
    console.error("Connection error:", (err as Error).message);
    process.exit(1);
  }
};

export default pool;
