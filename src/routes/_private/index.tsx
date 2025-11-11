import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  CalendarIcon,
  ChevronDownIcon,
  CoinsIcon,
  Loader2Icon,
  TrendingUpIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/orpc/client";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/_private/")({
  component: App,
});

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function App() {
  // Initialize with current month's start and end dates
  const getCurrentMonthRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: startOfMonth,
      to: endOfMonth,
    };
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    getCurrentMonthRange(),
  );

  const queryInput = {
    startDate: dateRange?.from
      ? dayjs(dateRange.from).format("YYYY-MM-DD")
      : undefined,
    endDate: dateRange?.to
      ? dayjs(dateRange.to).format("YYYY-MM-DD")
      : undefined,
  };

  const { data, isLoading, error } = useQuery(
    api.dashboardRouter.getDashboardStats.queryOptions({
      input:
        queryInput.startDate && queryInput.endDate ? queryInput : undefined,
    }),
  );

  const chartData = data
    ? [
        {
          name: "Converting",
          value: data.totalConvertingIncentiveAmount,
          fill: COLORS[0],
        },
        {
          name: "Sales",
          value: data.totalSalesIncentiveAmount,
          fill: COLORS[1],
        },
      ]
    : [];

  const attendanceData =
    data?.attendancePercentage !== null
      ? [
          {
            name: "Present",
            value: data?.attendancePercentage ?? 0,
            fill: COLORS[2],
          },
          {
            name: "Absent",
            value: 100 - (data?.attendancePercentage ?? 0),
            fill: COLORS[3],
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Welcome to Sri Vasavi Jewels Management System
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[300px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to ? (
                  <>
                    {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                  </>
                ) : (
                  <span>Select date range</span>
                )}
                <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                captionLayout="dropdown"
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="font-bold text-2xl">
                  {data?.usersCount ?? 0}
                </div>
              )}
              <p className="mt-1 text-muted-foreground text-xs">
                Registered users in the system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Total Employees
              </CardTitle>
              <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="font-bold text-2xl">
                  {data?.employeeCount ?? 0}
                </div>
              )}
              <p className="mt-1 text-muted-foreground text-xs">
                Active employees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Attendance</CardTitle>
              <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : data && data.attendancePercentage !== null ? (
                <div className="font-bold text-2xl">
                  {data.attendancePercentage.toFixed(1)}%
                </div>
              ) : (
                <div className="font-bold text-2xl">N/A</div>
              )}
              <p className="mt-1 text-muted-foreground text-xs">
                {dateRange?.from && dateRange?.to
                  ? "Attendance percentage for selected period"
                  : "Select date range to view attendance"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">
                Total Incentives
              </CardTitle>
              <CoinsIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="font-bold text-2xl">
                  ₹
                  {(
                    (data?.totalConvertingIncentiveAmount ?? 0) +
                    (data?.totalSalesIncentiveAmount ?? 0)
                  ).toLocaleString("en-IN")}
                </div>
              )}
              <p className="mt-1 text-muted-foreground text-xs">
                {dateRange?.from && dateRange?.to
                  ? "Total incentives for selected period"
                  : "All-time total incentives"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Incentive Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Incentive Comparison</CardTitle>
              <CardDescription>
                Converting vs Sales Incentive Amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [
                        `₹${value.toLocaleString("en-IN")}`,
                        "Amount",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Present vs Absent Percentage</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[300px] items-center justify-center">
                  <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : attendanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={attendanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ${value.toFixed(1)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value.toFixed(1)}%`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  {dateRange?.from && dateRange?.to
                    ? "No attendance data available"
                    : "Select date range to view attendance"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Converting Incentive</CardTitle>
              <CardDescription>
                Total converting incentive amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-12 w-32" />
              ) : (
                <div className="font-bold text-3xl">
                  ₹
                  {(data?.totalConvertingIncentiveAmount ?? 0).toLocaleString(
                    "en-IN",
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Incentive</CardTitle>
              <CardDescription>Total sales incentive amount</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-12 w-32" />
              ) : (
                <div className="font-bold text-3xl">
                  ₹
                  {(data?.totalSalesIncentiveAmount ?? 0).toLocaleString(
                    "en-IN",
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Failed to load dashboard data. Please try again.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
