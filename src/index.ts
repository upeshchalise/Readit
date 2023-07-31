import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
require("dotenv").config();

import cookieParser from "cookie-parser";

import cors from "cors";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import subRoutes from "./routes/subs";
import miscRoutes from "./routes/misc";
import userRoutes from "./routes/users";

import trim from "./middleware/trim";
import AppDataSource from "./data-source";

AppDataSource.initialize()
  .then(() => {
    console.log(`database connected`);
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);

app.get("/", (_, res) => res.send("hello world"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/subs", subRoutes);
app.use("/api/misc", miscRoutes);
app.use("/api/users", userRoutes);

app.use(express.static("public"));

app.listen(PORT, async () => {
  console.log(`Server has started running at https://localhost:${PORT}`);
});
