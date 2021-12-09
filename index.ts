import express, { Request } from "express";
import cookieParser from "cookie-parser";
import ExpenseService from "./services/ExpenseService";
import * as OpenApiValidator from "express-openapi-validator";
import { HttpError } from "express-openapi-validator/dist/framework/types";
import AuthService from "./services/AuthService";
import { knex as knexDriver } from "knex";
import config from "./knexfile";

const app = express();
const port = process.env.PORT || 3000;

const knex = knexDriver(config);
const expenseService = new ExpenseService(knex);
const authService = new AuthService();

app.use(express.json());
app.use(cookieParser());

app.use(
  OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true,
    validateResponses: false,
  })
);

const checkLogin = async (
  req: Request,
  res: express.Response,
  next: express.NextFunction
) => {
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

app.use(
  (
    err: HttpError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // format error
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  }
);

app.post("/expenses", checkLogin, (req, res) => {
  const payload = req.body;
  expenseService.add(payload).then((newEntry) => res.send(newEntry));
});

app.delete("/expenses/:expenseId", checkLogin, (req, res) => {
  const id = req.params.expenseId;
  expenseService.delete(id).then(() => {
    res.status(204);
    res.send();
  });
});

app.get("/expenses", checkLogin, (req, res) => {
  expenseService.getAll().then((total) => res.send(total));
});

app.get("/summary", checkLogin, async (req, res) => {
  const total = await expenseService.getTotal();
  res.json({ value: total });
});

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

app.listen(port, () => {
  console.log(`Expenses app listening at http://localhost:${port}`);
});
