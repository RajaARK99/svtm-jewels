import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { ArrowLeftIcon, XIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Option } from "@/components/ui/multiselect";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/orpc/client";
import MultipleSelector from "@/components/ui/multiselect";

export const Route = createFileRoute("/_private/incentive/sales/$id/employee")({
  component: RouteComponent,
  params: {
    parse: (param) =>
      z
        .object({
          id: z.string().uuid(),
        })
        .parse(param),
  },
});

function RouteComponent() {
  const { id } = useParams({ from: "/_private/incentive/sales/$id/employee" });
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState<{
    salesIncentiveTypeIds?: string[];
    present?: boolean;
    absent?: boolean;
  }>({});

  // Fetch sales incentive types for filter
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: ["salesIncentiveType"],
      },
    }),
  );

  const salesIncentiveTypes: Option[] =
    optionsData
      ?.find((opt) => opt.type === "salesIncentiveType")
      ?.data?.filter((type) => type.name?.toLowerCase() !== "no incentive")?.map((type) => ({
        value: type.id,
        label: type.name,
      })) ?? [];

  // Build query input
  const queryInput: {
    id: string;
    pagination?: { page: number; limit: number };
    filter?: {
      salesIncentiveTypeIds?: string[];
      present?: boolean;
      absent?: boolean;
    };
  } = {
    id,
    pagination: { page, limit },
  };

  if (Object.keys(filters).length > 0) {
    queryInput.filter = filters;
  }

  // Fetch employees
  const { data, isLoading } = useQuery(
    api.incentivesRouter.saleIncentiveRoute.getEmployeesForSalesIncentive.queryOptions(
      {
        input: queryInput as never,
      },
    ),
  );

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 1;

  const handleSalesIncentiveTypeChange = (selected: Option[]) => {
    if (selected.length === 0) {
      const newFilters = { ...filters };
      delete newFilters.salesIncentiveTypeIds;
      if (Object.keys(newFilters).length === 0) {
        setFilters({});
      } else {
        setFilters(newFilters);
      }
    } else {
      setFilters({
        ...filters,
        salesIncentiveTypeIds: selected.map((opt) => opt.value),
      });
    }
    setPage(1); // Reset to first page when filter changes
  };

  const handlePresentToggle = () => {
    const newPresent = !filters.present;
    const newFilters = { ...filters };
    if (newPresent) {
      newFilters.present = true;
    } else {
      delete newFilters.present;
    }
    if (Object.keys(newFilters).length === 0) {
      setFilters({});
    } else {
      setFilters(newFilters);
    }
    setPage(1);
  };

  const handleAbsentToggle = () => {
    const newAbsent = !filters.absent;
    const newFilters = { ...filters };
    if (newAbsent) {
      newFilters.absent = true;
    } else {
      delete newFilters.absent;
    }
    if (Object.keys(newFilters).length === 0) {
      setFilters({});
    } else {
      setFilters(newFilters);
    }
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const hasActiveFilters =
    (filters.salesIncentiveTypeIds?.length ?? 0) > 0 ||
    filters.present ||
    filters.absent;

  return (
    <div className="max-w-full space-y-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: "/incentive/sales" })}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <h1 className="font-bold text-3xl">Sales Incentive Employees</h1>
          </div>
          <p className="text-muted-foreground">
            View and filter employees for this sales incentive
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-md border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Filters</h2>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XIcon className="mr-2 size-4" />
              Clear Filters
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Sales Incentive Type Filter */}
           <div className="max-w-[300px] space-y-2">
            <Label htmlFor="sales-incentive-type">Sales Incentive Type</Label>
            <MultipleSelector
              value={salesIncentiveTypes.filter((type) =>
                filters.salesIncentiveTypeIds?.includes(type.value),
              )}
              options={salesIncentiveTypes}
              placeholder="Select incentive types..."
              onChange={handleSalesIncentiveTypeChange}
            />
          </div> 

          {/* Present/Absent Filters */}
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label htmlFor="present-filter">Attendance</Label>
              <div className="flex gap-2">
                <Button
                  variant={filters.present ? "default" : "outline"}
                  size="sm"
                  onClick={handlePresentToggle}
                  type="button"
                >
                  Present
                </Button>
                <Button
                  variant={filters.absent ? "default" : "outline"}
                  size="sm"
                  onClick={handleAbsentToggle}
                  type="button"
                >
                  Absent
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-md border pt-2">
        <Table className="w-full min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3">Name</TableHead>
              <TableHead className="px-4 py-3">Email</TableHead>
              <TableHead className="px-4 py-3">Sales Incentive Type</TableHead>
              <TableHead className="px-4 py-3">Attendance Types</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="px-4 py-3">{employee.name}</TableCell>
                  <TableCell className="px-4 py-3">{employee.email}</TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.salesIncentiveTypeName ?? "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {employee.attendanceTypes &&
                    employee.attendanceTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {employee.attendanceTypes.map((attendance) => (
                          <Badge
                            key={attendance.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {attendance.name}
                            {attendance.code && ` (${attendance.code})`}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
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
    </div>
  );
}
