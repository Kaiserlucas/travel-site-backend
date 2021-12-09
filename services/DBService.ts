import crypto from "crypto";
import { Knex } from "knex";

type Expense = {
  date: Date;
  name: string;
  value: number;
};

type SavedExpense = Expense & {
  id: string;
};

class DBService {
  expenses: SavedExpense[] = [];
  private readonly knex: Knex;

  constructor(knex: Knex) {
    this.knex = knex;
  }

  async add(expense: Expense): Promise<SavedExpense> {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    await this.knex("expenses").insert(newExpense);
    return newExpense;
  }

  async delete(uuid: string): Promise<void> {
    await this.knex("expeses").where({ id: uuid }).delete();
  }

  async getAll(): Promise<Expense[]> {
    return this.knex("expenses");
  }

  async getTotal(): Promise<number> {
    return 0;
  }
}

export default DBService;
