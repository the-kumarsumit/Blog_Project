import { type AuthenticatedRequest } from "../middleware/isAuth.js";
import { redisClient } from "../server.js";
import { sql } from "../utils/db.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";

export const getAllBlogs = TryCatch(async (req, res) => {
  const { searchQuery = "", category = "" } = req.query;

  const cacheKey = `blogs:${searchQuery}:${category}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log("Serving from Redis cache");
    res.json(JSON.parse(cached));
    return;
  }
  let blogs;

  if (searchQuery && category) {
    blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
      "%" + searchQuery + "%"
    } OR description ILIKE ${
      "%" + searchQuery + "%"
    }) AND category = ${category} ORDER BY created_at DESC`;
  } else if (searchQuery) {
    blogs = await sql`SELECT * FROM blogs WHERE (title ILIKE ${
      "%" + searchQuery + "%"
    } OR description ILIKE ${
      "%" + searchQuery + "%"
    }) ORDER BY created_at DESC`;
  } else if (category) {
    blogs =
      await sql`SELECT * FROM blogs WHERE category=${category} ORDER BY created_at DESC`;
  } else {
    blogs = await sql`SELECT * FROM blogs ORDER BY created_at DESC`;
  }

  console.log("Serving from db");

  await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

  res.json(blogs);
});

export const getSingleBlog = TryCatch(async (req, res) => {
  const blogid = req.params.id;

  const cacheKey = `blog:${blogid}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log("Serving single blog from Redis cache");
    res.json(JSON.parse(cached));
    return;
  }

  const blog = await sql`SELECT * FROM blogs WHERE id = ${blogid}`;

  if (blog.length === 0) {
    res.status(404).json({
      message: "no blog with this id",
    });
    return;
  }

  const { data } = await axios.get(
    `${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`
  );

  const responseData = { blog: blog[0], author: data };

  await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 3600 });

  res.json(responseData);
});

export const addComment = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  await sql`INSERT INTO comments (comment, blogid, userid, username) VALUES (${comment}, ${id},${req.user?._id},${req.user?.name}) RETURNING *`;

  return res.status(200).json({ message: "Comment added" });
});

export const getAllComments = TryCatch(async (req, res) => {
  const { id } = req.params;
  const comments =
    await sql`SELECT * FROM comments WHERE blogid=${id} ORDER BY created_at DESC`;

  return res.status(200).json({ message: "", comments });
});

export const deleteComment = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { commentid } = req.params;
    const comment = await sql`SELECT * FROM comments WHERE id=${commentid}`;

    if (comment[0]?.userid !== req.user?._id) {
      return res
        .status(401)
        .json({ message: "You are not the owner of this comment" });
    }
    await sql`DELETE FROM comments WHERE id=${commentid}`;
    return res.status(200).json({ message: "Comment Deleted" });
  }
);

export const saveBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { blogid } = req.params;
  const userid = req.user?._id;

  if (!blogid || userid) {
    return res.status(400).json({ message: "Missing blog id oruser id" });
  }

  const existing =
    await sql`SELECT * FROM savedblogs WHERE userid=${userid} AND blogid =${blogid}`;

  if (existing.length === 0) {
    await sql`INSERT INTO savedblogs (blogid,userid) VALUES (${blogid},${userid})`;
    return res.status(200).json({ message: "Blog Saved" });
  } else{
    await sql`DELETE FROM savedblogs WHERE userid=${userid} AND blogid=${blogid}`
    return res.status(200).json({ message: "Blog Unsaved" });
  }
});

export const getSavedBlog =TryCatch(async(req:AuthenticatedRequest,res)=>{
  const blogs = await sql`SELECT * FROM savedblogs WHERE userid=${req.user?._id}`

  return res.status(200).json(blogs)
})