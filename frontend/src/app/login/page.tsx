"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppData, user_service } from "@/context/AppContext";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { redirect } from "next/navigation";
import Loading from "@/components/Loading";

const LoginPage = () => {

  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData()

  if (isAuth) {
    return redirect("/blogs")
  }
  const responseGoogle = async (authResult: any) => {
    setLoading(true)
    try {

      const result = await axios.post(`${user_service}/api/v1/login`, {
        code: authResult["code"],
      });

      Cookies.set("token", result.data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });

      toast.success(result.data.message);
      setIsAuth(true)
      setLoading(false)
      setUser(result.data.user)
    } catch (error) {
      console.log("error: ", error);
      toast.error("Problem while login");
      setLoading(false)
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  return (
    <>
      {loading ? (<Loading />) :
        (<div className="w-full m-auto mt-[200px] flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Login to Reading Valley</CardTitle>
              <CardDescription>Your goto Blog App</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={googleLogin}>
                <img
                  src={"/google_icon.png"}
                  className="w-8 h-8"
                  alt="google icon"
                />
                Login with Google
              </Button>
            </CardContent>
          </Card>
        </div>)
      }
    </>

  );
};

export default LoginPage;
