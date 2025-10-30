"use client";

import { Loader2 } from "lucide-react";

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = "読み込み中..." }: PageLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
