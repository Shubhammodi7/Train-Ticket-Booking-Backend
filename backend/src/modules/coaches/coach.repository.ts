import { query, withTransaction } from "../../infra/db";
import { CoachView, ICoachRepository, NewCoach } from "./coach.types";

export class CoachRepository implements ICoachRepository {
  async createWithSeats(trainId: string, coaches: NewCoach[]): Promise<void> {
    await withTransaction(async (client) => {
      for (const coach of coaches) {
        const created = await client.query<{ id: string }>(
          `insert into coaches (train_id, class_id, coach_no, total_seats)
          values ($1, $2, $3, $4)
          returning id`,
          [trainId, coach.classId, coach.coachNo, coach.totalSeats],
        );
        const coachId = created.rows[0].id;

        await client.query(
          `insert into seats (coach_id, seat_no, berth_type)
          select $1, s.seat_no, s.berth_type
          from unnest($2::int[], $3::text[]) as s(seat_no, berth_type)`,
          [
            coachId,
            coach.seats.map((s) => s.seatNo),
            coach.seats.map((s) => s.berthType),
          ],
        );
      }
    });
  }

  listByTrain(trainId: string): Promise<CoachView[]> {
    return query<CoachView>(
      `select c.id, c.train_id as "trainId", c.class_id as "classId", c1.code as "classCode", c.coach_no as "coachNo", c.total_seats as "totalSeats"
      from coaches c
      join classes c1 on c1.id = c.class_id
      where c.train_id = $1
      order by c1.code, length(c.coach_no), c.coach_no`,
      [trainId],
    );
  }

  async countByTrain(trainId: string): Promise<number> {
    const rows = await query<{ count: string }>(
      `select count(*) from coaches where train_id = $1`,
      [trainId],
    );

    return Number(rows[0].count);
  }
}
