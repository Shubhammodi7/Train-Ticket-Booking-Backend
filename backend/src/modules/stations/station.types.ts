export interface Station {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
  create_at: Date;
}

export interface CreateStationInput {
  code: string;
  name: string;
  city: string;
  state: string;
}

export type UpdateStationInput = Partial<Omit<CreateStationInput, "code">>;

export interface IStationRepository {
  create(input: CreateStationInput): Promise<Station>;
  findByCode(code: string): Promise<Station | null>;
  search(prefix: string | undefined, limit: number): Promise<Station[]>;
  update(code: string, patch: UpdateStationInput): Promise<Station | null>;
  deactivate(code: string): Promise<boolean>;
}
