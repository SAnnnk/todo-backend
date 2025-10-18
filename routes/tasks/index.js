const express = require("express");
const router = express.Router();
exports.router = router;

router.use("/", require("./get"));
router.use("/", require("./PUT"));
router.use("/", require("./DELETE"));
router.use("/", require("./POST"));
router.use("/", require("./users"));
router.use("/", require("./categories"));
router.use("/", require("./notes"));
router.use("/", require("./taskstats"));
router.use("/", require("./Dashboard"));
module.exports = router;
