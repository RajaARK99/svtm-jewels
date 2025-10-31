import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PencilIcon, SearchIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateEmployeeDialog from "@/components/employees/createEmployee";
import UpdateEmployeeDialog from "@/components/employees/updateEmployee";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import type { Employee } from "@/db/schema";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/orpc/client";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_private/settings/employees")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);

  const [filters, setFilters] = useState<{
    search?: string;
    jobTitleId?: string[];
    businessUnitId?: string[];
    departmentId?: string[];
    locationId?: string[];
    legalEntityId?: string[];
    reportingToUserId?: string[];
    salesIncentiveTypeId?: string[];
  }>({});

  // Fetch options for filters
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: [
          "jobTitle",
          "businessUnit",
          "department",
          "location",
          "legalEntity",
          "salesIncentiveType",
        ],
      },
    }),
  );

  // Fetch users for reportingToUserId filter
  // const { data: usersData } = useQuery(
  //   api.userRouter.getUsers.queryOptions({
  //     input: {
  //       pagination: { page: 1, limit: 1000 },
  //     },
  //   }),
  // );

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch) {
      setFilters((prev) => ({
        ...prev,
        search: debouncedSearch,
      }));
    } else {
      setFilters((prev) => {
        const newFilters = { ...prev };
        delete newFilters.search;
        return newFilters;
      });
    }
    setPage(1); // Reset to first page when search changes
  }, [debouncedSearch]);

  // Fetch employees
  const { data, isLoading } = useQuery(
    api.employeeRouter.getEmployee.queryOptions({
      input: {
        filter: Object.keys(filters).length > 0 ? filters : undefined,
        pagination: { page, limit },
      },
    }),
  );

  // Create employee mutation
  const createMutation = useMutation(
    api.employeeRouter.createEmployee.mutationOptions({
      onSuccess: () => {
        toast.success("Employee created successfully");
        setCreateDialogOpen(false);
        queryClient.invalidateQueries({
          queryKey: api.employeeRouter.getEmployee.queryKey({ input: {} }),
        });
        setCreateDialogOpen(false);
        setSelectedEmployee(null);
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to create employee");
      },
    }),
  );

  // Update employee mutation
  const updateMutation = useMutation(
    api.employeeRouter.updateEmployee.mutationOptions({
      onSuccess: () => {
        toast("Employee updated successfully");
        setEditDialogOpen(false);
        setSelectedEmployee(null);
        queryClient.invalidateQueries({
          queryKey: api.employeeRouter.getEmployee.queryKey({ input: {} }),
        });
        setEditDialogOpen(false);
        setSelectedEmployee(null);
      },
      onError: (error) => {
        console.log({ error });
        toast(error.message ?? "Failed to update employee");
      },
    }),
  );

  // Delete employee mutation
  const deleteMutation = useMutation(
    api.employeeRouter.deleteEmployee.mutationOptions({
      onSuccess: () => {
        toast.success("Employee deleted successfully");
        queryClient.invalidateQueries({
          queryKey: api.employeeRouter.getEmployee.queryKey({ input: {} }),
        });
      },
      onError: (error) => {
        toast.error(error?.message ?? "Failed to delete employee");
      },
    }),
  );

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  };

  const handleDelete = (employeeId: string) => {
    deleteMutation.mutate({ id: employeeId });
  };

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 1;

  const jobTitles =
    optionsData?.find((opt) => opt.type === "jobTitle")?.data ?? [];
  const businessUnits =
    optionsData?.find((opt) => opt.type === "businessUnit")?.data ?? [];
  const departments =
    optionsData?.find((opt) => opt.type === "department")?.data ?? [];
  // const locations =
  //   optionsData?.find((opt) => opt.type === "location")?.data ?? [];
  // const legalEntities =
  //   optionsData?.find((opt) => opt.type === "legalEntity")?.data ?? [];
  const salesIncentiveTypes =
    optionsData?.find((opt) => opt.type === "salesIncentiveType")?.data ?? [];
  // const users = usersData?.data ?? [];

  return (
    <div className="max-w-full space-y-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl">Employees Management</h1>
          <p className="text-muted-foreground">
            Manage employees and their details
          </p>
        </div>
        <CreateEmployeeDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 pt-2 sm:flex-row">
        <div className="relative max-w-64">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={
            filters.jobTitleId && filters.jobTitleId.length > 0
              ? filters.jobTitleId[0]
              : "all"
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              jobTitleId: value === "all" ? undefined : [value],
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by job title" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Job Titles</SelectItem>
            {jobTitles.map((jobTitle) => (
              <SelectItem key={jobTitle.id} value={jobTitle.id}>
                {jobTitle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={
            filters.businessUnitId && filters.businessUnitId.length > 0
              ? filters.businessUnitId[0]
              : "all"
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              businessUnitId: value === "all" ? undefined : [value],
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by business unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Business Units</SelectItem>
            {businessUnits.map((bu) => (
              <SelectItem key={bu.id} value={bu.id}>
                {bu.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={
            filters.departmentId && filters.departmentId.length > 0
              ? filters.departmentId[0]
              : "all"
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              departmentId: value === "all" ? undefined : [value],
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={
            filters.salesIncentiveTypeId &&
            filters.salesIncentiveTypeId.length > 0
              ? filters.salesIncentiveTypeId[0]
              : "all"
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              salesIncentiveTypeId: value === "all" ? undefined : [value],
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by sales incentive type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sales Incentive Types</SelectItem>
            {salesIncentiveTypes.map((salesIncentiveType) => (
              <SelectItem
                key={salesIncentiveType.id}
                value={salesIncentiveType.id}
              >
                {salesIncentiveType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-md border pt-2">
        <Table className="w-full min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[200px] px-4 py-3">User</TableHead>
              <TableHead className="px-4 py-3">Email</TableHead>
              <TableHead className="px-4 py-3">Job Title</TableHead>
              <TableHead className="px-4 py-3">Department</TableHead>
              <TableHead className="px-4 py-3">Business Unit</TableHead>
              <TableHead className="px-4 py-3">Location</TableHead>
              <TableHead className="px-4 py-3">Reporting To</TableHead>
              <TableHead className="px-4 py-3">Date of Joining</TableHead>
              <TableHead className="px-4 py-3">Sales Incentive Type</TableHead>
              <TableHead className="px-4 py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-muted-foreground"
                >
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell
                    className="max-w-[200px] truncate px-4 py-3 font-medium"
                    title={employee.user?.name || "N/A"}
                  >
                    {employee.user?.name || "N/A"}
                  </TableCell>
                  <TableCell
                    className="max-w-[250px] truncate px-4 py-3"
                    title={employee.user?.email || "N/A"}
                  >
                    {employee.user?.email || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.jobTitle?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.department?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.businessUnit?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.location?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.reportingToUser?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.dateOfJoining
                      ? formatDate(
                          employee.dateOfJoining instanceof Date
                            ? employee.dateOfJoining
                            : new Date(employee.dateOfJoining),
                        )
                      : "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.salesIncentiveType?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(employee)}
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
                              permanently delete the employee record for "
                              {employee.user?.name || "this user"}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(employee.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
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
      {selectedEmployee && (
        <UpdateEmployeeDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onSubmit={(data) => {
            updateMutation.mutate(data);
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
