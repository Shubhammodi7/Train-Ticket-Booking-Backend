import { query, withTransaction } from "../../infra/db";
import {
  ITrainRepository,
  NewTrain,
  TrainDetail,
  TrainStopView,
  TrainSummary,
} from "./train.types";

const SUMMARY_SQL = `
  SELECT t.id, t.number, t.name, t.is_active AS "isActive", 
    src.code AS "sourceCode", src.name AS "sourceName",
    dst.code AS "destinationCode", dst.name AS "destinationName"
  FROM trains t
  JOIN stations src ON src.id = t.source_station_id
  JOIN stations dst ON dst.id = t.destination_station_id
`;

export class TrainRepository implements ITrainRepository {
  async createWithStops(input: NewTrain): Promise<void> {
    await withTransaction(async (client) => {
      const created = await client.query<{ id: string }>(
        `INSERT INTO trains (number, name, source_station_id, destination_station_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          input.number,
          input.name,
          input.sourceStationId,
          input.destinationStationId,
        ],
      );
      const trainId = created.rows[0].id;

      const params: unknown[] = [];
      const values = input.stops.map((s, i) => {
        const b = params.length;
        params.push(
          trainId,
          s.stationId,
          i + 1,
          s.arrivalTime,
          s.departureTime,
          s.dayOffset,
          s.distanceKm,
        );
        return `($${b + 1}, $${b + 2}, $${b + 3}, $${b + 4}, $${b + 5}, $${b + 6}, $${b + 7})`;
      });

      await client.query(
        `INSERT INTO train_stops
          (train_id, station_id, stop_seq, arrival_time, departure_time, day_offset, distance_km)
        VALUES ${values.join(", ")}`,
        params,
      );
    });
  }

  async findByNumber(number: string): Promise<TrainDetail | null> {
    const trains = await query<TrainSummary>(
      `${SUMMARY_SQL} where t.number = $1 AND t.is_active = true`,
      [number],
    );
    if (!trains[0]) return null;

    const stops = await query<TrainStopView>(
      `select ts.stop_seq as seq, st.code as "stationCode", st.name as "stationName", 
      to_char(ts.arrival_time, 'HH24:MI') as "arrivalTime", to_char(ts.departure_time, 'HH24:MI') as "departureTime", 
      ts.day_offset as "dayOffset", ts.distance_km as "distanceKm"
      FROM train_stops ts
      join stations st on st.id = ts.station_id
      where ts.train_id = $1
      order by ts.stop_seq`,
      [trains[0].id],
    );

    return { ...trains[0], stops };
  }

  list(limit: number, offset: number): Promise<TrainSummary[]> {
    return query<TrainSummary>(
      `${SUMMARY_SQL} WHERE t.is_active = true ORDER BY t.number LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
  }

  async deactivate(number: string): Promise<boolean> {
    const rows = await query<{ id: string }>(
      `UPDATE trains SET is_active = false WHERE number = $1 AND is_active = true RETURNING id`,
      [number],
    );

    return rows.length > 0;
  }
}
