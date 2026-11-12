import { query, withTransaction } from "../../infra/db";
import { IClassRepository, TravelClass } from "./class.types";

const COLUMNS = `
  id, code, name,
  coach_prefix AS "coachPrefix",
  seat_type AS "seatType",
  seats_per_coach AS "seatsPerCoach",
  is_active AS "isActive",
  created_at AS "createdAt"
`;

export class ClassRepository implements IClassRepository {
  listActive(): Promise<TravelClass[]> {
    return query<TravelClass>(
      `SELECT ${COLUMNS} from classes WHERE is_active = true order by code`,
    );
  }

  async findByCode(code: string): Promise<TravelClass | null> {
    const rows = await query<TravelClass>(
      `SELECT ${COLUMNS} from classes WHERE code = $1 AND is_active = true`,
      [code],
    );

    return rows[0] ?? null;
  }

  findByCodes(codes: string[]): Promise<TravelClass[]> {
    return query<TravelClass>(
      `SELECT ${COLUMNS} FROM classes WHERE code = ANY($1::text[]) AND is_active = true`,
      [codes],
    );
  }
}
