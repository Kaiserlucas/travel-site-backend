import crypto from "crypto";
import { Knex } from "knex";

type Trip = {
  email: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
};

type SavedTrip = Trip & {
  id: string;
};

class DBService {
  expenses: SavedTrip[] = [];
  private readonly knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  async add(trip: Trip): Promise<SavedTrip> {
    const newTrip = {
      ...trip,
      id: crypto.randomUUID(),
    };
    //TODO: Check for user
    await this.knex("trips").insert(newTrip);
    return newTrip;
  }

  async delete(uuid: string): Promise<void> {
    //TODO: Check for user
    await this.knex("trips").where({ id: uuid }).delete();
  }

  async getAll(): Promise<Trip[]> {
    //TODO: Check for user
    return this.knex("trips");
  }

}

export default DBService;
