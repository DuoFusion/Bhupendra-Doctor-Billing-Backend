import express from "express";
import bodyParser from "body-parser";
import { ConnectDB } from "./database/connection";
import { router } from "./Routes";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

ConnectDB();

app.use(
  cors({
    origin: ["http://localhost:5173" , "http://localhost:4173"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", router);

export default app;
