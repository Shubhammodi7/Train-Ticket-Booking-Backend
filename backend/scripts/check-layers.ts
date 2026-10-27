import { pool } from "../src/infra/db";
import { StationRepository } from "../src/modules/stations/station.repository";
import { StationService } from "../src/modules/stations/station.service";

async function main() {
  const repo = new StationRepository();
  const service = new StationService(repo);

  console.log(
    "REPO    :",
    (await repo.search("patna", 10)).map((s) => s.name),
  );
  console.log(
    "SERVICE :",
    (await service.searchStations("patna", 10)).map((s) => s.name),
  );
}

main()
  .catch((e) => console.error(e))
  .finally(() => pool.end());
