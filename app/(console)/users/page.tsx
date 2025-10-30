"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, admin } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  UserTable,
  UserDialogs,
  SessionListDialog,
  CreateUserDialog,
  ImpersonateDialog,
  User,
} from "./components";

type DialogType =
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
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user?.role !== "admin") {
      router.push("/");
      return;
    }

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, session?.user?.role]);

  const loadUsers = async () => {
    try {
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
    }
  };

  const handleUserAction = (user: User, action: string) => {
    setSelectedUser(user);
    setDialogType(action as DialogType);
  };

  const handlePasswordChange = async (password: string) => {
    if (!selectedUser || !password) return;
    try {
      setActionLoading(true);

      await admin.setUserPassword({
        userId: selectedUser.id,
        newPassword: password,
      });

      toast.success("パスワードを変更しました");
      closeDialog();
    } catch (err) {
      toast.error("パスワードの変更に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);

      // Better Auth admin pluginには2FA無効化機能がないため、
      // カスタムAPIエンドポイントを実装する必要があります
      toast.error("2FA無効化機能は現在利用できません");
      closeDialog();
    } catch (err) {
      toast.error("二段階認証の無効化に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBanToggle = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      if (selectedUser.banned) {
        await admin.unbanUser({ userId: selectedUser.id });
        toast.success("アカウントの停止を解除しました");
      } else {
        await admin.banUser({
          userId: selectedUser.id,
          banReason: "管理者により停止されました",
        });
        toast.success("アカウントを停止しました");
      }
      await loadUsers();
      closeDialog();
    } catch (err) {
      toast.error("操作に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await admin.revokeUserSessions({
        userId: selectedUser.id,
      });
      toast.success("すべてのセッションを取り消しました");
      closeDialog();
    } catch (err) {
      toast.error("セッションの取り消しに失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      const result = await admin.impersonateUser({
        userId: selectedUser.id,
      });

      if (result.error) {
        toast.error("偽装ログインに失敗しました");
        setActionLoading(false);
        return;
      }

      // 成功したらコンソールページにリダイレクト
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "偽装ログインに失敗しました");
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await admin.removeUser({
        userId: selectedUser.id,
      });
      toast.success("ユーザーを削除しました");
      await loadUsers();
      closeDialog();
    } catch (err) {
      toast.error("ユーザーの削除に失敗しました");
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

      toast.success("ユーザー情報を更新しました");
      await loadUsers();
      closeDialog();
    } catch (err) {
      toast.error("ユーザー情報の更新に失敗しました");
    } finally {
      setActionLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedUser(null);
  };

  const handleSessionRevoked = () => {
    toast.success("セッションを取り消しました");
  };

  const handleUserCreated = async () => {
    toast.success("ユーザーを作成しました");
    await loadUsers();
  };

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
