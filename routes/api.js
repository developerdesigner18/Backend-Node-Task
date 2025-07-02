var express = require("express");
var router = express.Router();
var logRouter = require('./log');

router.use('/log', logRouter);

module.exports = router;