import config from "../knexfile";
import crypto from "crypto";
import { knex as knexDriver } from "knex";
import mockKnex from "mock-knex";
import ExpenseService from "./ExpenseService";

describe("ExpenseService", () => {
  const tracker = mockKnex.getTracker();
  let service: ExpenseService;

  beforeAll(() => {
    const knex = knexDriver(config);
    service = new ExpenseService(knex);
    mockKnex.mock(knex);
    tracker.install();
  });

  describe("add", () => {
    it("adds a uuid before inserting to db", async () => {
      // Arrange
      jest.spyOn(crypto, "randomUUID").mockReturnValueOnce("my-uuid-123");
      tracker.on("query", function checkResult(query) {
        expect(query.method).toEqual("insert");
        expect(query.sql).toEqual(
          'insert into "expenses" ("date", "id", "name", "value") values ($1, $2, $3, $4)'
        );
        expect(query.bindings).toEqual([
          new Date(2021, 1, 1),
          "my-uuid-123",
          "Test Expense",
          13,
        ]);
        query.response(1);
      });

      // Act
      const result = await service.add({
        value: 13,
        date: new Date(2021, 1, 1),
        name: "Test Expense",
      });

      // Assert
      expect(result).toEqual({
        value: 13,
        date: new Date(2021, 1, 1),
        name: "Test Expense",
        id: "my-uuid-123",
      });
    });
  });
});
