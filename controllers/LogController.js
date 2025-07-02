const LogModel = require("../models/LogModel");

exports.getLogs = [
    async (req, res) => {
        try {
            const {
                level,
                service,
                startDate,
                endDate,
                limit = 50,
                page = 1,
                search,
            } = req.query;

            let query = {};

            // Apply filters
            if (level) query.level = level;
            if (service) query.service = service;

            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = new Date(startDate);
                if (endDate) query.timestamp.$lte = new Date(endDate);
            }

            if (search) {
                query.message = { $regex: search, $options: "i" };
            }

            const skip = (page - 1) * parseInt(limit);

            const logs = await LogModel.find(query)
                .sort({ timestamp: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            const total = await LogModel.countDocuments(query);

            res.json({
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            });
        } catch (error) {
            console.error("Error fetching logs:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
]

exports.getLogStats = [
    async (req, res) => {
        try {
            const { seconds = 60 } = req.query;
            const timeThreshold = new Date(Date.now() - seconds * 1000);

            // Get recent stats from database for accuracy
            const recentStats = await Log.aggregate([
                { $match: { timestamp: { $gte: timeThreshold } } },
                { $group: { _id: "$level", count: { $sum: 1 } } },
            ]);

            const dbStats = { INFO: 0, WARN: 0, ERROR: 0, total: 0 };

            recentStats.forEach((stat) => {
                dbStats[stat._id] = stat.count;
                dbStats.total += stat.count;
            });

            const errorRate =
                dbStats.total > 0
                    ? ((dbStats.ERROR / dbStats.total) * 100).toFixed(2)
                    : 0;

            res.json({
                ...dbStats,
                errorRate,
                timeRange: `Last ${seconds} seconds`,
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
]