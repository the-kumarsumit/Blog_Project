"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData, user_service } from "@/context/AppContext";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie"
import toast from "react-hot-toast";
import { Edit, Facebook, Instagram, Linkedin } from "lucide-react";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { redirect, useRouter } from "next/navigation";
import axios from "axios";

const ProfilePage = () => {

    const { user, loading, setUser,logoutUser } = useAppData();
    
    useEffect(()=>{
      if(!loading && !user){
        redirect("/login")
      }
    },[loading,user])

    const logoutHandler=()=>{
        logoutUser()
    }
    
    const clickHandler = () => {
        inputRef.current?.click()
    }
    const inputRef = useRef<HTMLInputElement>(null)
    const [profileLoading, setProfileLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        instagram: "",
        facebook: "",
        linkedin: "",
        bio: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                instagram: user.instagram || "",
                facebook: user.facebook || "",
                linkedin: user.linkedin || "",
                bio: user.bio || "",
            });
        }
    }, [user]);


    const changeHandler = async (e: any) => {
        const file = e.taget.files[0]
        if (file) {
            const formData = new FormData()
            formData.append("file", file)
            try {
                setProfileLoading(true)
                const token = Cookies.get("token")
                const data = await axios.post(`${user_service}/api/v1/user/update/pic`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                toast.success(data?.message)
                setProfileLoading(false)
                Cookies.set("token", data.token, {
                    expires: 5,
                    secure: true,
                    path: "/"
                })
                setUser(data?.user)
            } catch (error) {
                toast.error("Failed to Update Image")
            } finally {
                setProfileLoading(false)
            }
        }
    }

    const hnadleFormSubmit = async () => {
        try {
            setProfileLoading(true)
            const token = Cookies.get("token")
            const { data } = await axios.post(`${user_service}/api/v1/user/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(data)
            toast.success(data?.message)
            setProfileLoading(false)
            Cookies.set("token", data.token, {
                expires: 5,
                secure: true,
                path: "/"
            })
            setUser(data?.user)
            setOpen(false)
        } catch (error) {
            toast.error("Failed to Update")
        } finally {
            setProfileLoading(false)
        }
    }
    if(loading){
      return <Loading/>
    }

    return <div className="flex justify-center items-center min-h-screen p-4">
        {profileLoading ? <Loading /> :
            (<Card className="w-full max-w-xl shadow-lg rounded-2xl p-6">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-semibold">
                        Profile
                    </CardTitle>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer rounded-full">
                            <AvatarImage src={user?.image} className="w-26 h-26" alt="Profile Pic" />
                            <Edit className="h-4 w-full m-0" onClick={clickHandler} />
                            <input type="file" className="hidden" accept="image/*" ref={inputRef} onChange={changeHandler} />
                        </Avatar>
                        <div className="w-full space-y-2 text-center">
                            <label className="font-medium">Name</label>
                            <p>{user?.name}</p>
                        </div>

                        {
                            user?.bio && (
                                <div className="w-full space-y-2 text-center">
                                    <label className="font-medium">Bio</label>
                                    <p>{user?.bio}</p>
                                </div>
                            )
                        }
                        <div className="flex gap-4 mt-3">
                            {
                                user?.instagram && (
                                    <a href={user.instagram} target="_blank" rel="noopener noreferrer">
                                        <Instagram className="text-pink-500 text-2xl" />
                                    </a>
                                )
                            }
                            {
                                user?.facebook && (
                                    <a href={user.facebook} target="_blank" rel="noopener noreferrer">
                                        <Facebook className="text-blue-500 text-2xl" />
                                    </a>
                                )
                            }
                            {
                                user?.linkedin && (
                                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer">
                                        <Linkedin className="text-blue-700 text-2xl" />
                                    </a>
                                )
                            }
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full justify-center">
                            <Button onClick={()=>router.push("/blog/new")}>Add Post</Button>
                            <Button onClick={logoutHandler}>Logout</Button>

                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button variant={"outline"}>Edit</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Edit Profile</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <div>
                                            <Label>Name</Label>
                                            <Input value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})}/>
                                        </div>
                                        <div>
                                            <Label>Bio</Label>
                                            <Input value={formData.bio} onChange={e=>setFormData({...formData,bio:e.target.value})}/>
                                        </div>
                                        <div>
                                            <Label>Instagram</Label>
                                            <Input value={formData.instagram} onChange={e=>setFormData({...formData,instagram:e.target.value})}/>
                                        </div>
                                        <div>
                                            <Label>Facebook</Label>
                                            <Input value={formData.facebook} onChange={e=>setFormData({...formData,facebook:e.target.value})}/>
                                        </div>
                                        <div>
                                            <Label>Linkedin</Label>
                                            <Input value={formData.linkedin} onChange={e=>setFormData({...formData,linkedin:e.target.value})}/>
                                        </div>
                                        <Button onClick={hnadleFormSubmit} className="w-full mt-4">Save Changes</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </CardHeader>
            </Card>
            )}
    </div>;
};

export default ProfilePage;
