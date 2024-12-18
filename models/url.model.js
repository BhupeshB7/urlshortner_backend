import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  ip: {
    type: String, 
  },
  device: {
    type: String,
  },
  browser: {
    type: String,
  },
  os: {
    type: String,
  },
  location: [
    {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
    },
  ],
}, { timestamps: true });

const urlSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  counts: {
    type: Number,
    default: 0,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
  },
  analytics: [analyticsSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model("Url", urlSchema);
