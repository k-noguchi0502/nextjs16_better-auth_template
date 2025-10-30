"use client";

import { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { User } from "./user-table";

interface UserContextMenuProps {
  user: User;
  isSelf: boolean;
  onAction: (user: User, action: string) => void;
  children: ReactNode;
}

export function UserContextMenu({
  user,
  isSelf,
  onAction,
  children,
}: UserContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuSub>
          <ContextMenuSubTrigger>アカウント管理</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => onAction(user, "editInfo")}>
              詳細情報を変更
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAction(user, "password")}>
              パスワード変更
            </ContextMenuItem>
            {user.twoFactorEnabled && (
              <ContextMenuItem onClick={() => onAction(user, "disable2fa")}>
                2FA無効化
              </ContextMenuItem>
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSub>
          <ContextMenuSubTrigger>セッション管理</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => onAction(user, "viewSessions")}>
              セッション一覧を表示
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAction(user, "revokeSessions")}>
              すべてのセッションを取り消し
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {!isSelf && (
          <>
            <ContextMenuItem
              onClick={() => onAction(user, user.banned ? "unban" : "ban")}
            >
              {user.banned ? "アカウント停止を解除" : "アカウントを停止"}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onAction(user, "impersonate")}>
              このユーザーとして操作
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => onAction(user, "delete")}
              className="text-destructive"
            >
              ユーザーを削除
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
