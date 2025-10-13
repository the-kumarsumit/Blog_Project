"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";

export const user_service = "http://localhost:5000";
export const author_service = "http://localhost:5001";
export const blog_service = "http://localhost:5002";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  bio: string;
}
export interface Blog {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  author: string;
  created_at: string;
}

interface SavedBlogType {
  id: string;
  userid: string;
  blogid: string;
  created_at: string;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  blogs: Blog[] | null;
  blogLoading: boolean;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  fetchBlogs: () => Promise<void>;
  savedBlogs: SavedBlogType[] | [];
  getSavedBlogs: () => Promise<void>;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppPrvoviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppPrvoviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

      const { data } = await axios.get(`${user_service}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  const [blogLoading, setBlogLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  async function fetchBlogs() {
    setBlogLoading(true);
    try {
      const { data } = await axios.get(
        `${blog_service}/api/v1/blog/all?searchQuery=${debouncedSearchQuery}&category=${category}`
      );
      setBlogs(data);
    } catch (error) {
      console.log(error);
    } finally {
      setBlogLoading(false);
    }
  }

  const [savedBlogs, setsavedBlogs] = useState<SavedBlogType[] | []>([]);

  async function getSavedBlogs() {
    try {
      const token = Cookies.get("token");
      const { data } = await axios.get(
        `${blog_service}/api/v1/blog/saved/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setsavedBlogs(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logout Successfull");
  }

  useEffect(() => {
    fetchUser();
    getSavedBlogs();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [debouncedSearchQuery, category]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        setIsAuth,
        loading,
        setLoading,
        setUser,
        logoutUser,
        blogs,
        blogLoading,
        setCategory,
        searchQuery,
        setSearchQuery,
        fetchBlogs,
        savedBlogs,
        getSavedBlogs,
      }}
    >
      <GoogleOAuthProvider clientId="537179451429-ks3ii5diiljum9f7hhgel0kt1ti5hae2.apps.googleusercontent.com">
        {children}
        <Toaster />
      </GoogleOAuthProvider>
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useappdata must be use withing app provider");
  }
  return context;
};
