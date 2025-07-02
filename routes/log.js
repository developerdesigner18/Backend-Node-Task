var express = require("express");
const { getLogs, getLogStats } = require("../controllers/LogController");

var router = express.Router();

router.get("/", getLogs);
router.get("/stats", getLogStats);

module.exports = router;