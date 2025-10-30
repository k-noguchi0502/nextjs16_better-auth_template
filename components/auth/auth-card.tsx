"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GalleryVerticalEnd } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginTab } from "./login-tab";
import { SignupTab } from "./signup-tab";
import { TotpForm } from "./totp-form";

export function AuthCard({ className, ...props }: React.ComponentProps<"div">) {
  const [needsTotp, setNeedsTotp] = useState(false);

  if (needsTotp) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <TotpForm onBack={() => setNeedsTotp(false)} />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center">
            <a
              href="#"
              className="flex items-center gap-2 self-center font-medium"
            >
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              SAMPLEE Inc.
            </a>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="login">ログイン</TabsTrigger>
              <TabsTrigger value="signup">新規登録</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginTab onTotpRequired={() => setNeedsTotp(true)} />
            </TabsContent>

            <TabsContent value="signup">
              <SignupTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
