import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { serve } from "inngest/express";
import dbConnect from "./config/db.js";
import { functions, inngest } from "./inngest/index.js";
import apiRoutes from "./routes/api.js";
import getScript from "./utils/getScript.js";
dotenv.config();
const app = express();
dbConnect();
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
    signingKey: process.env.INNGEST_SIGNING_KEY,
  })
);

app.use("/gen-script", async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const result = await getScript(prompt);
    return res.status(200).json({ success: false, script: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.post("/gen-video", async (req, res, next) => {
  try {
    const { prompt, voice, videoStyle } = req.body;

    if (!prompt || !voice || !videoStyle)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    const script = await getScript(prompt);

    const result = await inngest.send({
      name: "generate-video-data",
      data: { script, prompt, voice, videoStyle },
    });
    return res.status(200).json({ message: "ok", result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));
