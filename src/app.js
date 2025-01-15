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

//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter) // all routes are complete 
app.use("/api/v1/tweets", tweetRouter) // all routes are complete
app.use("/api/v1/subscriptions", subscriptionRouter) // all routes are complete 
app.use("/api/v1/videos", videoRouter) // all routes are complete 
app.use("/api/v1/comments", commentRouter) // all routes are complete 
app.use("/api/v1/likes", likeRouter) // all route are complete  
app.use("/api/v1/playlist", playlistRouter) // all route are complete  
app.use("/api/v1/dashboard", dashboardRouter) 


export { app };
