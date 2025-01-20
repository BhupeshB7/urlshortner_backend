import bcrypt, { hashSync } from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import URL from "../models/url.model.js";
import axios from "axios";
import useragent from "express-useragent";
const decryptUrl = (encryptedUrl, secretKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedUrl, secretKey);
  const decryptedUrl = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedUrl;
};
const generate8DigitId = () => {
  const uuid = uuidv4().replace(/-/g, "");
  return uuid.substring(0, 8).toUpperCase();
};

export const deleteAllUrls = async (req, res) => {
  try {
    await URL.deleteMany({});
    res
      .status(200)
      .json({ success: true, message: "All URLs deleted successfully" });
  } catch (error) {
    console.error("Error fetching URLs:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const getAllUrls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const searchQuery = req.query.search || "";

    const searchFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { url: { $regex: searchQuery, $options: "i" } },
            { shortUrl: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    const perPage = limit;
    const totalUrls = await URL.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalUrls / perPage);

    const urls = await URL.find(searchFilter)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, urls, totalPages, page });
  } catch (error) {
    console.error("Error fetching URLs:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getUrl = async (req, res) => {
  try {
    const { shortUrlId } = req.params;
    console.log("Short URL ID:", shortUrlId);
    const urlEntry = await URL.findOne({ shortUrl: shortUrlId });

    if (!urlEntry) {
      return res.status(404).json({ success: false, message: "URL not found" });
    }
    const secretKey = "fnwnfohcnwnfoewfcnweofne";
    const url = decryptUrl(urlEntry.url, secretKey);
    let ip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;
    const ua = useragent.parse(req.headers["user-agent"]);
    const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
    const geoData = geoResponse.data;
    const analyticsData = {
      ip: ip,
      browser: ua.browser || "Unknown",
      device: ua.isMobile ? "Mobile" : ua.isTablet ? "Tablet" : "Desktop",
      os: ua.os || "Unknown",
      location: [
        {
          country: geoData.country_name || "Unknown",
          city: geoData.city || "Unknown",
        },
      ],
    };
    urlEntry.counts += 1;
    urlEntry.analytics.push(analyticsData);
    await urlEntry.save();
    res.status(200).json({ success: true, originalUrl: url });
  } catch (error) {
    console.error("Error fetching URL:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
export const getUrlByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const perPage = limit;
        const searchQuery = req.query.search || "";

        if (!email) {
            return res
                .status(400)
                .json({ success: false, message: "Please provide a valid email" });
        }

        // Apply email filter along with search criteria
        const searchFilter = {
            email, // Ensure results are filtered by email
            ...(searchQuery
                ? {
                    $or: [
                        { name: { $regex: searchQuery, $options: "i" } },
                        { url: { $regex: searchQuery, $options: "i" } },
                        { shortUrl: { $regex: searchQuery, $options: "i" } },
                    ],
                }
                : {}),
        };

        // Get total number of matching URLs for pagination
        const totalUrls = await URL.countDocuments(searchFilter);
        const totalPages = Math.ceil(totalUrls / perPage);

        // Fetch paginated URLs
        const urls = await URL.find(searchFilter)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 });

        if (urls.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "No data found" });
        }

        res.status(200).json({ success: true, urlData: urls, totalPages, page });
    } catch (error) {
        console.error("Error fetching URLs:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const generateUrl = async (req, res) => {
  const { encodedUrl, customUrl, email, name } = req.body;
  // console.log("Encoded URL:", encodedUrl);
  // console.log("Custom URL:", customUrl);

  try {
    if (!encodedUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid URL" });
    }
    const existCustomUrl = await URL.findOne({ shortUrl: customUrl });
    if (existCustomUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Custom URL Name already exists" });
    }
    let shortUrl = "";
    if (!customUrl) {
      shortUrl = generate8DigitId();
    } else {
      shortUrl = customUrl;
    }

    const savedURL = await URL.create({
      url: encodedUrl,
      shortUrl,
      counts: 0,
      email,
      name,
    });
    await savedURL.save();

    res.status(200).json({
      success: true,
      message: "URL generated successfully",
      shortUrl: shortUrl,
    });
  } catch (error) {
    // console.error("Error generating URL:", error);
    res.status(500).json({ success: false, message: "Error generating URL" });
  }
};
