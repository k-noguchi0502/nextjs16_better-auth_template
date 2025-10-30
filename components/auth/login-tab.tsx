"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { GoogleLoginButton } from "./google-login-button";

interface LoginTabProps {
  onTotpRequired: () => void;
}

export function LoginTab({ onTotpRequired }: LoginTabProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
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
              setSuccess("二段階認証が必要です");
              onTotpRequired();
            } else {
              setSuccess("ログインに成功しました");
              setTimeout(() => router.push("/"), 500);
            }
          },
          onError: (ctx) => {
            setError(
              ctx.error.message ||
                "メールアドレスまたはパスワードが正しくありません"
            );
          },
        }
      );
    } catch (err) {
      setError("ログイン中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in-50 slide-in-from-top-2"
          >
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-900 animate-in fade-in-50 slide-in-from-top-2">
            <CheckCircle2 className="size-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

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
