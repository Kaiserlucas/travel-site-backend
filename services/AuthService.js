const client = require("express");
const bcrypt = require('bcrypt');
const knex = require('knex')({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

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
            //TODO
            //await client.set(sessionId, email, { EX: 60 });
            return sessionId;
        }
        return undefined;
    }

    async getUserEmailForSession(sessionId) {
        //TODO
        //return client.get(sessionId);
        return "dummy";
    }

}

export default AuthService;