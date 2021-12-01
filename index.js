import * as OpenApiValidator from "express-openapi-validator";
import AuthService from "./services/AuthService";
import cookieParser from "cookie-parser";

const port = process.env.PORT || 3000
const express = require('express')
const app = express()
const authService = new AuthService();

app.use(cookieParser());

app.use(
    OpenApiValidator.middleware({
        apiSpec: "./openapi.yaml",
        validateRequests: true, // (default)
        validateResponses: false, // false by default
    })
);

const checkLogin = async (req, res, next) => {
    const session = req.cookies.session;
    if (!session) {
        res.status(401);
        return res.json({ message: "You need to be logged in to see this page." });
    }
    const email = await authService.getUserEmailForSession(session);
    if (!email) {
        res.status(401);
        return res.json({ message: "You need to be logged in to see this page." });
    }
    req.userEmail = email;
    next();
};



app.post("/login", async (req, res) => {
    const payload = req.body;
    const sessionId = await authService.login(payload.email, payload.password);
    if (!sessionId) {
        res.status(401);
        return res.json({ message: "Bad email or password" });
    }
    res.cookie("session", sessionId, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ status: "ok" });
});

app.get("/karte", checkLogin, (req, res) => {
    //TODO
});

app.get("/reisen", checkLogin, (req, res) => {
    //TODO
});

app.post("/reisen", checkLogin, (req, res) => {
    //TODO
});

app.put("/reisen", checkLogin, (req, res) => {
    //TODO
});

app.delete("/reisen", checkLogin, (req, res) => {
    //TODO
});

app.listen(port, () => {
    console.log(`App started successfully`);
});
