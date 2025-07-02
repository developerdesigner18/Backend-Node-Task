const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const Log = require("./models/LogModel");
const InitializeSocketIo = require("./socket");
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = InitializeSocketIo(server);

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    })
);
app.use(express.json());

const initializeStatsWithAggregation = async () => {
    try {
        const result = await Log.aggregate([
            {
                $group: {
                    _id: "$level",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Initialize stats object
        const initialStats = {
            INFO: 0,
            WARN: 0,
            ERROR: 0,
            total: 0,
            lastUpdated: Date.now(),
        };

        // Populate counts from aggregation result
        let total = 0;
        result.forEach((item) => {
            if (initialStats.hasOwnProperty(item._id)) {
                initialStats[item._id] = item.count;
                total += item.count;
            }
        });

        initialStats.total = total;
        initialStats.errorRate =
            total > 0 ? ((initialStats.ERROR / total) * 100).toFixed(2) : 0;

        // Update global stats
        stats = initialStats;

        // console.log("Initial stats loaded:", stats);
        return stats;
    } catch (error) {
        console.error("Error initializing stats:", error);
        throw error;
    }
};

// In-memory stats for performance
let stats = {};
(async () => {
    stats = await initializeStatsWithAggregation();
})();

// Log Generator
const generateLog = async () => {
    const levels = ["INFO", "WARN", "ERROR"];
    const services = ["auth", "payments", "notifications"];
    const messages = {
        INFO: [
            "User login successful",
            "Payment processed successfully",
            "Notification sent",
            "Service health check passed",
            "Database connection established",
        ],
        WARN: [
            "High memory usage detected",
            "Slow database query",
            "Rate limit approaching",
            "Cache miss detected",
            "API response time increased",
        ],
        ERROR: [
            "Database connection failed",
            "Payment processing error",
            "Authentication failed",
            "Service timeout",
            "Invalid request format",
        ],
    };

    const level = levels[Math.floor(Math.random() * levels.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const message =
        messages[level][Math.floor(Math.random() * messages[level].length)];

    try {
        const log = new Log({
            level,
            service,
            message,
        });

        await log.save();

        // Update in-memory stats
        stats[level]++;
        stats.total++;
        stats.lastUpdated = Date.now();

        // Emit to connected clients
        io.emit("newLog", log);
        io.emit("statsUpdate", {
            ...stats,
            errorRate: ((stats.ERROR / stats.total) * 100).toFixed(2),
        });

        // console.log(`Generated log: ${level} - ${service} - ${message}`);
    } catch (error) {
        console.error("Error generating log:", error);
    }
};

// Start log generation
setInterval(generateLog, 1000);

// API Routes
app.use("/", indexRouter);
app.use("/api", apiRouter);

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Send current stats to new client
    socket.emit("statsUpdate", {
        ...stats,
        errorRate: ((stats.ERROR / stats.total) * 100).toFixed(2),
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

const PORT = process.env.PORT || 5000;
// MongoDB Connection
mongoose
    .connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/log-analyzer",
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    )
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("MongoDB connected");
            console.log("Log generation started...");
        });
    });
