"use client";

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  UserCog,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useSession, signOut, admin } from "@/lib/auth-client";
import { UserSettingsDialog } from "./user-settings-dialog";

export function NavUser() {
  const { isMobile, state } = useSidebar();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const handleStopImpersonating = async () => {
    try {
      setLoading(true);
      const result = await admin.stopImpersonating();

      if (result.error) {
        console.error("Failed to stop impersonating:", result.error);
        setLoading(false);
        return;
      }

      // 成功したらページをリロードして管理者セッションに戻る
      window.location.href = "/users";
    } catch (err: any) {
      console.error("Failed to stop impersonating:", err);
      setLoading(false);
    }
  };

  // セッションがない場合は何も表示しない
  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const userName = user.name || "ユーザー";
  const userEmail = user.email || "";
  const userAvatar = user.image || "";

  // 偽装ログイン中かチェック
  const isImpersonating = !!(
    (session as any)?.session?.impersonatedBy ||
    (session as any)?.impersonatedBy
  );

  // イニシャルを生成（名前の最初の2文字）
  const initials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {isImpersonating && (
          <div className="px-2 py-1.5 mb-1">
            {isCollapsed ? (
              <div className="flex items-center justify-center">
                <div className="relative">
                  <UserCog className="size-5 text-orange-600" />
                  <div className="absolute -top-1 -right-1 size-2 rounded-full bg-orange-600 animate-pulse" />
                </div>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="w-full justify-center bg-orange-50 text-orange-700 border-orange-200"
              >
                <UserCog className="mr-1 size-3" />
                偽装ログイン中
              </Badge>
            )}
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
                isImpersonating
                  ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-background"
                  : ""
              }`}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs">{userEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <BadgeCheck />
                アカウント設定
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {isImpersonating && (
              <>
                <DropdownMenuItem
                  onClick={handleStopImpersonating}
                  disabled={loading}
                  className="text-orange-600 focus:text-orange-600"
                >
                  <Undo2 />
                  管理者に戻る
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      <UserSettingsDialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </SidebarMenu>
  );
}
