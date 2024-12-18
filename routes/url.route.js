import express from "express";
import { deleteAllUrls, generateUrl,  getAllUrls,  getUrl,  getUrlByEmail } from "../controllers/url.controller.js";
import useragent from "express-useragent";

const router = express.Router();
 
router.use(useragent.express());
router.get("/redirect/:shortUrlId", getUrl);
router.get("/getAllUrls", getAllUrls);
router.get("/geturlByEmail/:email", getUrlByEmail);
router.delete("/deleteAllUrls", deleteAllUrls);
router.post("/generateUrl", generateUrl);

export default router;
