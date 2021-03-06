import express, { Request } from "express";
import cookieParser from "cookie-parser";
import DBService from "./services/DBService";
import * as OpenApiValidator from "express-openapi-validator";
import { HttpError } from "express-openapi-validator/dist/framework/types";
import AuthService from "./services/AuthService";
import { knex as knexDriver } from "knex";
import config from "./knexfile";

const app = express();
const port = process.env.PORT || 3000;

const knex = knexDriver(config);
const dbService = new DBService(knex);
const authService = new AuthService();

app.use(express.json());
app.use(cookieParser());

app.use(function (req, res, next) {


  res.setHeader('Access-Control-Allow-Origin', 'https://travel-site-project.netlify.app');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  res.status(200)
  // Pass to next layer of middleware
  next();
});

/*
app.use(
  OpenApiValidator.middleware({
    apiSpec: "./openapi.yaml",
    validateRequests: true,
    validateResponses: false,
  })
);
 */

const checkLogin = async (
  req: Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const session = req.cookies.session;
  console.log("Received session is: "+session);
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

app.post("/trips", checkLogin, (req, res) => {
  const payload = req.body;
  console.log(payload.name);
  console.log(payload.destination);
  console.log(payload.startDate);
  console.log(payload.endDate);
  dbService.add(payload,req.userEmail!).then((newEntry) => res.send(newEntry));
});

app.delete("/trips/:tripId", checkLogin, (req, res) => {
  const id = req.params.tripId;
  dbService.delete(id,req.userEmail!).then(() => {
    res.status(204);
    res.send();
  });
});

app.delete("/trips", checkLogin, (req, res) => {
  const payload = req.body;
  dbService.delete(payload.uuid,req.userEmail!).then(() => {
    res.status(204);
    res.send();
  });
});

app.get("/trips", checkLogin, (req, res) => {
  dbService.getAll(req.userEmail!).then((total) => res.send(total));
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
    secure: true,
    sameSite: "none",
  });
  console.log(sessionId);
  res.json({ status: "ok" });
});

app.post("/signup", async (req, res) => {
  const payload = req.body;
  if (payload.password.length < 6 || !validateEmail(payload.email)) {
    res.status(401);
    return res.json({ message: "Bad email or password" });
  } else if(await authService.checkUserExistence(payload.email)) {
    res.status(401);
    return res.json({ message: "User already registered" });
  } else {
    await authService.create({email: payload.email as string,password: payload.password as string})
    res.json({ status: "ok" });
  }
});

app.post("/verify", async (req, res) => {
  const payload = req.body;
  if(await authService.verify(payload.verificationID)) {
    res.json({ status: "ok" });
  } else {
    res.status(401);
    return res.json({ message: "Bad verificationID" });
  }
});

app.listen(port, () => {
  console.log(`Travel app listening at http://localhost:${port}`);
});

const validateEmail = (email:string) => {
return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
};
