import { drizzle } from "drizzle-orm/bun-sql";
import { relations } from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set to a PostgreSQL connection URL");
}

const db = drizzle(databaseUrl, {
  relations,
});

export default db;
