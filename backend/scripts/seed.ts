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
