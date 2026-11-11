import bcrypt from "bcryptjs";
import { pool, query } from "../src/infra/db";
import { env } from "../src/config/env";

if (env.NODE_ENV === "production") {
  console.error("Refusing to seed demo data in production");
  process.exit(1);
}

const USERS = [
  {
    name: "Admin User",
    email: "admin@example.com",
    mobile: "9000000001",
    role: "ADMIN",
  },
  {
    name: "Rahul Kumar",
    email: "rahul@example.com",
    mobile: "9000000002",
    role: "USER",
  },
  {
    name: "Priya Singh",
    email: "priya@example.com",
    mobile: "9000000003",
    role: "USER",
  },
];

const PASSENGERS: [
  string,
  string,
  number,
  string,
  string | null,
  string | null,
  string | null,
][] = [
  [
    "rahul@example.com",
    "Rahul Kumar",
    24,
    "M",
    "LOWER",
    "AADHAAR",
    "111122223333",
  ],
  [
    "rahul@example.com",
    "Sunita Devi",
    52,
    "F",
    "LOWER",
    "AADHAAR",
    "444455556666",
  ],
  ["rahul@example.com", "Amit Kumar", 27, "M", "UPPER", null, null],
  ["priya@example.com", "Priya Singh", 29, "F", "WINDOW", "PAN", "ABCDE1234F"],
];

const STATIONS = [
  ["PNBE", "Patna Junction", "Patna", "Bihar"],
  ["JAJ", "Jhajha", "Jhajha", "Bihar"],
  ["GAYA", "Gaya Junction", "Gaya", "Bihar"],
  ["KQR", "Koderma Junction", "Koderma", "Jharkhand"],
  ["MURI", "Muri Junction", "Muri", "Jharkhand"],
  ["RNC", "Ranchi Junction", "Ranchi", "Jharkhand"],
  ["DHN", "Dhanbad Junction", "Dhanbad", "Jharkhand"],
  ["ASN", "Asansol Junction", "Asansol", "West Bengal"],
  ["HWH", "Howrah Junction", "Howrah", "West Bengal"],
  ["NDLS", "New Delhi", "New Delhi", "Delhi"],
];

async function main() {
  // 1. users
  const passwordHash = await bcrypt.hash("Secret@123", 10);
  const userIds = new Map<string, string>();
  for (const u of USERS) {
    const rows = await query<{ id: string }>(
      `INSERT INTO users (name, email, mobile, password_hash, role, is_email_verified, is_mobile_verified)
       VALUES ($1, $2, $3, $4, $5, true, true)
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role
       RETURNING id`,
      [u.name, u.email, u.mobile, passwordHash, u.role],
    );
    userIds.set(u.email, rows[0].id);
  }

  // 2. passengers (needs user ids)
  for (const [
    email,
    name,
    age,
    gender,
    berth,
    idType,
    idNumber,
  ] of PASSENGERS) {
    await query(
      `INSERT INTO passengers (user_id, name, age, gender, berth_preference, id_proof_type, id_proof_number)
   SELECT $1::bigint, $2::varchar, $3::smallint, $4::varchar, $5::varchar, $6::varchar, $7::varchar
   WHERE NOT EXISTS (
     SELECT 1 FROM passengers
     WHERE user_id = $1::bigint AND name = $2::varchar AND is_active = true
   )`,
      [userIds.get(email), name, age, gender, berth, idType, idNumber],
    );
  }

  // 3. stations
  for (const [code, name, city, state] of STATIONS) {
    await query(
      `INSERT INTO stations (code, name, city, state) VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city, state = EXCLUDED.state`,
      [code, name, city, state],
    );
  }

  // 4. trains and their stops (sample data, times are illustrative)
  type Stop = [
    code: string,
    arr: string | null,
    dep: string | null,
    dayOffset: number,
    km: number,
  ];
  const TRAINS: { number: string; name: string; stops: Stop[] }[] = [
    {
      number: "12024",
      name: "Patna Howrah Jan Shatabdi",
      stops: [
        ["PNBE", null, "06:00", 0, 0],
        ["JAJ", "08:05", "08:07", 0, 130],
        ["ASN", "10:45", "10:50", 0, 330],
        ["HWH", "13:30", null, 0, 530],
      ],
    },
    {
      number: "18625",
      name: "Patna Ranchi Express",
      stops: [
        ["PNBE", null, "20:00", 0, 0],
        ["GAYA", "21:30", "21:35", 0, 100],
        ["KQR", "23:30", "23:32", 0, 220],
        ["MURI", "01:40", "01:42", 1, 350],
        ["RNC", "03:30", null, 1, 400],
      ],
    },
  ];

  for (const t of TRAINS) {
    await query(
      `INSERT INTO trains (number, name, source_station_id, destination_station_id)
     VALUES ($1, $2,
       (SELECT id FROM stations WHERE code = $3),
       (SELECT id FROM stations WHERE code = $4))
     ON CONFLICT (number) DO NOTHING`,
      [t.number, t.name, t.stops[0][0], t.stops[t.stops.length - 1][0]],
    );
    for (const [i, [code, arr, dep, dayOffset, km]] of t.stops.entries()) {
      await query(
        `INSERT INTO train_stops (train_id, station_id, stop_seq, arrival_time, departure_time, day_offset, distance_km)
       SELECT t.id, s.id, $2, $3, $4, $5, $6
       FROM trains t, stations s WHERE t.number = $1 AND s.code = $7
       ON CONFLICT (train_id, stop_seq) DO NOTHING`,
        [t.number, i + 1, arr, dep, dayOffset, km, code],
      );
    }
  }

  console.log("Seed complete.\n");
  console.log("User ids (use as the x-user-id header):");
  for (const u of USERS)
    console.log(
      `  ${u.role.padEnd(5)} ${u.email.padEnd(20)} id=${userIds.get(u.email)}`,
    );
  console.log("\nPassword for all seeded users: Secret@123");
  console.table(
    await query(`SELECT 'users' AS "table", count(*) FROM users
    UNION ALL SELECT 'passengers', count(*) FROM passengers
    UNION ALL SELECT 'stations', count(*) FROM stations`),
  );
}

main()
  .catch((e) => {
    console.error("Seed failed:", e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
