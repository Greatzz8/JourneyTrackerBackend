import db from "./conn.mjs";
import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import env from "dotenv";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";

var app = express();

const corsOptions = {
  origin: true, //included origin as true
  credentials: true, //included credentials as true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
env.config();
async function getUserByEmail(email) {
  const user = await db.collection("User").findOne({ email: email });
  return user;
}

app.post("/register", async function (req, res) {
  const check = await getUserByEmail(req.body.email);
  if (check !== null) {
    console.log("User already exists.");
    res.send(JSON.stringify({ result: "fail" }));
  } else {
    let hash = bcrypt.hashSync(req.body.password, 10);
    await db.collection("User").insertOne({
      email: req.body.email,
      password: hash,
      name: req.body.name,
    });
    res.send(JSON.stringify({ result: "success" }));
  }
});

app.post("/login", async function (req, res) {
  const email = req.body.email;
  let user = await getUserByEmail(email);
  if (user !== null && bcrypt.compareSync(req.body.password, user.password)) {
    let token = jwt.sign({ email: email }, process.env.TOKEN_SECRET, {
      expiresIn: "6h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 30 * 24 * 3600 });
    return res.send(JSON.stringify({ email: email, name: user.name }));
  } else {
    return res.sendStatus(401);
  }
});

app.get("/auth", async function (req, res) {
  let token = req.cookies.token;
  if (!token) {
    return res.sendStatus(401);
  }
  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const result = await getUserByEmail(user.email);
    if (result !== null) {
      return res.send(
        JSON.stringify({ email: result.email, name: result.name })
      );
    } else {
      res.sendStatus(401);
    }
  } catch {
    res.sendStatus(401);
  }
});

app.delete("/logout", (req, res) => {
  res.clearCookie("token");
  res.end();
});

app.use(express.static("dist"));
app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/pricing", (req, res) => {
  res.sendFile("index.html", { root: "./dist/" });
});

app.get("/product", (req, res) => {
  res.sendFile("index.html", { root: "./dist/" });
});

app.get("/login", (req, res) => {
  res.sendFile("index.html", { root: "./dist/" });
});

app.get("/register", (req, res) => {
  res.sendFile("index.html", { root: "./dist/" });
});

app.use(auth_jwt);

app.get("/cities/:id", async function (req, res) {
  const user = req.user.email;
  if (user === undefined) {
    return res.sendStatus(401);
  }
  const cityId = req.params["id"];
  let city = await db
    .collection("City")
    .findOne({ _id: new ObjectId(cityId), user: user });
  res.send(JSON.stringify(city));
});

app.get("/cities", async function (req, res) {
  const user = req.user.email;
  if (user === undefined) {
    return res.sendStatus(401);
  }
  let cities = await db.collection("City").find({ user: user });
  cities = await cities.toArray();
  res.send(JSON.stringify(cities));
});

app.post("/cities", async function (req, res) {
  const user = req.user.email;
  if (user === undefined) {
    return res.sendStatus(401);
  }
  const newCity = req.body;
  newCity.user = user;
  await db.collection("City").insertOne(newCity);
  res.send(JSON.stringify(newCity));
});

app.delete("/cities/:id", async function (req, res) {
  const user = req.user.email;
  if (user === undefined) {
    return res.sendStatus(401);
  }
  await db
    .collection("City")
    .deleteOne({ _id: new ObjectId(req.params.id), user: user });
  res.end();
});

app.listen(8001, "127.0.0.1");

function auth_jwt(req, res, next) {
  let token;
  token = req.cookies.token;

  try {
    let user = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    console.log(req.originalUrl);
    res.clearCookie("token");
    res.sendStatus(401);
  }
}
