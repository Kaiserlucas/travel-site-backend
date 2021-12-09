import request from "supertest";
import AuthService from "../services/AuthService";

const serviceUrl = "http://localhost:3000";

describe(`/login`, () => {
  const authService = new AuthService();

  beforeAll(async () => {
    await authService.create({
      email: "user@example.org",
      password: "hunter2",
    });
  });

  afterAll(async () => {
    await authService.delete("user@example.org");
  });

  it("returns 400 when required parameter is missing", async () => {
    await request(serviceUrl)
      .post("/login")
      .send({ email: "no_password@example.org" })
      .expect(400);
  });

  it("returns 401 when sending wrong credentials", async () => {
    await request(serviceUrl)
      .post("/login")
      .send({ email: "user@example.org", password: "test123" })
      .expect(401);
  });

  it("returns 200 when sending correct credentials", async () => {
    await request(serviceUrl)
      .post("/login")
      .send({ email: "user@example.org", password: "hunter2" })
      .expect(200)
      .then((response) => {
        expect(response.headers).toMatchObject({
          "set-cookie": [expect.stringMatching("session=.*")],
        });
      });
  });
});
