"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, UserCog } from "lucide-react";
import { User } from "./user-table";

interface ImpersonateDialogProps {
  open: boolean;
  user: User | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ImpersonateDialog({
  open,
  user,
  loading,
  onClose,
  onConfirm,
}: ImpersonateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="size-5" />
            ユーザーとして操作
          </DialogTitle>
          <DialogDescription>
            {user?.name}としてログインします
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="size-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">偽装ログインについて：</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>このユーザーとして完全にログインします</li>
                <li>ユーザーの権限と表示内容が適用されます</li>
                <li>セッションは1時間有効です</li>
                <li>元の管理者に戻るには、ログアウトして再ログインしてください</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ユーザー名:</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">メール:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">役割:</span>
            <span className="font-medium">
              {user?.role === "admin" ? "管理者" : "ユーザー"}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            偽装ログイン
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
