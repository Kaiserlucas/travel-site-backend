import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema
        .createTable('expenses', function (table) {
            table.uuid('id').primary();
            table.date('date').notNullable();
            table.string('name', 255).notNullable();
            table.integer('value').notNullable();
        })
        // .createTable(...
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema
        .dropTableIfExists('expenses');
}

