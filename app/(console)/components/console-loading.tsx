"use client";

import { Loader2 } from "lucide-react";

export function ConsoleLoading() {
  return (
    <div className="flex items-center justify-center flex-1 w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <Loader2 className="size-8 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">
          読み込み中...
        </p>
      </div>
    </div>
  );
}
