import { pool, query } from "../src/infra/db";
import { container } from "../src/container";
import { DayOfWeek } from "../src/modules/schedules/schedule.types";

const SCHEDULES: { train: string; days: DayOfWeek[] }[] = [
  { train: "12024", days: [1, 3, 6] },
  { train: "18625", days: [1, 2, 3, 4, 5, 6, 7] },
];

async function main() {
  for (const s of SCHEDULES) {
    const result = await container.scheduleService.setSchedule(s.train, {
      runningDays: s.days,
    });
    console.log(`Train ${s.train}: ${result.runningDayNames.join(", ")}`);
  }

  console.table(
    await query(`
      SELECT t.number AS train, s.running_days, s.is_active
      FROM train_schedules s JOIN trains t ON t.id = s.train_id
      ORDER BY t.number`),
  );
}

main()
  .catch((e) => {
    console.error("Seed schedules failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
