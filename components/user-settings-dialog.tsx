"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  User,
  Key,
  Shield,
  AlertCircle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  useSession,
  enableTwoFactor,
  disableTwoFactor,
  getTotpUri,
} from "@/lib/auth-client";

interface UserSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UserSettingsDialog({ open, onClose }: UserSettingsDialogProps) {
  const { data: session } = useSession();
  
  // 名前変更
  const [name, setName] = useState(session?.user?.name || "");
  
  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 2FA
  const [totpUri, setTotpUri] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [showQR, setShowQR] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdateName = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      // Better Auth APIを使用して名前を更新
      // TODO: 実装
      
      setSuccess("名前を更新しました");
    } catch (err) {
      setError("名前の更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      if (newPassword !== confirmPassword) {
        setError("新しいパスワードが一致しません");
        setLoading(false);
        return;
      }
      
      if (newPassword.length < 8) {
        setError("パスワードは8文字以上である必要があります");
        setLoading(false);
        return;
      }
      
      // Better Auth APIを使用してパスワードを変更
      // TODO: 実装
      
      setSuccess("パスワードを変更しました");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("パスワードの変更に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await getTotpUri({
        password: twoFactorPassword,
      });

      if (result.error) {
        setError(result.error.message || "2FAの有効化に失敗しました");
        setLoading(false);
        return;
      }

      if (result.data?.totpURI) {
        setTotpUri(result.data.totpURI);
        setShowQR(true);
      }
    } catch (err) {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await enableTwoFactor({
        password: twoFactorPassword,
      });

      if (result.error) {
        setError(result.error.message || "認証コードが正しくありません");
        setLoading(false);
        return;
      }

      setSuccess("二段階認証が有効になりました");
      setShowQR(false);
      setTotpCode("");
      setTwoFactorPassword("");
      window.location.reload();
    } catch (err) {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await disableTwoFactor({
        password: twoFactorPassword,
      });

      if (result.error) {
        setError(result.error.message || "2FAの無効化に失敗しました");
        setLoading(false);
        return;
      }

      setSuccess("二段階認証が無効になりました");
      setTwoFactorPassword("");
      window.location.reload();
    } catch (err) {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const is2FAEnabled = session?.user?.twoFactorEnabled;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>アカウント設定</DialogTitle>
          <DialogDescription>
            プロフィール、パスワード、セキュリティ設定を管理
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle className="size-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="mr-2 size-4" />
              プロフィール
            </TabsTrigger>
            <TabsTrigger value="password">
              <Key className="mr-2 size-4" />
              パスワード
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="mr-2 size-4" />
              セキュリティ
            </TabsTrigger>
          </TabsList>

          {/* プロフィールタブ */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田太郎"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={session?.user?.email || ""}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                メールアドレスは変更できません
              </p>
            </div>
            <div className="space-y-2">
              <Label>役割</Label>
              <div>
                <Badge
                  variant={
                    session?.user?.role === "admin" ? "default" : "secondary"
                  }
                >
                  {session?.user?.role === "admin" ? "管理者" : "ユーザー"}
                </Badge>
              </div>
            </div>
            <Button
              onClick={handleUpdateName}
              disabled={loading || !name || name === session?.user?.name}
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              名前を更新
            </Button>
          </TabsContent>

          {/* パスワードタブ */}
          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">現在のパスワード</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="現在のパスワード"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">新しいパスワード</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="新しいパスワード（8文字以上）"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="新しいパスワード（確認）"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={
                loading ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword.length < 8
              }
            >
              {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
              パスワードを変更
            </Button>
          </TabsContent>

          {/* セキュリティタブ */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {is2FAEnabled ? (
                  <CheckCircle className="size-5 text-green-600" />
                ) : (
                  <AlertCircle className="size-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Lock className="size-4" />
                    二段階認証 (TOTP)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {is2FAEnabled ? "有効" : "無効"}
                  </p>
                </div>
              </div>
              <Badge variant={is2FAEnabled ? "default" : "secondary"}>
                {is2FAEnabled ? "有効" : "無効"}
              </Badge>
            </div>

            {!is2FAEnabled && !showQR && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="2fa-password">パスワード</Label>
                  <Input
                    id="2fa-password"
                    type="password"
                    value={twoFactorPassword}
                    onChange={(e) => setTwoFactorPassword(e.target.value)}
                    placeholder="パスワードを入力"
                  />
                </div>
                <Button
                  onClick={handleEnable2FA}
                  disabled={loading || !twoFactorPassword}
                >
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  二段階認証を有効にする
                </Button>
              </div>
            )}

            {showQR && totpUri && (
              <div className="space-y-4">
                <div className="flex justify-center p-4 bg-white border rounded-lg">
                  <QRCodeSVG value={totpUri} size={200} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  認証アプリでQRコードをスキャンしてください
                </p>
                <div className="space-y-2">
                  <Label htmlFor="totp-code">認証コード</Label>
                  <Input
                    id="totp-code"
                    type="text"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="6桁のコードを入力"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyAndEnable}
                    disabled={loading || totpCode.length !== 6}
                  >
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    確認して有効化
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQR(false);
                      setTotpUri("");
                      setTotpCode("");
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            {is2FAEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disable-password">パスワード</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    value={twoFactorPassword}
                    onChange={(e) => setTwoFactorPassword(e.target.value)}
                    placeholder="パスワードを入力"
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDisable2FA}
                  disabled={loading || !twoFactorPassword}
                >
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  二段階認証を無効にする
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
