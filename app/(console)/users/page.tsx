"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, admin } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import {
  UserTable,
  UserDialogs,
  SessionListDialog,
  CreateUserDialog,
  ImpersonateDialog,
  User,
} from "./components";

type DialogType =
  | "role"
  | "password"
  | "disable2fa"
  | "ban"
  | "unban"
  | "revokeSessions"
  | "viewSessions"
  | "impersonate"
  | "delete"
  | "editInfo"
  | null;

export default function UsersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "admin") {
      router.push("/");
      return;
    }

    if (session) {
      loadUsers();
    }
  }, [session, isPending, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await admin.listUsers({
        query: {
          limit: 100,
          offset: 0,
        },
      });
      if (result.data?.users) {
        setUsers(result.data.users as User[]);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (user: User, action: string) => {
    setSelectedUser(user);
    setDialogType(action as DialogType);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      setError("");
      const newRole = selectedUser.role === "admin" ? "user" : "admin";
      await admin.setRole({
        userId: selectedUser.id,
        role: newRole,
      });
      setSuccess(
        `役割を${newRole === "admin" ? "管理者" : "ユーザー"}に変更しました`
      );
      await loadUsers();
      closeDialog();
    } catch (err) {
      setError("役割の変更に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordChange = async (password: string) => {
    if (!selectedUser || !password) return;
    try {
      setActionLoading(true);
      setError("");

      await admin.setUserPassword({
        userId: selectedUser.id,
        newPassword: password,
      });

      setSuccess("パスワードを変更しました");
      closeDialog();
    } catch (err) {
      setError("パスワードの変更に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      setError("");

      // Better Auth admin pluginには2FA無効化機能がないため、
      // カスタムAPIエンドポイントを実装する必要があります
      setError("2FA無効化機能は現在利用できません");
      closeDialog();
    } catch (err) {
      setError("二段階認証の無効化に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanToggle = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      setError("");
      if (selectedUser.banned) {
        await admin.unbanUser({ userId: selectedUser.id });
        setSuccess("アカウントの停止を解除しました");
      } else {
        await admin.banUser({
          userId: selectedUser.id,
          banReason: "管理者により停止されました",
        });
        setSuccess("アカウントを停止しました");
      }
      await loadUsers();
      closeDialog();
    } catch (err) {
      setError("操作に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      setError("");
      await admin.revokeUserSessions({
        userId: selectedUser.id,
      });
      setSuccess("すべてのセッションを取り消しました");
      closeDialog();
    } catch (err) {
      setError("セッションの取り消しに失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      setError("");
      const result = await admin.impersonateUser({
        userId: selectedUser.id,
      });

      if (result.error) {
        setError("偽装ログインに失敗しました");
        setActionLoading(false);
        return;
      }

      // 成功したらコンソールページにリダイレクト
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "偽装ログインに失敗しました");
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      setError("");
      await admin.removeUser({
        userId: selectedUser.id,
      });
      setSuccess("ユーザーを削除しました");
      await loadUsers();
      closeDialog();
    } catch (err) {
      setError("ユーザーの削除に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditInfo = async (data: {
    name: string;
    email: string;
    role: "user" | "admin";
    banned: boolean;
  }) => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      setError("");

      // ロール変更
      if (data.role !== selectedUser.role) {
        await admin.setRole({
          userId: selectedUser.id,
          role: data.role,
        });
      }

      // 禁止状態変更
      if (data.banned !== selectedUser.banned) {
        if (data.banned) {
          await admin.banUser({
            userId: selectedUser.id,
            banReason: "管理者により停止されました",
          });
        } else {
          await admin.unbanUser({ userId: selectedUser.id });
        }
      }

      // ユーザー情報更新（名前、メール）
      if (
        data.name !== selectedUser.name ||
        data.email !== selectedUser.email
      ) {
        await admin.updateUser({
          userId: selectedUser.id,
          data: {
            name: data.name,
            email: data.email,
          },
        });
      }

      setSuccess("ユーザー情報を更新しました");
      await loadUsers();
      closeDialog();
    } catch (err) {
      setError("ユーザー情報の更新に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedUser(null);
  };

  const handleSessionRevoked = () => {
    setSuccess("セッションを取り消しました");
  };

  const handleUserCreated = async () => {
    setSuccess("ユーザーを作成しました");
    await loadUsers();
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (session?.user?.role !== "admin") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="size-4" />
        <AlertDescription>
          このページにアクセスする権限がありません
        </AlertDescription>
      </Alert>
    );
  }

  const isSelf = (user: User | null) => user && session?.user?.id === user.id;

  return (
    <div className="flex flex-col h-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 text-green-900">
          <CheckCircle className="size-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <UserTable
        users={users}
        currentUserId={session?.user?.id || ""}
        onUserAction={handleUserAction}
        onCreateUser={() => setShowCreateDialog(true)}
      />

      <UserDialogs
        dialogType={dialogType === "viewSessions" ? null : (dialogType as any)}
        selectedUser={selectedUser}
        actionLoading={actionLoading}
        isSelf={!!isSelf(selectedUser)}
        onClose={closeDialog}
        onRoleChange={handleRoleChange}
        onPasswordChange={handlePasswordChange}
        onDisable2FA={handleDisable2FA}
        onBanToggle={handleBanToggle}
        onRevokeAllSessions={handleRevokeAllSessions}
        onDeleteUser={handleDeleteUser}
        onEditInfo={handleEditInfo}
      />

      <SessionListDialog
        open={dialogType === "viewSessions"}
        user={selectedUser}
        onClose={closeDialog}
        onSessionRevoked={handleSessionRevoked}
      />

      <CreateUserDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onUserCreated={handleUserCreated}
      />

      <ImpersonateDialog
        open={dialogType === "impersonate"}
        user={selectedUser}
        loading={actionLoading}
        onClose={closeDialog}
        onConfirm={handleImpersonate}
      />
    </div>
  );
}
