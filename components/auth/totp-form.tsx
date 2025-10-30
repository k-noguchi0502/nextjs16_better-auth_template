"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, Shield } from "lucide-react";

interface TotpFormProps {
  onBack: () => void;
}

export function TotpForm({ onBack }: TotpFormProps) {
  const [code, setCode] = useState("");
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
      const { verifyTotp } = await import("@/lib/auth-client");
      const result = await verifyTotp({
        code,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "認証コードが正しくありません。もう一度お試しください。"
        );
      } else {
        setSuccess("認証に成功しました");
        setTimeout(() => router.push("/"), 500);
      }
    } catch (err) {
      setError("認証中にエラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="bg-primary/10 text-primary rounded-full p-3 mx-auto mb-2 w-fit">
          <Shield className="size-6" />
        </div>
        <CardTitle className="text-xl">二段階認証</CardTitle>
        <CardDescription>
          認証アプリに表示されている6桁のコードを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <FieldLabel htmlFor="totp">認証コード</FieldLabel>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setCode(value)}
                  autoFocus
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </Field>

            <Field>
              <Button type="submit" disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    認証中...
                  </>
                ) : (
                  "認証"
                )}
              </Button>
              <FieldDescription className="text-center">
                <button
                  type="button"
                  onClick={onBack}
                  className="underline underline-offset-4"
                >
                  ← 戻る
                </button>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
