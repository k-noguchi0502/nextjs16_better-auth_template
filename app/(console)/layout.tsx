"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ConsoleLoading } from "./components";

// パスとラベルのマッピング
const pathLabels: Record<string, string> = {
  "/": "ダッシュボード",
  "/users": "ユーザー管理",
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  // パスからパンくずリストを生成
  const generateBreadcrumbs = () => {
    const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

    // ルート（ダッシュボード）を追加
    if (pathname !== "/") {
      breadcrumbs.push({
        label: "ダッシュボード",
        href: "/",
        isLast: false,
      });
    }

    // 現在のページを追加
    const currentLabel = pathLabels[pathname] || "ページ";
    if (pathname !== "/") {
      breadcrumbs.push({
        label: currentLabel,
        href: pathname,
        isLast: true,
      });
    } else {
      breadcrumbs.push({
        label: currentLabel,
        href: pathname,
        isLast: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {isPending || !session ? <ConsoleLoading /> : children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
