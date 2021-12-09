import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable('trips', function (table) {
            table.uuid('id').primary();
            table.string('email').references('email').inTable('users').notNullable();
            table.string('tripName', 255).notNullable();
            table.string('destination', 255).notNullable();
            table.date('startDate').notNullable();
            table.date('endDate').notNullable();
            table.integer('value').notNullable();
        })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTableIfExists('trips')
}

