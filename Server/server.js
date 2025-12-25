import express from "express";
import Router from "./routes.js";
import uploadRouter from "./routes/upload.js";
import analysisRouter from "./routes/analysis.js";
import { isConnected, connected } from "./db.js";
import cors from "cors";
import dotenv from "dotenv";
import { Users } from "./models/User.js";

const app = express();
const port = process.env.PORT || 5001;

dotenv.config();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    try {
      res.json({
        database: isConnected() ? "connected" : "disconnected",
      });
    } catch (err) {
      console.log(err);
    }
  });
  app.use(Router);
  app.use('/api/upload', uploadRouter);
  app.use('/api/analysis', analysisRouter);

// Connect to database before starting server
await connected();

app.listen(port, async () => {
  console.log(`🚀 server running on PORT: ${port}`);
});