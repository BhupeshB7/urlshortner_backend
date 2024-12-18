import express from "express";
import mainRoute from "./routes/main.route.js";
import cors from "cors";
import connectDB from "./config/db.js";
const app = express();
const PORT = 5000 || process.env.PORT;
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000", // Development origin
        "https://shortenx.netlify.app", // Production origin
      ];
       
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, 
  })
);

app.disable("x-powered-by");
app.set("trust proxy", true);
connectDB();
app.get("/", (req, res) => {
  res.send("Url shortner(shortenX) backend server is running");
});
app.use("/api", mainRoute);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
