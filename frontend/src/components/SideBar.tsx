"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { BoxSelect } from "lucide-react";
import { blogCategories } from "@/app/blog/new/page";
import { useAppData } from "@/context/AppContext";

const SideBar = () => {
  const { searchQuery, setSearchQuery, setCategory } = useAppData();
  return (
    <Sidebar>
      <SidebarHeader className="bg-white text-2xl font-bold mt-5">
        Reading Valley
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your blog"
          />
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => {
                  setCategory("");
                }}
              >
                <BoxSelect />
                <span>All</span>
              </SidebarMenuButton>
              {blogCategories?.map((element, index) => (
                <SidebarMenuButton
                  key={index}
                  onClick={() => {
                    setCategory(element);
                  }}
                >
                  <BoxSelect />
                  <span>{element}</span>
                </SidebarMenuButton>
              ))}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
