import config from "../knexfile";
import bcrypt from "bcrypt";
import Knex from "knex";
import { promisify } from "util";

import { createClient } from "redis";
import { uuid } from "uuidv4";

const client = createClient({
  url: process.env.REDIS_URL,
});
client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Successfully connected to redis"));

const getAsync = promisify(client.get).bind(client);
const setExAsync = promisify(client.setex).bind(client);

const knex = Knex(config);

interface User {
  email: string;
  password: string;
}

class AuthService {
  async create(newUser: User): Promise<void> {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newUser.password, salt);
    const hashedUser = {email: newUser.email ,password:passwordHash}
    const verificationID = uuid();
    await setExAsync(verificationID, 60 * 60, JSON.stringify(hashedUser));
    /*
    await knex("users").insert({
      ...newUser,
      password: passwordHash,
    });
     */
    console.log(verificationID);
    //TODO: Send Email
  }

  async delete(email: string): Promise<void> {
    await knex("users").where({email}).delete()
  }

  async checkPassword(email: string, password: string): Promise<boolean> {
    const dbUser = await knex<User>("users").where({ email }).first();
    if (!dbUser) {
      return false;
    }
    return bcrypt.compare(password, dbUser.password);
  }

  public async login(
    email: string,
    password: string
  ): Promise<string | undefined> {
    const correctPassword = await this.checkPassword(email, password);
    if (correctPassword) {
      const sessionId = uuid();
      await setExAsync(sessionId, 60 * 60, email);
      return sessionId;
    }
    return undefined;
  }

  public async getUserEmailForSession(
    sessionId: string
  ): Promise<string | null> {
    return getAsync(sessionId);
  }

  async checkUserExistence(email:string): Promise<boolean> {
    const response = await knex("users").where({email:email});
    return response.length > 0;
  }

}

export default AuthService;
