import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ChevronDownIcon,
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CreateSalesIncentiveDialog from "@/components/incentives/sales/createSalesIncentive";
import UpdateSalesIncentiveDialog from "@/components/incentives/sales/updateSalesIncentive";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SalesIncentive } from "@/db/schema";
import { api } from "@/lib/orpc/client";
import { formatDate } from "@/lib/utils";
import dayjs from "dayjs";

export const Route = createFileRoute("/_private/incentive/sales/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedIncentive, setSelectedIncentive] =
    useState<SalesIncentive | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [filters, setFilters] = useState<{
    date?: {
      startDate?: string;
      endDate?: string;
    };
    totalIncentive?: {
      min?: number;
      max?: number;
    };
  }>({});

  const queryInput: {
    filter?: {
      date?: {
        startDate?: string;
        endDate?: string;
      };
      totalIncentive?: {
        min?: number;
        max?: number;
      };
    };
    pagination: { page: number; limit: number };
  } = {
    pagination: { page, limit },
  };

  if (Object.keys(filters).length > 0) {
    queryInput.filter = filters;
  }

  const { data, isLoading } = useQuery(
    api.incentivesRouter.saleIncentiveRoute.getSalesIncentives.queryOptions({
      input: queryInput as never,
    }),
  );

  // Excel export mutation
  const { mutate: exportExcel, isPending: isExporting } = useMutation(
    api.incentivesRouter.saleIncentiveRoute.getExcelFile.mutationOptions({
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
          a.download = `sales_incentive_${dateRange}.xlsx`;
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

  // Create sales incentive mutation
  const createMutation = useMutation(
    api.incentivesRouter.saleIncentiveRoute.createSalesIncentive.mutationOptions(
      {
        onSuccess: () => {
          toast.success("Sales incentive created successfully");
          setCreateDialogOpen(false);
          queryClient.invalidateQueries({
            queryKey:
              api.incentivesRouter.saleIncentiveRoute.getSalesIncentives.queryKey(
                { input: {} },
              ),
          });
          setCreateDialogOpen(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.data?.message ??
              error?.message ??
              "Failed to create sales incentive",
          );
        },
      },
    ),
  );

  // Update sales incentive mutation
  const updateMutation = useMutation(
    api.incentivesRouter.saleIncentiveRoute.updateSalesIncentive.mutationOptions(
      {
        onSuccess: () => {
          toast.success("Sales incentive updated successfully");
          setEditDialogOpen(false);
          setSelectedIncentive(null);
          queryClient.invalidateQueries({
            queryKey:
              api.incentivesRouter.saleIncentiveRoute.getSalesIncentives.queryKey(
                { input: {} },
              ),
          });
          setEditDialogOpen(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.data?.message ??
              error?.message ??
              "Failed to update sales incentive",
          );
        },
      },
    ),
  );

  const handleEdit = (incentive: SalesIncentive) => {
    setSelectedIncentive(incentive);
    setEditDialogOpen(true);
  };

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="max-w-full space-y-8 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl">Sales Incentive Management</h1>
          <p className="text-muted-foreground">
            Manage sales incentive records
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusIcon className="mr-2 size-4" />
          Create Sales Incentive
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
                        startDate: dayjs(date?.from).format("YYYY-MM-DD") ?? undefined,
                        endDate: dayjs(date?.to).format("YYYY-MM-DD") ?? undefined,
                      },
                    });
                  }
                }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button
          onClick={() =>
            exportExcel({
              filter: {
                date:
                  filters?.date?.startDate && filters?.date?.endDate
                    ? {
                        startDate: filters.date.startDate,
                        endDate: filters.date.endDate,
                      }
                    : undefined,
              },
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
        <Table className="w-full min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3">Date</TableHead>
              <TableHead className="px-4 py-3">Gold 4/GM</TableHead>
              <TableHead className="px-4 py-3">Coin 1/GM</TableHead>
              <TableHead className="px-4 py-3">Diamond 500/CT</TableHead>
              <TableHead className="px-4 py-3">Silver Antique 4/GM</TableHead>
              <TableHead className="px-4 py-3">Silver/0.30GM</TableHead>
              <TableHead className="px-4 py-3">Total Incentive</TableHead>
              <TableHead className="px-4 py-3">
                Total amount of Incentive 94%
              </TableHead>
              <TableHead className="px-4 py-3">
                Total amount of Incentive 6%
              </TableHead>
              <TableHead className="px-4 py-3">
                94% Incentive per person
              </TableHead>
              <TableHead className="px-4 py-3">
                6% Incentive per person
              </TableHead>
              <TableHead className="px-4 py-3">Staff 94%</TableHead>
              <TableHead className="px-4 py-3">Staff 6%</TableHead>
              <TableHead className="px-4 py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={12} className="py-8 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data?.data || data.data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="py-8 text-center text-muted-foreground"
                >
                  No sales incentive records found
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((incentive) => (
                <TableRow key={incentive.id}>
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
                    {incentive.gold4PerGmAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.goldCoin1PerGmAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.diamond500PerCtAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.silverAntique4PerGmAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.silverPerGmAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium">
                    {incentive.totalIncentive.toFixed(2)}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    {incentive.totalSalesIncentiveFor94Percent?.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.totalSalesIncentiveFor6Percent?.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.totalIncentive94Percent?.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.totalIncentive6Percent?.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.totalStaffPresentIn94Percent} /{" "}
                    {incentive.totalStaff94InPercent} (Absent:{" "}
                    {incentive.totalStaffAbsentIn94Percent})
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {incentive.totalStaffPresentIn6Percent} /{" "}
                    {incentive.totalStaff6InPercent} (Absent:{" "}
                    {incentive.totalStaffAbsentIn6Percent})
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigate({
                          to: "/incentive/sales/$id/employee",
                          params: {
                            id: incentive.id,
                          },
                        });
                      }}
                    >
                      <EyeIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(incentive)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
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
      <CreateSalesIncentiveDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={(data: {
          date: string;
          coinAmountPerGM: number;
          goldAmountPerGM: number;
          diamondAmountPerCT: number;
          silverAntiqueAmountPerGM: number;
          silverAmountPerGM: number;
        }) => {
          createMutation.mutate(data);
        }}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      {selectedIncentive && (
        <UpdateSalesIncentiveDialog
          open={editDialogOpen}
          onOpenChange={(open: boolean) => {
            setEditDialogOpen(open);
            if (!open) setSelectedIncentive(null);
          }}
          incentive={selectedIncentive}
          onSubmit={(data: {
            id: string;
            data: {
              coinAmountPerGM?: number;
              goldAmountPerGM?: number;
              diamondAmountPerCT?: number;
              silverAntiqueAmountPerGM?: number;
              silverAmountPerGM?: number;
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
