import express from "express";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";
import userRoutes from "./routes/user.js";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";

dotenv.config();

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY ||!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Error with cloudinary config");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
connectDb();
app.use(express.json());
app.use(cors());
app.use("/api/v1", userRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
