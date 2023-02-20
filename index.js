import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twitter from "./routes/Twitter.js";
import pingRoutes from "./routes/ping.js";
import jwt from "jsonwebtoken";
import cors from "cors"
import { main } from "./controllers/Twitter.js"
import { ping } from "./controllers/ping.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const SECRET = process.env.SECRET;
const SECRET_KEY = process.env.SECRET_KEY;


app.use(cors())

app.use(bodyParser.json());

app.get("/",cors(), (req, res) => res.send("Welcome to Twitterdev API!"));

app.post("/login", cors(), (req, res) => {
  const { key } = req.body;

  if (key == SECRET_KEY) {
    const token = jwt.sign({ key }, SECRET);

    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid Key" });
  }
});
app.use(
  "/twitter",
  cors(),
  (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
      req.user = decoded;

      next();
    });
  },
  twitter
);


app.use("/ping", pingRoutes);


app.all("*", (req, res) =>res.send("You've tried reaching a route that doesn't exist."));

app.listen(PORT, () =>console.log(`Server running on port: http://localhost:${PORT}`));


setInterval(() => {
  main();
}, /* 10000 */ 300000);

setInterval(() => {
  ping();
}, 300000);

