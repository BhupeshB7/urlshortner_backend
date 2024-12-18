import express from "express";
import urlRoute from "./url.route.js";
const router = express.Router();

router.use("/v1", urlRoute);

export default router;
