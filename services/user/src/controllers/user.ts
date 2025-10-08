import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/datauri.js";
import { v2 as cloudinary } from "cloudinary";
import { oauth2Client } from "../utils/GoogleConfig.js";
import axios from "axios";

export const loginUser = TryCatch(async (req, res) => {

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ message: "Authorization code is required" })
  }

  const googleRes = await oauth2Client.getToken(code)

  oauth2Client.setCredentials(googleRes.tokens)

  const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)
  const { email, name, picture } = userRes.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image: picture,
    });
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "5d",
  });

  return res.status(200).json({
    user,
    token,
    message: "User login Successfully",
  });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  return res.status(200).json(user);
});

export const getUserProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not exist with this id" });
  }

  return res.status(200).json(user);
});

export const updateUser = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { name, instagram, facebook, linkedin, bio } = req.body;

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      name,
      instagram,
      facebook,
      linkedin,
      bio,
    },
    {
      new: true,
    }
  );

  const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
    expiresIn: "5d",
  });

  return res.status(200).json({ message: "User Updated", user, token });
});

export const updateProfilePic = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "No file to upload, please uload a file" });
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      return res.status(400).json({ message: "Failed to generate buffer" });
    }

    const cloud = await cloudinary.uploader.upload(fileBuffer.content, {
      folder: "blogs"
    })

    const user = User.findByIdAndUpdate(req.user?._id, {
      image: cloud.secure_url
    },
      { new: true })

    const token = jwt.sign({ user }, process.env.JWT_SECRET as string, {
      expiresIn: "5d",
    });

    return res.status(200).json({ message: "User Profile PIcture is Updated", user, token });
  }
);
