import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDownIcon, PencilIcon, PlusIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CreateConvertingIncentiveDialog from "@/components/incentives/converting/createConvertingIncentive";
import UpdateConvertingIncentiveDialog from "@/components/incentives/converting/updateConvertingIncentive";
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
import type { ConvertingIncentive } from "@/lib/orpc/router/incentives/converting";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_private/incentive/converting")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIncentive, setSelectedIncentive] =
    useState<ConvertingIncentive | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [filters, setFilters] = useState<{
    date?: {
      startDate?: string;
      endDate?: string;
    };
    employeeIds?: string[];
    typeIds?: string[];
  }>({});

  // Fetch options for filters
  const { data: optionsData } = useQuery(
    api.getOptions.queryOptions({
      input: {
        type: ["convertingType"],
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
      typeIds?: string[];
    };
    pagination: { page: number; limit: number };
  } = {
    pagination: { page, limit },
  };

  if (Object.keys(filters).length > 0) {
    queryInput.filter = filters;
  }

  const { data, isLoading } = useQuery(
    api.incentivesRouter.convertingIncentiveRouter.getConvertingIncentives.queryOptions(
      {
        input: queryInput as never,
      },
    ),
  );

  // Create converting incentive mutation
  const createMutation = useMutation(
    api.incentivesRouter.convertingIncentiveRouter.createConvertingIncentive.mutationOptions(
      {
        onSuccess: () => {
          toast.success("Converting incentive created successfully");
          setCreateDialogOpen(false);
          queryClient.invalidateQueries({
            queryKey:
              api.incentivesRouter.convertingIncentiveRouter.getConvertingIncentives.queryKey(
                { input: {} },
              ),
          });
          setCreateDialogOpen(false);
        },
        onError: (error) => {
          console.log({ error });
          toast.error(error.message ?? "Failed to create converting incentive");
        },
      },
    ),
  );

  // Update converting incentive mutation
  const updateMutation = useMutation(
    api.incentivesRouter.convertingIncentiveRouter.updateConvertingIncentive.mutationOptions(
      {
        onSuccess: () => {
          toast.success("Converting incentive updated successfully");
          setEditDialogOpen(false);
          setSelectedIncentive(null);
          queryClient.invalidateQueries({
            queryKey:
              api.incentivesRouter.convertingIncentiveRouter.getConvertingIncentives.queryKey(
                { input: {} },
              ),
          });
          setEditDialogOpen(false);
        },
        onError: (error) => {
          console.log({ error });
          toast.error(error.message ?? "Failed to update converting incentive");
        },
      },
    ),
  );

  const handleEdit = (incentive: ConvertingIncentive) => {
    setSelectedIncentive(incentive);
    setEditDialogOpen(true);
  };

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 1;

  const convertingTypeOptions =
    optionsData?.find((opt) => opt.type === "convertingType")?.data ?? [];
  const employees = employeesData?.data ?? [];

  return (
    <div className="max-w-full space-y-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl">
            Converting Incentive Management
          </h1>
          <p className="text-muted-foreground">
            Manage converting incentive records
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          Create Converting Incentive
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
                {filters.date?.startDate && filters.date.endDate ? (
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
                ) : null}
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
                        startDate: date?.from?.toISOString() ?? undefined,
                        endDate: date?.to?.toISOString() ?? undefined,
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
            filters.typeIds && filters.typeIds.length > 0
              ? filters.typeIds[0]
              : "all"
          }
          onValueChange={(value) =>
            setFilters({
              ...filters,
              typeIds: value === "all" ? undefined : [value],
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {convertingTypeOptions.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-md border pt-2">
        <Table className="w-full min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3">Employee</TableHead>
              <TableHead className="px-4 py-3">Email</TableHead>
              <TableHead className="px-4 py-3">Date</TableHead>
              <TableHead className="px-4 py-3">Type</TableHead>
              <TableHead className="px-4 py-3">Weight</TableHead>
              <TableHead className="px-4 py-3">Visit</TableHead>
              <TableHead className="px-4 py-3">Amount</TableHead>
              <TableHead className="px-4 py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  No converting incentive records found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((incentive) => (
                <TableRow key={incentive.id}>
                  <TableCell className="px-4 py-3 font-medium">
                    {incentive.name || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.email || "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.date
                      ? formatDate(
                          incentive.date instanceof Date
                            ? incentive.date
                            : new Date(incentive.date),
                        )
                      : "N/A"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.type.name}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.weight}
                  </TableCell>
                  <TableCell className="px-4 py-3">{incentive.visit}</TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(incentive)}
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

      {/* Create Dialog */}
      <CreateConvertingIncentiveDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={(data: {
          employeeId: string;
          date: string;
          typeId: string;
          weight: number;
          visit: number;
          amount: number;
        }) => {
          createMutation.mutate(data);
        }}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      {selectedIncentive && (
        <UpdateConvertingIncentiveDialog
          open={editDialogOpen}
          onOpenChange={(open: boolean) => {
            setEditDialogOpen(open);
            if (!open) setSelectedIncentive(null);
          }}
          incentive={selectedIncentive}
          onSubmit={(data: {
            id: string;
            data: {
              typeId?: string;
              weight?: number;
              visit?: number;
              amount?: number;
            };
          }) => {
            updateMutation.mutate(data);
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
