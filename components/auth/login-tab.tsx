"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GoogleLoginButton } from "./google-login-button";

interface LoginTabProps {
  onTotpRequired: () => void;
}

export function LoginTab({ onTotpRequired }: LoginTabProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn.email(
        {
          email,
          password,
        },
        {
          onSuccess: (ctx) => {
            if (ctx.data.twoFactorRedirect) {
              toast.success("二段階認証が必要です");
              onTotpRequired();
            } else {
              toast.success("ログインに成功しました");
              setTimeout(() => router.push("/"), 500);
            }
          },
          onError: (ctx) => {
            toast.error(
              ctx.error.message ||
                "メールアドレスまたはパスワードが正しくありません"
            );
          },
        }
      );
    } catch (err) {
      toast.error("ログイン中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">メールアドレス</FieldLabel>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="login-password">パスワード</FieldLabel>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                ログイン中...
              </>
            ) : (
              "ログイン"
            )}
          </Button>
        </Field>

        <FieldSeparator>または</FieldSeparator>

        <Field>
          <GoogleLoginButton />
        </Field>
      </FieldGroup>
    </form>
  );
}
