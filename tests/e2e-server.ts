import { SQL } from "bun";
import type { Subprocess } from "bun";

// Create a separate database for each run, even when a CI PostgreSQL is reused.
const maintenanceURL =
  process.env.E2E_DATABASE_URL ||
  "postgresql://jellyhub_e2e:jellyhub_e2e@127.0.0.1:55432/jellyhub_e2e";
const maintenance = new SQL(maintenanceURL);
const databaseName = `jellyhub_e2e_${crypto.randomUUID().replaceAll("-", "")}`;
const databaseURL = new URL(maintenanceURL);
databaseURL.pathname = `/${databaseName}`;

const port = process.env.E2E_PORT || "3100";
const env = {
  ...process.env,
  DATABASE_URL: databaseURL.toString(),
  APP_URL: `http://127.0.0.1:${port}`,
  AUTH_SECRET: "jellyhub-e2e-auth-secret-for-isolated-tests-only",
  SECRET_KEY: Buffer.alloc(32, 7).toString("base64"),
  ALLOW_SIGNUP: "true",
  NODE_ENV: "production",
  HOST: "127.0.0.1",
  PORT: port,
};

// The schema check imports the real auth configuration in this process.
Object.assign(process.env, env);

let child: Subprocess | undefined;
let created = false;
let cleanupPromise: Promise<void> | undefined;

function cleanup() {
  return (cleanupPromise ??= (async () => {
    child?.kill();
    await child?.exited;
    try {
      if (created) {
        await maintenance.unsafe(
          `DROP DATABASE "${databaseName}" WITH (FORCE)`,
        );
      }
    } finally {
      await maintenance.close();
    }
  })());
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void cleanup().then(
      () => process.exit(0),
      (error) => {
        console.error(error);
        process.exit(1);
      },
    );
  });
}

async function run(script: string) {
  child = Bun.spawn(["bun", "--no-env-file", "run", script], {
    env,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await child.exited;
  if (exitCode !== 0) {
    throw new Error(
      `E2E command '${script}' failed with exit code ${exitCode}`,
    );
  }
}

try {
  await maintenance.unsafe(`CREATE DATABASE "${databaseName}"`);
  created = true;
  await run("db:migrate");
  const { auth } = await import("../src/lib/auth");
  await (await auth.$context).checkSchema?.();
  await run("build");
  await run("start");
} finally {
  await cleanup();
}
