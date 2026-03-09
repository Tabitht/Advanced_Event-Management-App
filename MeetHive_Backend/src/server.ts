import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
import path from "path/win32";

//dotenv.config();
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode at http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});
