import { pool, query } from "../src/infra/db";
import { container } from "../src/container";
import { AppError } from "../src/common/errors/app-error";
import { CoachInput } from "../src/modules/coaches/coach.types";

const rep = (classCode: string, n: number, totalSeats?: number): CoachInput[] =>
  Array.from({ length: n }, () => ({ classCode, totalSeats }));

const SETUPS: { train: string; coaches: CoachInput[] }[] = [
  {
    train: "12024",
    coaches: [...rep("CC", 4), ...rep("CC", 1, 72)],
  },
  {
    train: "18625",
    coaches: [...rep("SL", 4), ...rep("3A", 2)],
  },
];

async function main() {
  for (const s of SETUPS) {
    try {
      const result = await container.coachService.setupCoaches(
        s.train,
        s.coaches,
      );
      console.log(`Train ${s.train}: created ${result.coaches.length} coaches`);
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 409) {
        console.log(`Train ${s.train}: already has coaches, skipped`);
      } else {
        throw err;
      }
    }
  }

  console.table(
    await query(`
      SELECT t.number AS train, cl.code AS class, count(*) AS coaches, sum(c.total_seats) AS seats
      FROM coaches c
      JOIN trains t ON t.id = c.train_id
      JOIN classes cl ON cl.id = c.class_id
      GROUP BY t.number, cl.code ORDER BY t.number, cl.code`),
  );
  console.table(await query(`SELECT count(*) AS seat_rows FROM seats`));
}

main()
  .catch((e) => {
    console.error("Seed coaches failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
