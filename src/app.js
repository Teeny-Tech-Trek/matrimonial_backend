// import express from "express";
// import cors from "cors";
// import authRoutes from "./routes/auth.route.js";
// import profileRoutes from "./routes/profile.routes.js";
// import messageRoutes from "./routes/message.routes.js";
// import requestRoutes from "./routes/request.routes.js";
// import dashboardRoutes from "./routes/dashboard.routes.js";
// import adminRoutes from "./routes/admin.routes.js";
// import contactRoutes from "./routes/contact.routes.js";
// import uploadRoutes from "./routes/upload.routes.js";

// const app = express();

// // CORS configuration to allow multiple origins
// app.use(cors({
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       "https://rsaristomatch.com",
//       "https://www.rsaristomatch.com",
//       "http://localhost:5173",
//     ];

//     // Allow requests with no origin (like Postman, mobile apps, etc.)
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// }));

// // Increase payload size limit to handle large data like image uploads
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // Health check route
// app.get("/", (req, res) => {
//   res.send("Matrimonial API is running...");
// });

// // Application routes
// app.use("/api/auth", authRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/messages", messageRoutes);
// app.use("/api/request", requestRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api", contactRoutes);
// app.use("/api", uploadRoutes);

// // Error Handling Middlewares
// import { notFound, errorHandler } from './middlewares/error.middleware.js';
// app.use(notFound);
// app.use(errorHandler);

// export default app;

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import profileRoutes from "./routes/profile.routes.js";
import messageRoutes from "./routes/message.routes.js";
import requestRoutes from "./routes/request.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

// CORS configuration to allow multiple origins
// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       "https://rsaristomatch.com",
//       "https://www.rsaristomatch.com",
//       "http://localhost:5173",
//     ];

//     // Allow requests with no origin (like Postman, mobile apps, etc.)
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   exposedHeaders: ["Content-Range", "X-Content-Range"],
//   maxAge: 86400, // 24 hours
// };

// app.use(cors(corsOptions));

// // Handle preflight requests explicitly
// app.options("*", cors(corsOptions));

// const corsOptions = {
//   origin: "https://www.rsaristomatch.com",
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

// app.use(cors({ origin: true, credentials: true }));
app.use(
  cors({
    origin: [
      "https://matrimonial-frontend-ochre.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// IMPORTANT

// Increase payload size limit to handle large data like image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check route
app.get("/", (req, res) => {
  res.send("Matrimonial API is running...");
});

// Application routes
app.use("/backend/auth", authRoutes);
app.use("/backend/profile", profileRoutes);
app.use("/backend/messages", messageRoutes);
app.use("/backend/request", requestRoutes);
app.use("/backend/dashboard", dashboardRoutes);
app.use("/backend/admin", adminRoutes);
app.use("/backend", contactRoutes);
app.use("/backend", uploadRoutes);

// Error Handling Middlewares
import { notFound, errorHandler } from './middlewares/error.middleware.js';
app.use(notFound);
app.use(errorHandler);

export default app;