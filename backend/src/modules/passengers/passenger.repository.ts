import { query } from "../../infra/db";
import {
  CreatePassengerInput,
  IPassengerRepository,
  PassengerRow,
  UpdatePassengerInput,
} from "./passenger.types";

const COLUMNS = `
  id, user_id AS "userId", name, age, gender,
  berth_preference AS "berthPreference", nationality,
  id_proof_type AS "idProofType", id_proof_number AS "idProofNumber", 
  is_active AS "isActive", created_at AS "createdAt"
`;

const UPDATE_TABLE: Record<string, string> = {
  name: "name",
  age: "age",
  gender: "gender",
  berthPreference: "berth_preference",
  nationality: "nationality",
  idProofType: "id_proof_type",
  idProofNumber: "id_proof_number",
};

export class PassengerRepository implements IPassengerRepository {
  async create(
    userId: string,
    input: CreatePassengerInput,
  ): Promise<PassengerRow> {
    const rows = await query<PassengerRow>(
      `INSERT INTO passengers (user_id, name, age, gender, berth_preference, nationality, id_proof_type, id_proof_number)
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'IN'), $7, $8)
      RETURNING ${COLUMNS}`,
      [
        userId,
        input.name,
        input.age,
        input.gender,
        input.berthPreference ?? null,
        input.nationality ?? null,
        input.idProofType ?? null,
        input.idProofNumber ?? null,
      ],
    );

    return rows[0];
  }

  async countActiveByUser(userId: string): Promise<number> {
    const rows = await query<{ count: string }>(
      `SELECT count(*) FROM passengers WHERE user_id = $1 AND is_active = true`,
      [userId],
    );

    return Number(rows[0].count);
  }

  listActiveByUser(userId: string): Promise<PassengerRow[]> {
    return query<PassengerRow>(
      `SELECT ${COLUMNS} FROM passengers WHERE user_id = $1 AND is_active = true ORDER BY created_at`,
      [userId],
    );
  }

  async findByIdForUser(
    userId: string,
    id: string,
  ): Promise<PassengerRow | null> {
    const rows = await query<PassengerRow>(
      `SELECT ${COLUMNS} FROM passengers 
      WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [id, userId],
    );

    return rows[0] ?? null;
  }

  async update(
    userId: string,
    id: string,
    patch: UpdatePassengerInput,
  ): Promise<PassengerRow | null> {
    const sets: string[] = [];
    const params: unknown[] = [];

    for (const [key, column] of Object.entries(UPDATE_TABLE)) {
      const value = (patch as Record<string, unknown>)[key];
      if (value !== undefined) {
        params.push(value);
        sets.push(`${column} = $${params.length}`);
      }
    }

    if (sets.length === 0) return this.findByIdForUser(userId, id);

    params.push(id, userId);

    const rows = await query<PassengerRow>(
      `UPDATE passengers SET ${sets.join(", ")} 
      WHERE id = $${params.length - 1} AND user_id = $${params.length} AND is_active = true
      RETURNING ${COLUMNS}`,
      params,
    );

    return rows[0] ?? null;
  }

  async softDelete(userId: string, id: string): Promise<boolean> {
    const rows = await query<{ id: string }>(
      `UPDATE passengers SET is_active = false
      WHERE id = $1 AND user_id = $2 AND is_active = true RETURNING id`,
      [id, userId],
    );

    return rows.length > 0;
  }

  findActiveByIds(userId: string, ids: string[]): Promise<PassengerRow[]> {
    return query<PassengerRow>(
      `SELECT ${COLUMNS} FROM passengers 
      WHERE user_id = $1 AND id = ANY($2::bigint[]) AND is_active = true`,
      [userId, ids],
    );
  }
}
