import { pool, query } from "../src/infra/db";

type ClassSeed = {
  code: string;
  name: string;
  coachPrefix: string;
  seatType: "CHAIR" | "BERTH";
  seatsPerCoach: number;
};

const CLASSES: ClassSeed[] = [
  {
    code: "1A",
    name: "First AC",
    coachPrefix: "H",
    seatType: "BERTH",
    seatsPerCoach: 24,
  },
  {
    code: "2A",
    name: "AC 2 Tier",
    coachPrefix: "A",
    seatType: "BERTH",
    seatsPerCoach: 48,
  },
  {
    code: "3A",
    name: "AC 3 Tier",
    coachPrefix: "B",
    seatType: "BERTH",
    seatsPerCoach: 64,
  },
  {
    code: "SL",
    name: "Sleeper",
    coachPrefix: "S",
    seatType: "BERTH",
    seatsPerCoach: 72,
  },
  {
    code: "CC",
    name: "AC Chair Car",
    coachPrefix: "C",
    seatType: "CHAIR",
    seatsPerCoach: 78,
  },
  {
    code: "EC",
    name: "Executive Chair Car",
    coachPrefix: "E",
    seatType: "CHAIR",
    seatsPerCoach: 56,
  },
  {
    code: "2S",
    name: "Second Sitting",
    coachPrefix: "D",
    seatType: "CHAIR",
    seatsPerCoach: 108,
  },
];

async function main() {
  for (const c of CLASSES) {
    await query(
      `INSERT INTO classes (code, name, coach_prefix, seat_type, seats_per_coach)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        seats_per_coach = EXCLUDED.seats_per_coach,
        is_active = true`,
      [c.code, c.name, c.coachPrefix, c.seatType, c.seatsPerCoach],
    );
  }

  console.log("Classes seeded.");
  console.table(
    await query(
      `SELECT code, name, coach_prefix AS prefix, seat_type, seats_per_coach FROM classes ORDER BY code`,
    ),
  );
}

main()
  .catch((e) => {
    console.error("Seed classes failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
