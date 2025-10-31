import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
// import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { auth } from "@/lib/auth/auth-client";
// import CreateUserDialog from "@/components/users/createUser";
// import EditUserDialog from "@/components/users/updateUser";
// import type { User } from "@/db/schema";
import { api } from "@/lib/orpc/client";
import { formatDate } from "@/lib/utils";
// import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export const Route = createFileRoute("/_private/settings/users")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = auth.useSession();
  console.log({ session });
  // const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  // const [createDialogOpen, setCreateDialogOpen] = useState(false);
  // const [editDialogOpen, setEditDialogOpen] = useState(false);
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);

  const [filters, setFilters] = useState<{
    search?: string;
    role?: "all" | "admin" | "employee";
  }>({
    search: "",
    role: "all",
  });

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
    }));
    setPage(1); // Reset to first page when search changes
  }, [debouncedSearch]);

  // Fetch users
  const { data, isLoading } = useQuery(
    api.userRouter.getUsers.queryOptions({
      input: {
        filter:
          Object.keys(filters).length > 0
            ? {
                search: filters.search,
                role: filters.role === "all" ? undefined : filters.role,
              }
            : undefined,
        pagination: { page, limit },
      },
    }),
  );

  // Create user mutation
  // const createMutation = useMutation(
  //   api.userRouter.createUser.mutationOptions({
  //     onSuccess: () => {
  //       toast.success("User created successfully");
  //       setCreateDialogOpen(false);
  //       queryClient.invalidateQueries({
  //         queryKey: api.userRouter.getUsers.queryKey(),
  //       });
  //     },
  //     onError: (error) => {
  //       toast.error(error.message ?? "Failed to create user");
  //     },
  //   }),
  // );

  // Update user mutation
  // const updateMutation = useMutation(
  //   api.userRouter.updateUser.mutationOptions({
  //     onSuccess: () => {
  //       toast.success("User updated successfully");
  //       setEditDialogOpen(false);
  //       setSelectedUser(null);
  //       queryClient.invalidateQueries({
  //         queryKey: api.userRouter.getUsers.queryKey(),
  //       });
  //     },
  //     onError: (error) => {
  //      console.log({error});
  //       toast.error(error.message ?? "Failed to update user");
  //     },
  //   }),
  // );

  // Delete user mutation
  // const deleteMutation = useMutation(
  //   api.userRouter.deleteUser.mutationOptions({
  //     onSuccess: () => {
  //       toast.success("User deleted successfully");
  //       queryClient.invalidateQueries({
  //         queryKey: api.userRouter.getUsers.queryKey(),
  //       });
  //     },
  //     onError: (error) => {
  //       console.log({error});
  //       toast.error((error as any)?.data?.message ?? "Failed to delete user");
  //     },
  //   }),
  // );

  // const handleEdit = (user: User) => {
  //   setSelectedUser(user);
  //   setEditDialogOpen(true);
  // };

  // const handleDelete = (userId: string) => {
  //   deleteMutation.mutate({ id: userId });
  // };

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="max-w-full space-y-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl">Users Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their permissions
          </p>
        </div>
        {/* <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        /> */}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 pt-2 sm:flex-row">
        <div className="relative max-w-64">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.role}
          onValueChange={(value) =>
            setFilters({
              ...filters,
              role: value as unknown as "admin" | "employee",
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-md border pt-2">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[200px] px-4 py-3">Name</TableHead>
              <TableHead className="max-w-[250px] px-4 py-3">Email</TableHead>
              <TableHead className="px-4 py-3">Role</TableHead>
              <TableHead className="px-4 py-3">Status</TableHead>
              <TableHead className="px-4 py-3">Created At</TableHead>
              {/* <TableHead className="px-4 py-3 text-center">Actions</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell
                    className="max-w-[200px] truncate px-4 py-3 font-medium"
                    title={user.name}
                  >
                    {user.name}
                  </TableCell>
                  <TableCell
                    className="max-w-[250px] truncate px-4 py-3"
                    title={user.email}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary text-xs capitalize">
                      {user.role || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {user.banned ? (
                      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2.5 py-0.5 font-medium text-destructive text-xs">
                        Banned
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 font-medium text-green-600 text-xs dark:text-green-400">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </TableCell>
                  {/* <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <TrashIcon className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the user "{user.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Edit Dialog */}
      {/* {selectedUser && (
        <EditUserDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedUser(null);
          }}
          user={selectedUser}
          onSubmit={(data) => {updateMutation.mutate(data)}}
          isLoading={updateMutation.isPending}
        />
      )} */}
    </div>
  );
}
