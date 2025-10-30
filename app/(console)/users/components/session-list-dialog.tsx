"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Monitor, Smartphone, Tablet, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { admin } from "@/lib/auth-client";
import { User } from "./user-table";

interface Session {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

interface SessionListDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSessionRevoked: () => void;
}

export function SessionListDialog({
  open,
  user,
  onClose,
  onSessionRevoked,
}: SessionListDialogProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      loadSessions();
    }
  }, [open, user]);

  const loadSessions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setSessions([]); // リセット
      const result = await admin.listUserSessions({
        userId: user.id,
      });

      if (result.data) {
        // APIレスポンスの構造を確認
        let sessionData: any[] = [];

        if (Array.isArray(result.data)) {
          sessionData = result.data;
        } else if (result.data && typeof result.data === "object") {
          // オブジェクトの場合、sessionsプロパティを探す
          sessionData = (result.data as any).sessions || [];
        }

        // 配列であることを確認
        if (Array.isArray(sessionData)) {
          setSessions(sessionData as Session[]);
        } else {
          console.warn("Unexpected session data format:", result.data);
          setSessions([]);
        }
      } else {
        setSessions([]);
      }
    } catch (err) {
      toast.error("セッションの取得に失敗しました");
      console.error("Failed to load sessions:", err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    try {
      setRevoking(sessionToken);
      await admin.revokeUserSession({
        sessionToken,
      });
      await loadSessions();
      onSessionRevoked();
    } catch (err) {
      toast.error("セッションの取り消しに失敗しました");
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="size-4" />;
    const ua = userAgent.toLowerCase();
    if (
      ua.includes("mobile") ||
      ua.includes("android") ||
      ua.includes("iphone")
    ) {
      return <Smartphone className="size-4" />;
    }
    if (ua.includes("tablet") || ua.includes("ipad")) {
      return <Tablet className="size-4" />;
    }
    return <Monitor className="size-4" />;
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return "不明なデバイス";

    // ブラウザ検出
    let browser = "不明なブラウザ";
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";

    // OS検出
    let os = "";
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (
      userAgent.includes("iOS") ||
      userAgent.includes("iPhone") ||
      userAgent.includes("iPad")
    )
      os = "iOS";

    return `${browser}${os ? ` on ${os}` : ""}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>セッション一覧</DialogTitle>
          <DialogDescription>
            {user?.name}のアクティブなセッション
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            アクティブなセッションがありません
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex gap-3 flex-1">
                  <div className="mt-1">{getDeviceIcon(session.userAgent)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">
                      {getDeviceInfo(session.userAgent)}
                    </div>
                    {session.ipAddress && (
                      <div className="text-sm text-muted-foreground">
                        IP: {session.ipAddress}
                      </div>
                    )}
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>
                        作成:{" "}
                        {new Date(session.createdAt).toLocaleString("ja-JP")}
                      </span>
                      <span>•</span>
                      <span>
                        期限:{" "}
                        {new Date(session.expiresAt).toLocaleString("ja-JP")}
                      </span>
                    </div>
                    {new Date(session.expiresAt) < new Date() && (
                      <Badge variant="outline" className="text-xs">
                        期限切れ
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevokeSession(session.token)}
                  disabled={revoking === session.token}
                >
                  {revoking === session.token ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            合計 {sessions.length} セッション
          </div>
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
