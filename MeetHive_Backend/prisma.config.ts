import path from "node:path";
import dotenv from "dotenv";
import type { PrismaConfig } from "prisma";

dotenv.config({ path: path.join(process.cwd(), ".env") }); //Force load .env manually

export default {
  schema: path.join("src/prisma"),
} satisfies PrismaConfig;
