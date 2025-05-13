import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { serve } from "inngest/express";
import dbConnect from "./config/db.js";
import { functions, inngest } from "./inngest/index.js";
import apiRoutes from "./routes/api.js";
import getScript from "./utils/getScript.js";

import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
dbConnect();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
    signingKey: process.env.INNGEST_SIGNING_KEY,
  })
);

// app.use("/gen-script", async (req, res, next) => {
//   try {
//     const { prompt } = req.body;
//     const result = await getScript(prompt);
//     return res.status(200).json({ success: true, script: result });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

app.use("/api", apiRoutes);

app.get("/", async (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));
