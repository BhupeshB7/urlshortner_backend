import express from "express";
import mainRoute from "./routes/main.route.js";
import cors from "cors";
import connectDB from "./config/db.js";
const app = express();
const PORT = 5000 || process.env.PORT;
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);
app.disable("x-powered-by");
app.set("trust proxy", true);
connectDB();
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api", mainRoute);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
