import config from "../knexfile";
import bcrypt from "bcrypt";
import Knex from "knex";

import { createClient } from "redis";
import crypto from "crypto";

const client = createClient({
    url: process.env.REDIS_URL,
});

(async () => {
    await client.connect();
})();

const knex = Knex(config);

class AuthService {
    async create(newUser) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(newUser.password, salt);
        await knex("users").insert({
            ...newUser,
            password: passwordHash,
        });
    }
    async checkPassword(email, password) {
        const dbUser = await knex("users").where({ email }).first();
        if (!dbUser) {
            return false;
        }
        return bcrypt.compare(password, dbUser.password);
    }

    async login(email, password) {
        const correctPassword = await this.checkPassword(email, password);
        if (correctPassword) {
            const sessionId = crypto.randomUUID();
            await client.set(sessionId, email, { EX: 60 });
            return sessionId;
        }
        return undefined;
    }

    async getUserEmailForSession(sessionId) {
        return client.get(sessionId);
    }

}

export default AuthService;