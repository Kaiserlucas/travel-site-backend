// knexfile.ts
import { Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false } // allow self-signed certificate for Heroku/AWS
        : false, // if we run locally, we don't want SSL at all
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
  },
};

export default config;
