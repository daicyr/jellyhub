import { defineRelations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { encryptedText } from "./types";

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    precision: 3,
  }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
    .$onUpdate(() => new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true, precision: 3 }),
  username: text("username").unique(),
  displayUsername: text("display_username"),
});

export const session = pgTable(
  "session",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    // Preserve values from Better Auth 1.7.0–1.7.2; newer versions omit issuer.
    issuer: text("issuer"),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
      precision: 3,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
      precision: 3,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("account_providerId_accountId_uidx").on(
      table.providerId,
      table.accountId,
    ),
    index("account_userId_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
    }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const ssoProvider = pgTable(
  "sso_provider",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    issuer: text("issuer").notNull(),
    oidcConfig: text("oidc_config"),
    samlConfig: text("saml_config"),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull().unique(),
    organizationId: text("organization_id"),
    domain: text("domain").notNull(),
    domainVerified: boolean("domain_verified").default(false).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
    }).$default(() => new Date()),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("sso_provider_userId_idx").on(table.userId)],
);

export const jellydata = pgTable(
  "jellydata",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => Bun.randomUUIDv7()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    serverUrl: text("server_url").notNull(),
    serverName: text("server_name").notNull(),
    serverUsername: text("server_username").notNull(),
    serverToken: encryptedText("server_token"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      precision: 3,
    }).$default(() => new Date()),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("jellydata_userId_idx").on(table.userId),
    unique("jellydata_userId_serverUrl_unique").on(
      table.userId,
      table.serverUrl,
    ),
  ],
);

export const relations = defineRelations(
  { user, jellydata, session, account, ssoProvider },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      jellydata: r.many.jellydata({
        from: r.user.id,
        to: r.jellydata.userId,
      }),
      ssoProviders: r.many.ssoProvider({
        from: r.user.id,
        to: r.ssoProvider.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },

    jellydata: {
      user: r.one.user({
        from: r.jellydata.userId,
        to: r.user.id,
      }),
    },
  }),
);
