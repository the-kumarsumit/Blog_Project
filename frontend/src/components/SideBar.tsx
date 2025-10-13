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
import { BoxSelect, CheckSquare } from "lucide-react"; // Import the CheckSquare icon for selected state
import { blogCategories } from "@/app/blog/new/page";
import { useAppData } from "@/context/AppContext";

const SideBar = () => {
  const { searchQuery, setSearchQuery, setCategory, category } = useAppData(); // Also track 'category' from state
  
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
                onClick={() => setCategory("")}
                className={`${
                  category === "" ? "bg-blue-500 text-white" : ""
                } ${category === "" ? "pointer-events-none" : "hover:bg-blue-100"} `}
                // Add pointer-events-none for active state to avoid hover effect
              >
                {category === "" ? (
                  <CheckSquare /> 
                ) : (
                  <BoxSelect />
                )}
                <span>All</span>
              </SidebarMenuButton>
              {blogCategories?.map((element, index) => (
                <SidebarMenuButton
                  key={index}
                  onClick={() => setCategory(element)}
                  className={`${
                    category === element ? "bg-blue-500 text-white" : ""
                  } ${category === element ? "pointer-events-none" : "hover:bg-blue-100"}`}
                >
                  {category === element ? (
                    <CheckSquare /> 
                  ) : (
                    <BoxSelect />
                  )}
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
