import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  ChevronDownIcon,
  Loader2Icon,
  PencilIcon,
  Upload,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import UpdateAttendanceDialog from "@/components/attendance/updateAttendance";
import UploadAttendanceDialog from "@/components/attendance/uploadAttendance";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { api } from "@/lib/orpc/client";
import type { Attendance } from "@/lib/orpc/router/attendance";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_private/settings/attendance")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [filters, setFilters] = useState<{
    date?: {
      startDate: string;
      endDate: string;
    };
    employeeIds?: string[];
    attendanceIds?: string[];
  }>({
    date: {
      startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
      endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
    },
  });

  // Fetch options for filters
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: ["attendance"],
      },
    }),
  );

  // Fetch employees for filter
  const { data: employeesData } = useQuery(
    api.employeeRouter.getEmployee.queryOptions({
      input: {
        pagination: { page: 1, limit: 1000 },
      },
    }),
  );

  const queryInput: {
    filter?: {
      date?: {
        startDate?: string;
        endDate?: string;
      };
      employeeIds?: string[];
      attendanceIds?: string[];
    };
    pagination: { page: number; limit: number };
  } = {
    pagination: { page, limit },
  };

  if (Object.keys(filters).length > 0) {
    queryInput.filter = filters;
  }

  const { data, isLoading } = useQuery(
    api.attendanceRouter.getAttendance.queryOptions({
      input: queryInput as never,
    }),
  );

  // Excel export mutation
  const { mutate: exportExcel, isPending: isExporting } = useMutation(
    api.attendanceRouter.getExcelFile.mutationOptions({
      onSuccess: (data) => {
        if (data?.data) {
          // Decode base64 string to binary data
          const binaryString = atob(data.data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob(
            [bytes],
            {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          );
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          // Generate filename based on date range or use default
          const dateRange =
            filters?.date?.startDate && filters?.date?.endDate
              ? `${filters.date.startDate}_to_${filters.date.endDate}`
              : new Date().toISOString().split("T")[0];
          a.download = `attendance_${dateRange}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
          toast.success("Excel file downloaded successfully");
        } else {
          toast.error(data?.message ?? "Failed to export excel");
        }
      },
      onError: (error: any) => {
        console.log({ error });
        toast.error(
          error?.data?.message ??
            error?.message ??
            "Failed to export excel",
        );
      },
    }),
  );

  console.log({ data });
  // Update attendance mutation
  const updateMutation = useMutation(
    api.attendanceRouter.updateAttendance.mutationOptions({
      onSuccess: () => {
        toast.success("Attendance updated successfully");
        setEditDialogOpen(false);
        setSelectedAttendance(null);
        queryClient.invalidateQueries({
          queryKey: api.attendanceRouter.getAttendance.queryKey({ input: {} }),
        });
      },
      onError: (error) => {
        console.log({ error });
        toast.error(error.message ?? "Failed to update attendance");
      },
    }),
  );

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setEditDialogOpen(true);
  };

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 1;

  const attendanceOptions =
    optionsData?.find((opt) => opt.type === "attendance")?.data ?? [];
  const employees = employeesData?.data ?? [];

  return (
    <div className="max-w-full space-y-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl">Attendance Management</h1>
          <p className="text-muted-foreground">
            Manage employee attendance records
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 size-4" />
          Upload Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 pt-2 sm:flex-row">
        <div className="flex gap-2">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Button
                  variant="outline"
                  id="date"
                  className="w-64 justify-between font-normal"
                >
                  {filters.date?.startDate && filters.date.endDate
                    ? formatDate(filters.date.startDate) +
                      " - " +
                      formatDate(filters.date.endDate)
                    : "Select Date"}

                  <ChevronDownIcon />
                </Button>{" "}
                {/* {filters.date?.startDate && filters.date.endDate ? (
                  <XIcon
                    onClick={() => {
                      setDateOpen(false);
                      setFilters({
                        ...filters,
                        date: undefined,
                      });
                    }}
                    className="-translate-y-1/2 absolute top-1/2 right-10 size-4 cursor-pointer"
                  />
                ) : null} */}
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="range"
                selected={{
                  from: filters.date?.startDate
                    ? new Date(filters.date.startDate)
                    : undefined,
                  to: filters.date?.endDate
                    ? new Date(filters.date.endDate)
                    : undefined,
                }}
                captionLayout="dropdown"
                onSelect={(date) => {
                  if (date?.from && date?.to) {
                    setFilters({
                      ...filters,
                      date: {
                        startDate:
                          dayjs(date?.from).format("YYYY-MM-DD") ?? undefined,
                        endDate:
                          dayjs(date?.to).format("YYYY-MM-DD") ?? undefined,
                      },
                    });
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Select
          value={
            filters.employeeIds && filters.employeeIds.length > 0
              ? filters.employeeIds[0]
              : "all"
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              employeeIds: value === "all" ? undefined : [value],
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.user?.name || "N/A"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={
            filters.attendanceIds && filters.attendanceIds.length > 0
              ? filters.attendanceIds[0]
              : "all"
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              attendanceIds: value === "all" ? undefined : [value],
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by attendance type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Attendance Types</SelectItem>
            {attendanceOptions.map((attendance) => (
              <SelectItem key={attendance.id} value={attendance.id}>
                {attendance.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() =>
            exportExcel({
              filter: Object.keys(filters).length > 0 ? filters : undefined,
            })
          }
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : null}
          Export Excel
        </Button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-md border pt-2">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3">ID</TableHead>
              <TableHead className="px-4 py-3">Employee</TableHead>
              <TableHead className="px-4 py-3">Email</TableHead>
              <TableHead className="px-4 py-3">Date</TableHead>
              <TableHead className="px-4 py-3">Attendance Types</TableHead>
              <TableHead className="px-4 py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((attendance) => (
                <TableRow key={attendance.id}>
                  <TableCell className="px-4 py-3">
                    {attendance.employee?.employeeId}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium">
                    {attendance.employee?.user?.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {attendance.employee?.user?.email || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {attendance.date
                      ? formatDate(
                          attendance.date instanceof Date
                            ? attendance.date
                            : new Date(attendance.date),
                        )
                      : "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {attendance.attendanceTypes &&
                      attendance.attendanceTypes.length > 0 ? (
                        attendance.attendanceTypes.map((at) => (
                          <span
                            key={at.id}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-1 font-medium text-xs"
                          >
                            {at.attendance?.name || "N/A"}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No types</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(attendance)}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
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
      {selectedAttendance && (
        <UpdateAttendanceDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedAttendance(null);
          }}
          attendance={selectedAttendance}
          onSubmit={(data) => {
            updateMutation.mutate(data);
          }}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Upload Dialog */}
      <UploadAttendanceDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </div>
  );
}
