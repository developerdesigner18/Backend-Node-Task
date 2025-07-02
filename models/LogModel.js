const mongoose = require('mongoose');

var LogSchema = mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    level: { type: String, enum: ["INFO", "WARN", "ERROR"], required: true },
    service: {
        type: String,
        enum: ["auth", "payments", "notifications"],
        required: true,
    },
    message: { type: String, required: true },
});

LogSchema.index({ timestamp: -1 });
LogSchema.index({ level: 1 });
LogSchema.index({ service: 1 });

module.exports = mongoose.model('Log', LogSchema);
