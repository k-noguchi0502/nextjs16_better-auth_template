"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { GoogleLoginButton } from "./google-login-button";

export function SignupTab() {
  const [name, setName] = useState("");
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
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "アカウントの作成に失敗しました");
      } else {
        setSuccess("アカウントが作成されました");
        setTimeout(() => router.push("/"), 500);
      }
    } catch (err) {
      setError("登録中にエラーが発生しました。もう一度お試しください。");
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
          <FieldLabel htmlFor="signup-name">名前</FieldLabel>
          <Input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田太郎"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-email">メールアドレス</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="m@example.com"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="signup-password">パスワード</FieldLabel>
          <Input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <FieldDescription>8文字以上で入力してください</FieldDescription>
        </Field>

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                作成中...
              </>
            ) : (
              "アカウント作成"
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
