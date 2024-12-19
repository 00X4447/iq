import os from "os";
import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { userMiddleware } from "./api/v1/middleware/user/middleware";

import userAuthRouter from "./api/v1/routes/user/auth/auth.route";
import userProfileRouter from "./api/v1/routes/user/user/user.credential";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT: number | string = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies

app.get("/", (req: Request, res: Response) => {
  const name = (req.query.name as string)
    ? (req.query.name as string)
    : "World";
  res.send(`Hello, ${name}!`);
});

app.use(
  "/uploads",
  userMiddleware,
  express.static(path.join(__dirname, "./api/v1/uploads"))
);
app.use("/api/v1/auth", userAuthRouter);
app.use("/api/v1/user", userMiddleware, userProfileRouter);

// Get the first IPv4 address of the "wlan0" network interface: DEVELOPMENT ONLY
const networkInterfaces = os.networkInterfaces();

// DEVELOPMENT ONLY
const wlan0Interfaces = networkInterfaces["wlan0"];

if (wlan0Interfaces) {
  const ipv4Interface = wlan0Interfaces.find((i) => i.family === "IPv4");
  if (ipv4Interface) {
    app.listen(PORT as number, ipv4Interface.address, () => {
      console.log(
        `Server is running on http://${ipv4Interface.address}:${PORT}`
      );
    });
  }
}
