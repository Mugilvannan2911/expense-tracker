const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoute");
const authRoutes = require("./routes/authRoute");

const cookieParser = require("cookie-parser");

const app = express();

// CORS configured to allow Vite dev server ports and support credentials (cookies)
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use(cookieParser());

const prisma = require("./config/prisma");

app.get(["/", "/api"], (req, res) => {
    res.send("Express server is running");
});

app.get("/api/db-status", async (req, res) => {
    const status = await prisma.checkDbConnection();
    if (status.connected) {
        return res.json({
            status: "healthy",
            ...status,
            timestamp: new Date().toISOString()
        });
    }
    return res.status(503).json({
        status: "unhealthy",
        ...status,
        timestamp: new Date().toISOString()
    });
});

app.get("/api/debug-db", async (req, res) => {
    const status = await prisma.checkDbConnection();
    res.json(status);
});

app.use("/api/expense", userRoutes);
app.use("/api/users", authRoutes);

module.exports = app;