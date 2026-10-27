import {
  CreateStationInput,
  IStationRepository,
  Station,
  UpdateStationInput,
} from "./station.types";
import { query } from "../../infra/db";
const COLUMNS = `id, code, name, city, state, is_active AS "isActive", created_at AS "createdAt"`;

export class StationRepository implements IStationRepository {
  async create(input: CreateStationInput): Promise<Station> {
    const rows = await query<Station>(
      `INSERT INTO stations (code, name, city, state) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
      [input.code, input.name, input.city, input.state],
    );
    return rows[0];
  }

  async findByCode(code: string): Promise<Station | null> {
    const row = await query<Station>(
      `SELECT ${COLUMNS} FROM stations where code = $1 AND is_active = true`,
      [code],
    );
    return row[0] ?? undefined;
  }

  async search(prefix: string | undefined, limit: number): Promise<Station[]> {
    if (!prefix) {
      return query<Station>(
        `SELECT ${COLUMNS} FROM stations WHERE is_active = true ORDER BY name LIMIT $1`,
        [limit],
      );
    }

    return query<Station>(
      `SELECT ${COLUMNS} FROM stations WHERE is_active = true AND (code = upper($1) OR lower(name) LIKE lower($1) || '%')
        ORDER BY (code = upper($1)) DESC, name LIMIT $2`,
      [prefix, limit],
    );
  }

  async update(
    code: string,
    patch: UpdateStationInput,
  ): Promise<Station | null> {
    const rows = await query<Station>(
      `UPDATE stations SET
        name = COALESCE($2, name),
        city = COALESCE($3, city),
        state = COALESCE($4, state)
      WHERE code = $1 AND is_active = true
      RETURNING ${COLUMNS}`,
      [code, patch.name ?? null, patch.city ?? null, patch.state ?? null],
    );

    return rows[0] ?? null;
  }

  async deactivate(code: string): Promise<boolean> {
    const rows = await query<{ id: string }>(
      `UPDATE stations SET is_active = false WHERE code = $1 AND is_active = true RETURNING id`,
      [code],
    );

    return rows.length > 0;
  }
}
