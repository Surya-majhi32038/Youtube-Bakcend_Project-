import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // 5:42:00
    credentials: true // first read about the CORS from npm site and watch the video in Hitech 'how to connect frontend and backend'
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static('public'))
app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/users",userRouter) // everything is done by me but not 


export { app };
