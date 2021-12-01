import config from "../knexfile";
import Knex from "knex";

const knex = Knex(config);

class DatabaseService {

    async addTrip(trip, email) {
        //TODO
    }

    async deleteTrip(id, email) {
        //TODO
    }

    async updateTrip(trip, email) {
        //TODO
    }

    async getTrips(email) {
        //TODO
    }
}

export default DatabaseService;