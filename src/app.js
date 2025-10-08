import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import profileRoutes from "./routes/profile.routes.js";


dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ no https for local frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Matrimonial API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);


export default app;
