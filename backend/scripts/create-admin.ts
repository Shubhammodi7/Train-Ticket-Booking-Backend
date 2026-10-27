import bcrypt from "bcryptjs";
import { pool, query } from "../src/infra/db";

async function main() {
  const [
    name = "Admin User",
    email = "admin2@example.com",
    mobile = "9000000001",
    password = "Admin@123",
  ] = process.argv.slice(2);

  const passwordHash = await bcrypt.hash(password, 10);

  const rows = await query<{
    id: string;
    email: string;
    mobile: string;
    role: string;
  }>(
    `INSERT INTO users (name, email, mobile, password_hash, role)
     VALUES ($1, lower($2), $3, $4, 'ADMIN')
     ON CONFLICT (email) DO UPDATE SET role = 'ADMIN'
     RETURNING id, email, mobile, role`,
    [name, email, mobile, passwordHash],
  );
  console.log("Admin ready:", rows[0]);
}

main()
  .catch((e) => console.error(e.message))
  .finally(() => pool.end());
