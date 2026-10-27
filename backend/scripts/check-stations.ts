import { pool, query } from "../src/infra/db";

async function main() {
  console.log("ALL ROWS:");
  console.table(
    await query(`SELECT id, code, name, is_active FROM stations ORDER BY id`),
  );

  console.log("SEARCH 'patna':");
  console.table(
    await query(
      `SELECT code, name FROM stations
       WHERE is_active = true
         AND (code = upper($1::text) OR name ILIKE '%' || $1::text || '%' OR city ILIKE '%' || $1::text || '%')`,
      ["patna"],
    ),
  );
}

main()
  .catch((e) => console.error(e.message))
  .finally(() => pool.end());
