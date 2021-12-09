import prompt from "prompt";
import AuthService from "../services/AuthService";

const authService = new AuthService();

prompt.start();

prompt.get(["email", "password"], function (err, result) {
  authService
    .create({
      email: result.email as string,
      password: result.password as string,
    })
    .then(() => {
      console.log("Created user!");
    })
    .catch((e) => {
      console.error("Error in creating user", e);
    });
});
