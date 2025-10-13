"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  author_service,
  Blog,
  blog_service,
  useAppData,
  User,
} from "@/context/AppContext";
import axios from "axios";
import { Bookmark, BookmarkCheck, Edit, Trash2Icon, User2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface Comment {
  id: string;
  userid: string;
  comment: string;
  created_at: string;
  username: string;
}

const BlogPage = () => {
  const { isAuth, user, fetchBlogs, savedBlogs, getSavedBlogs } = useAppData();
  const router = useRouter();
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog[] | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  async function addComment() {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${blog_service}/api/v1/comment/${id}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data?.message);
      setComment("");
      fetchComments();
    } catch (error) {
      toast.error("Problem while adding comment");
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    setLoading(true);
    try {
      const { data } = await axios.get(`${blog_service}/api/v1/comment/${id}`);
      setComments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const deleteComment = async (id: string) => {
    if (confirm("Are you sure want to delete this comment")) {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const { data } = await axios.delete(
          `${blog_service}/api/v1/comment/${id},`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(data?.message);
        fetchComments();
      } catch (error) {
        toast.error("Problem while deleting comment");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  async function fetchSingleBlog() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`);
      setBlog(data?.blog);
      setAuthor(data?.author);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBlog() {
    if (confirm("Are you sure want to delete this blog")) {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const { data } = await axios.delete(
          `${author_service}/api/v1/blog/${id},`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(data?.message);
        router.push("/blogs");
        setTimeout(() => {
          fetchBlogs();
        });
      } catch (error) {
        toast.error("Problem while deleting blog");
      } finally {
        setLoading(false);
      }
    }
  }

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedBlogs && savedBlogs.some((b) => b.blogid === id)) {
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [savedBlogs, id]);

  async function saveBlog() {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${blog_service}/api/v1/save/${id},`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data?.message);
      setSaved(!saved);
      getSavedBlogs();
    } catch (error) {
      toast.error("Problem while saving blog");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleBlog();
  }, [id]);

  if (!blog) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <Link
              href={`/profile/${author?.id}`}
              className="flex items-center gap-2"
            >
              <img
                src={author?.image}
                alt=""
                className="w-8 h-8 rounded-full "
              />
              {author?.name}
            </Link>
            {isAuth && (
              <Button
                variant={"ghost"}
                className="mx-3"
                size={"lg"}
                onClick={saveBlog}
                disabled={loading}
              >
                {saved ? <BookmarkCheck /> : <Bookmark />}
              </Button>
            )}
            {blog?.author === user?._id && (
              <>
                <Button
                  size={"sm"}
                  // variant={"outline"}
                  onClick={() => router.push(`/blog/edit/${id}`)}
                >
                  <Edit />
                </Button>
                <Button
                  size={"sm"}
                  variant={"destructive"}
                  className="mx-2"
                  onClick={deleteBlog}
                  disabled={loading}
                >
                  <Trash2Icon />
                </Button>
              </>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <img
            src={blog.image}
            alt=""
            className="wfull h-64 object-cover rounded-lg mb-4"
          />
          <p className="text-lg text-gray-700 mb-4">{blog.description}</p>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.blogcontent }}
          />
        </CardContent>
      </Card>
      {isAuth && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Leave a Comment</h3>
          </CardHeader>
          <CardContent>
            <Label htmlFor="comment">Your Comment</Label>
            <Input
              id="comment"
              placeholder="Type your comment here"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="my-2"
            />
            <Button onClick={addComment} disabled={loading}>
              {loading ? "Adding comment..." : "Post Comment"}
            </Button>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">All Comments</h3>
        </CardHeader>
        <CardContent>
          {comments && comments.length > 0 ? (
            comments.map((element, index) => (
              <div
                key={index}
                className="border-b py-2 flex items-center gap-3"
              >
                <div>
                  <p className="font-semibold flex items-center gap-1 ">
                    <span className="user border-gray-400 rounded-full p-1">
                      <User2 />
                    </span>
                    {element.username}
                  </p>
                  <p>{element.comment}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(element.created_at).toLocaleString()}
                  </p>
                </div>
                {element.userid === user?._id && (
                  <Button
                    onClick={() => deleteComment(element.id)}
                    variant={"destructive"}
                    disabled={loading}
                  >
                    <Trash2Icon />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p>No Comments Yet...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPage;
