import config from "../knexfile";
import bcrypt from "bcrypt";
import Knex from "knex";
import { promisify } from "util";


import { createClient } from "redis";
import crypto from "crypto";

const client = createClient({
    url: process.env.REDIS_URL,
});

const getAsync = promisify(client.get).bind(client);
const setExAsync = promisify(client.setex).bind(client);

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
            // Set the new value with an expiry of 1 hour
            await setExAsync(sessionId, 60 * 60, email);
            return sessionId;
        }
        return undefined;
    }

    async getUserEmailForSession(sessionId) {
        return getAsync(sessionId);
    }

}

export default AuthService;