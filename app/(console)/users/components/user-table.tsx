"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  ChevronDown,
  CheckCircle,
  Ban,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

interface UserTableProps {
  users: User[];
  currentUserId: string;
  onUserAction: (user: User, action: string) => void;
  onCreateUser: () => void;
}

export function UserTable({
  users,
  currentUserId,
  onUserAction,
  onCreateUser,
}: UserTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            名前
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium pl-4">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            メールアドレス
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "role",
      header: "役割",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role === "admin" ? "管理者" : "ユーザー"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "banned",
      header: "ステータス",
      cell: ({ row }) => {
        const banned = row.getValue("banned") as boolean;
        return banned ? (
          <Badge
            variant="destructive"
            className="flex items-center gap-1 w-fit"
          >
            <Ban className="size-3" />
            停止中
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <CheckCircle className="size-3" />
            アクティブ
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            登録日
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-muted-foreground">
            {date.toLocaleDateString("ja-JP")}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 検索とアクションバー */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="メールアドレスで検索..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                列表示 <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onCreateUser} size="sm">
            <UserPlus className="mr-2 size-4" />
            新規作成
          </Button>
        </div>
      </div>

      {/* テーブル */}
      <div className="flex-1 overflow-auto rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const user = row.original;
                const isSelf = currentUserId === user.id;

                return (
                  <ContextMenu key={row.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        className="cursor-context-menu hover:bg-muted/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48">
                      <ContextMenuItem
                        onClick={() => onUserAction(user, "editInfo")}
                      >
                        詳細情報を変更
                      </ContextMenuItem>
                      {!isSelf && (
                        <ContextMenuItem
                          onClick={() => onUserAction(user, "role")}
                        >
                          役割を変更
                        </ContextMenuItem>
                      )}
                      <ContextMenuItem
                        onClick={() => onUserAction(user, "password")}
                      >
                        パスワード変更
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => onUserAction(user, "viewSessions")}
                      >
                        セッション一覧
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => onUserAction(user, "revokeSessions")}
                      >
                        全セッション取消
                      </ContextMenuItem>
                      {!isSelf && (
                        <>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onClick={() =>
                              onUserAction(user, user.banned ? "unban" : "ban")
                            }
                          >
                            {user.banned ? "停止を解除" : "アカウント停止"}
                          </ContextMenuItem>
                          <ContextMenuItem
                            onClick={() => onUserAction(user, "impersonate")}
                          >
                            このユーザーとして操作
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem
                            onClick={() => onUserAction(user, "delete")}
                            className="text-destructive focus:text-destructive"
                          >
                            ユーザーを削除
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  ユーザーが見つかりません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          全 {table.getFilteredRowModel().rows.length} 件中{" "}
          {table.getFilteredRowModel().rows.length > 0
            ? `${
                table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                1
              }-${Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}`
            : "0"}{" "}
          件を表示
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            前へ
          </Button>
          <div className="text-sm text-muted-foreground">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            次へ
          </Button>
        </div>
      </div>
    </div>
  );
}
