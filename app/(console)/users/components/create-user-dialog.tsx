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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export function CreateUserDialog({
  open,
  onClose,
  onUserCreated,
}: CreateUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setError("すべての項目を入力してください");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上である必要があります");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { admin } = await import("@/lib/auth-client");
      
      const result = await admin.createUser({
        name,
        email,
        password,
        role,
      });

      if (result.error) {
        setError(result.error.message || "ユーザーの作成に失敗しました");
        return;
      }

      // 成功
      handleClose();
      onUserCreated();
    } catch (err: any) {
      setError(err.message || "ユーザーの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>新規ユーザー作成</DialogTitle>
          <DialogDescription>
            新しいユーザーアカウントを作成します
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="create-name">名前 *</Label>
              <Input
                id="create-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田太郎"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-email">メールアドレス *</Label>
              <Input
                id="create-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password">パスワード *</Label>
              <Input
                id="create-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8文字以上"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label>役割</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="create-role"
                    value="user"
                    checked={role === "user"}
                    onChange={(e) =>
                      setRole(e.target.value as "user" | "admin")
                    }
                    className="cursor-pointer"
                  />
                  <span>ユーザー</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="create-role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={(e) =>
                      setRole(e.target.value as "user" | "admin")
                    }
                    className="cursor-pointer"
                  />
                  <span>管理者</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              作成
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
