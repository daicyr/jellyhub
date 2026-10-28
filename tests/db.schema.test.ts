import { expect, test } from "bun:test";
import { betterAuth } from "better-auth";
import { admin, username } from "better-auth/plugins";
import { sso } from "@better-auth/sso";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "../src/lib/db/schema";

test("the PostgreSQL schema accepts the fields written by Better Auth", async () => {
  // Drizzle's mock driver validates the real table definitions without a server.
  const auth = betterAuth({
    secret: "test-auth-schema-secret-for-local-validation",
    baseURL: "http://localhost:3100",
    database: drizzleAdapter(drizzle.mock({ relations: schema.relations }), {
      provider: "pg",
      schema,
    }),
    plugins: [admin(), username(), sso()],
  });

  const context = await auth.$context;
  expect(context.checkSchema).toBeFunction();
  await context.checkSchema!();
});
