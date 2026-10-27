import { app } from "./app";
import { env } from "./config/env";
import { pool } from "./infra/db";

const startServer = async () => {
  await pool.query("SELECT 1");

  console.log("DATABASE CONNECTED");

  const server = app.listen(env.PORT, () => {
    console.log(`Server is running on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    server.close();
    await pool.end();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
