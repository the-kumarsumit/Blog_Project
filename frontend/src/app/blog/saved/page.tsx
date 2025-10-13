"use client";
import BlogCard from "@/components/BlogCard";
import Loading from "@/components/Loading";
import { useAppData } from "@/context/AppContext";
import React from "react";

const SavedBlogs = () => {
  const { blogs, savedBlogs } = useAppData();

  if (!blogs || !savedBlogs) {
    return <Loading />;
  }

  const filteredBlogs = blogs.filter((blog) =>
    savedBlogs.some((saved) => saved.blogid === blog.id.toString())
  );
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mt-2"> Saved Blogs</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((element, index) => (
            <BlogCard
              key={index}
              image={element.image}
              title={element.title}
              desc={element.description}
              id={element.id}
              time={element.created_at}
            />
          ))
        ) : (
          <p>No Saved Blogs Yet</p>
        )}
      </div>
    </div>
  );
};

export default SavedBlogs;
