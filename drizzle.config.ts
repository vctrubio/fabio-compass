import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
import path from "path";

// Load default .env file first
dotenv.config();

// Then try to load environment-specific file if NODE_ENV is set
if (process.env.NODE_ENV) {
  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
    override: true,
  });
}

// Verify if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in the environment variables");
  process.exit(1);
}

export default {
  schema: "./drizzle/migrations/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  introspect: {
    casing: "preserve",
  },
  casing: "snake_case",
} satisfies Config;
