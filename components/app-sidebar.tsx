"use client";

import * as React from "react";
import { Home, Users, Shield, LucideIcon } from "lucide-react";
import Link from "next/link";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSession } from "@/lib/auth-client";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

// 通常メニュー項目
const mainItems: MenuItem[] = [
  {
    title: "ダッシュボード",
    url: "/",
    icon: Home,
  },
];

// 管理メニュー項目
const adminItems: MenuItem[] = [
  {
    title: "ユーザー管理",
    url: "/users",
    icon: Users,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { state } = useSidebar();
  const isAdmin = session?.user?.role === "admin";
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">コンソール</span>
                  <span className="truncate text-xs">
                    {isAdmin ? "管理者" : "ユーザー"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col h-full">
          {/* 通常メニュー */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton asChild>
                            <Link href={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right">
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* スペーサー */}
          <div className="flex-1" />

          {/* 管理メニュー（管理者のみ） */}
          {isAdmin && (
            <SidebarGroup className="mt-auto">
              <SidebarGroupContent>
                {!isCollapsed && (
                  <div className="px-2 py-1 mb-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      管理
                    </p>
                  </div>
                )}
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton asChild>
                              <Link href={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {isCollapsed && (
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
