import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import profileRoutes from "./routes/profile.routes.js";
import messageRoutes from "./routes/message.routes.js";
import requestRoutes from "./routes/request.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";


dotenv.config();
const app = express();

app.use(
  cors({
    origin: "https://rsaristomatch.com", // ✅ no https for local frontend
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
app.use("/api/messages", messageRoutes);
app.use("/api/request", requestRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/admin", adminRoutes);


export default app;
