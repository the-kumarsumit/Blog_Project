import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import {
  aiBlogResponse,
  aiDescriptionRespone,
  aiTitleRespone,
  createBlog,
  deleteBlog,
  updateBlog,
} from "../controllers/blog.js";

const router = express();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);
router.post("/ai/title",aiTitleRespone)
router.post("/ai/description",aiDescriptionRespone)
router.post("/ai/blog",aiBlogResponse)

export default router;
