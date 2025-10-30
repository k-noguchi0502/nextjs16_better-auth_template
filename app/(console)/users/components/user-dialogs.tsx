"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { User } from "./user-table";

type DialogType =
  | "password"
  | "disable2fa"
  | "ban"
  | "unban"
  | "revokeSessions"
  | "delete"
  | "editInfo"
  | null;

interface UserDialogsProps {
  dialogType: DialogType;
  selectedUser: User | null;
  actionLoading: boolean;
  isSelf: boolean;
  onClose: () => void;
  onPasswordChange: (password: string) => Promise<void>;
  onDisable2FA: () => Promise<void>;
  onBanToggle: () => Promise<void>;
  onRevokeAllSessions: () => Promise<void>;
  onDeleteUser: () => Promise<void>;
  onEditInfo: (data: {
    name: string;
    email: string;
    role: "user" | "admin";
    banned: boolean;
  }) => Promise<void>;
}

export function UserDialogs({
  dialogType,
  selectedUser,
  actionLoading,
  isSelf,
  onClose,
  onPasswordChange,
  onDisable2FA,
  onBanToggle,
  onRevokeAllSessions,
  onDeleteUser,
  onEditInfo,
}: UserDialogsProps) {
  const [newPassword, setNewPassword] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [editBanned, setEditBanned] = useState(false);

  // ダイアログが開いたときに現在のユーザーデータをセット
  const handleEditInfoOpen = (open: boolean) => {
    if (open && selectedUser && dialogType === "editInfo") {
      setEditName(selectedUser.name || "");
      setEditEmail(selectedUser.email || "");
      setEditRole((selectedUser.role as "user" | "admin") || "user");
      setEditBanned(selectedUser.banned ?? false);
    }
  };

  const handleClose = () => {
    setNewPassword("");
    setEditName("");
    setEditEmail("");
    setEditRole("user");
    setEditBanned(false);
    onClose();
  };

  return (
    <>
      {/* パスワード変更ダイアログ */}
      <Dialog open={dialogType === "password"} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>パスワード変更</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}の新しいパスワードを設定
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">新しいパスワード</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8文字以上"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button
              onClick={() => onPasswordChange(newPassword)}
              disabled={actionLoading || newPassword.length < 8}
            >
              {actionLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              変更
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA無効化ダイアログ */}
      <Dialog open={dialogType === "disable2fa"} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>二段階認証を無効化</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}の二段階認証を無効化しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button onClick={onDisable2FA} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              無効化
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* アカウント停止/解除ダイアログ */}
      <Dialog
        open={dialogType === "ban" || dialogType === "unban"}
        onOpenChange={handleClose}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.banned
                ? "アカウント停止を解除"
                : "アカウントを停止"}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.name}のアカウントを
              {selectedUser?.banned ? "解除" : "停止"}しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button
              variant={selectedUser?.banned ? "default" : "destructive"}
              onClick={onBanToggle}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {selectedUser?.banned ? "解除" : "停止"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* セッション取り消しダイアログ */}
      <Dialog open={dialogType === "revokeSessions"} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>すべてのセッションを取り消し</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}のすべてのセッションを取り消しますか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button onClick={onRevokeAllSessions} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              取り消し
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ユーザー削除ダイアログ */}
      <Dialog open={dialogType === "delete"} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザーを削除</DialogTitle>
            <DialogDescription>
              この操作は取り消せません。{selectedUser?.name}
              とすべての関連データが完全に削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteUser}
              disabled={actionLoading}
            >
              {actionLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ユーザー詳細情報変更ダイアログ */}
      <Dialog
        open={dialogType === "editInfo"}
        onOpenChange={(open) => {
          handleEditInfoOpen(open);
          if (!open) handleClose();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ユーザー情報を変更</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}の詳細情報を変更
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">名前</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="名前を入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">メールアドレス</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="メールアドレスを入力"
                />
              </div>
            </div>

            {!isSelf && (
              <>
                <div className="space-y-2">
                  <Label>役割</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={editRole === "user"}
                        onChange={(e) =>
                          setEditRole(e.target.value as "user" | "admin")
                        }
                        className="cursor-pointer"
                      />
                      <span>ユーザー</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={editRole === "admin"}
                        onChange={(e) =>
                          setEditRole(e.target.value as "user" | "admin")
                        }
                        className="cursor-pointer"
                      />
                      <span>管理者</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>アカウント状態</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="edit-banned"
                      checked={editBanned}
                      onCheckedChange={(checked) =>
                        setEditBanned(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="edit-banned"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      アカウントを停止する
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button
              onClick={() =>
                onEditInfo({
                  name: editName,
                  email: editEmail,
                  role: editRole,
                  banned: editBanned,
                })
              }
              disabled={actionLoading || !editName || !editEmail}
            >
              {actionLoading && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
