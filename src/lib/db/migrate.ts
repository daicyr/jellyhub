import { migrate } from "drizzle-orm/bun-sql/migrator";
import db from ".";

try {
  await migrate(db, { migrationsFolder: "./drizzle/postgresql" });
} finally {
  await db.$client.close();
}
