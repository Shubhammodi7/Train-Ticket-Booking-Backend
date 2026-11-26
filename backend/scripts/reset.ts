import { pool, query } from "../src/infra/db";
import { env } from "../src/config/env";

if (env.NODE_ENV === "production") {
  console.error("Refusing to reset in production");
  process.exit(1);
}

async function main() {
  await query(
    `TRUNCATE train_schedules, seats, coaches, train_stops, trains,
              passengers, stations, classes, users
     RESTART IDENTITY CASCADE`,
  );
  console.log("All tables cleared, ids restarted from 1");
}

main()
  .catch((e) => {
    console.error("Reset failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
