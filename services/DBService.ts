import { uuid } from "uuidv4";
import { Knex } from "knex";

type Trip = {
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
};

type SavedTrip = Trip & {
  email: string;
  uuid: string;
};

class DBService {
  expenses: SavedTrip[] = [];
  private readonly knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  async add(trip: Trip, email: string): Promise<SavedTrip> {
    const newTrip = {
      ...trip,
      uuid: uuid(),
      email: email,
    };

    const test = {name: newTrip.name,destination: newTrip.destination,startdate: newTrip.startDate,enddate: newTrip.endDate,email: newTrip.email,uuid: newTrip.uuid}
    await this.knex("trips").insert(test);
    return newTrip;
  }

  async delete(uuid: string, email: string): Promise<void> {
    await this.knex("trips").where({ uuid: uuid }).andWhere({email: email}).delete();
  }

  async getAll(email: string): Promise<Trip[]> {
    return this.knex("trips").where({email:email});
  }

}

export default DBService;
