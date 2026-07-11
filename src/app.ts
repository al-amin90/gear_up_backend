import cookieParser from "cookie-parser";
import express, { type Application } from "express";
import cors from "cors";
import config from "./app/config";
import GlobalErrorHandler from "./app/middlewares/GlobalErrorHandler";
import NotFound from "./app/middlewares/NotFound";
import { authRouter } from "./app/modules/auth/auth.route";

const app: Application = express();

app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));

// __) parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "x-tenant",
    ],
    exposedHeaders: ["Authorization"],
  }),
);

// __) all application route here
app.use("/api/auth", authRouter);
// app.use("/api/posts", postRouter);
// app.use("/api/comments", commentRouter);
// app.use("/api/subscription", subscriptionRouter);

app.get("/", (req, res) => {
  res.send(`This app listening on port ${config.port}`);
});

app.use(GlobalErrorHandler);
app.use(NotFound);

export default app;
