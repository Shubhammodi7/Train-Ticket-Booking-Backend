import { PoolClient } from "pg";

import { query } from "../../infra/db";
import { CreateUserInput, User, UserWithPassword } from "./user.types";

const COLUMNS = `
  id, name, email, mobile, role,
  is_email_verified AS "isEmailVerified",
  is_mobile_verified AS "isMobileVerified",
  status, last_login_at AS "lastLoginAt",
  created_at AS "createdAt"
`;

export const userRepository = {
  async create(input: CreateUserInput, client?: PoolClient): Promise<User> {
    const sql = `
    INSERT INTO users (name, email, mobile, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING ${COLUMNS}
    `;

    const params = [input.name, input.email, input.mobile, input.passwordHash];

    const rows = client
      ? (await client.query<User>(sql, params)).rows
      : await query<User>(sql, params);
    return rows[0];
  },
  async findById(id: string): Promise<User | null> {
    const rows = await query<User>(
      `SELECT ${COLUMNS} FROM users WHERE id = $1 AND status <> 'DELETED'`,
      [id],
    );

    return rows[0] || null;
  },

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    const rows = await query<UserWithPassword>(
      `SELECT ${COLUMNS}, password_hash AS "passwordHash" FROM users WHERE email=$1 AND status <> 'DELETED'`,
      [email],
    );

    return rows[0] ?? null;
  },
};
