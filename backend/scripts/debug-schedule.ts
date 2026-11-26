import { pool, query } from "../src/infra/db";
import { container } from "../src/container";

const withTimeout = <T>(p: Promise<T>, ms = 8000): Promise<T> =>
  Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TIMED OUT after ${ms}ms`)), ms),
    ),
  ]);

async function main() {
  console.log("0. active database sessions");
  console.table(
    await withTimeout(
      query(`SELECT pid, state, wait_event_type, left(query, 70) AS query
             FROM pg_stat_activity
             WHERE datname = current_database() AND pid <> pg_backend_pid() AND state <> 'idle'`),
    ),
  );

  console.log("1. raw query on the table");
  console.log(await withTimeout(query(`SELECT count(*) FROM train_schedules`)));

  console.log("2. the service");
  console.log(
    await withTimeout(container.scheduleService.getSchedule("12024")),
  );
}

main()
  .catch((e) => console.error("FAILED:", e.message))
  .finally(() => pool.end());
