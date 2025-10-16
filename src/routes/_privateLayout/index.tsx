import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	Legend as RechartsLegend,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/orpc/client";

export const Route = createFileRoute("/_privateLayout/")({
	component: Dashboard,
});

function Dashboard() {
	const { data: session } = authClient.useSession();

	// Fetch dashboard metrics
	const metricsQuery = useQuery(orpc.dashboard.metrics.queryOptions());

	// Fetch revenue trend (last 30 days)
	const revenueTrendQuery = useQuery(
		orpc.dashboard.revenueTrend.queryOptions(),
	);

	// Fetch revenue distribution by type
	const typeDistributionQuery = useQuery(
		orpc.dashboard.typeDistribution.queryOptions(),
	);

	// Fetch top employees
	const topEmployeesQuery = useQuery(
		orpc.dashboard.topEmployees.queryOptions({
			input: { limit: 10 },
		}),
	);

	// Fetch attendance stats
	const attendanceStatsQuery = useQuery(
		orpc.dashboard.attendanceStats.queryOptions(),
	);

	const COLORS = [
		"#3b82f6",
		"#ef4444",
		"#10b981",
		"#f59e0b",
		"#8b5cf6",
		"#ec4899",
		"#14b8a6",
		"#f97316",
		"#06b6d4",
		"#84cc16",
	];

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div>
				<h1 className="font-bold text-3xl text-foreground">
					Welcome back, {session?.user?.name || "User"}!
				</h1>
				<p className="mt-2 text-lg text-muted-foreground">
					SVTM Jewels Management Dashboard
				</p>
			</div>

			{/* Key Metrics */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-sm">Total Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						{metricsQuery.isLoading ? (
							<Skeleton className="h-8 w-24" />
						) : (
							<div className="font-bold text-2xl">
								₹{(metricsQuery.data?.totalRevenue || 0).toFixed(2)}
							</div>
						)}
						<p className="text-muted-foreground text-xs">
							From all conversions
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-sm">
							Total Weight (gm)
						</CardTitle>
					</CardHeader>
					<CardContent>
						{metricsQuery.isLoading ? (
							<Skeleton className="h-8 w-24" />
						) : (
							<div className="font-bold text-2xl">
								{(metricsQuery.data?.totalWeight || 0).toFixed(2)}
							</div>
						)}
						<p className="text-muted-foreground text-xs">
							Precious metals handled
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-sm">
							Total Employees
						</CardTitle>
					</CardHeader>
					<CardContent>
						{metricsQuery.isLoading ? (
							<Skeleton className="h-8 w-24" />
						) : (
							<div className="font-bold text-2xl">
								{metricsQuery.data?.totalEmployees || 0}
							</div>
						)}
						<p className="text-muted-foreground text-xs">Active workforce</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-sm">
							Avg Revenue/Visit
						</CardTitle>
					</CardHeader>
					<CardContent>
						{metricsQuery.isLoading ? (
							<Skeleton className="h-8 w-24" />
						) : (
							<div className="font-bold text-2xl">
								₹{(metricsQuery.data?.avgPerVisit || 0).toFixed(2)}
							</div>
						)}
						<p className="text-muted-foreground text-xs">
							Average per transaction
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Charts Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Revenue Trend */}
				<Card>
					<CardHeader>
						<CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
					</CardHeader>
					<CardContent>
						{revenueTrendQuery.isLoading ? (
							<Skeleton className="h-72 w-full" />
						) : (
							<ChartContainer
								config={{
									amount: {
										label: "Revenue",
										color: "hsl(var(--primary))",
									},
								}}
								className="h-72"
							>
								<ResponsiveContainer height="100%" width="100%">
									<AreaChart data={revenueTrendQuery.data || []}>
										<defs>
											<linearGradient
												id="colorRevenue"
												x1="0"
												y1="0"
												x2="0"
												y2="1"
											>
												<stop
													offset="5%"
													stopColor="var(--color-amount)"
													stopOpacity={0.8}
												/>
												<stop
													offset="95%"
													stopColor="var(--color-amount)"
													stopOpacity={0}
												/>
											</linearGradient>
										</defs>
										<CartesianGrid
											stroke="var(--color-border)"
											strokeDasharray="3 3"
										/>
										<XAxis
											dataKey="date"
											stroke="var(--color-muted-foreground)"
										/>
										<YAxis stroke="var(--color-muted-foreground)" />
										<RechartsTooltip content={<ChartTooltipContent />} />
										<Area
											dataKey="amount"
											fill="url(#colorRevenue)"
											fillOpacity={1}
											stroke="var(--color-amount)"
											type="monotone"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</ChartContainer>
						)}
					</CardContent>
				</Card>

				{/* Type Distribution */}
				<Card>
					<CardHeader>
						<CardTitle>Revenue by Type</CardTitle>
					</CardHeader>
					<CardContent>
						{typeDistributionQuery.isLoading ? (
							<Skeleton className="h-72 w-full" />
						) : (
							<ResponsiveContainer height={300} width="100%">
								<PieChart>
									<Pie
										cx="50%"
										cy="50%"
										data={typeDistributionQuery.data || []}
										dataKey="value"
										fill="#8884d8"
										label={({ name, value }) => `${name}: ₹${value.toFixed(0)}`}
										labelLine={false}
										outerRadius={100}
									>
										{(typeDistributionQuery.data || []).map((entry, index) => (
											<Cell
												key={entry.name}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<RechartsTooltip
										formatter={(value) => `₹${(value as number).toFixed(2)}`}
									/>
								</PieChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				{/* Weight vs Visits */}
				<Card>
					<CardHeader>
						<CardTitle>Weight vs Visits Trend</CardTitle>
					</CardHeader>
					<CardContent>
						{revenueTrendQuery.isLoading ? (
							<Skeleton className="h-72 w-full" />
						) : (
							<ChartContainer
								config={{
									weight: {
										label: "Weight (gm)",
										color: "#3b82f6",
									},
									visits: {
										label: "Visits",
										color: "#ef4444",
									},
								}}
								className="h-72"
							>
								<ResponsiveContainer height="100%" width="100%">
									<LineChart data={revenueTrendQuery.data || []}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="date" />
										<YAxis yAxisId="left" />
										<YAxis orientation="right" yAxisId="right" />
										<RechartsTooltip content={<ChartTooltipContent />} />
										<RechartsLegend />
										<Line
											dataKey="weight"
											name="Weight (gm)"
											stroke="#3b82f6"
											type="monotone"
											yAxisId="left"
										/>
										<Line
											dataKey="visits"
											name="Visits"
											stroke="#ef4444"
											type="monotone"
											yAxisId="right"
										/>
									</LineChart>
								</ResponsiveContainer>
							</ChartContainer>
						)}
					</CardContent>
				</Card>

				{/* Top Employees */}
				<Card>
					<CardHeader>
						<CardTitle>Top 10 Employees by Revenue</CardTitle>
					</CardHeader>
					<CardContent>
						{topEmployeesQuery.isLoading ? (
							<Skeleton className="h-72 w-full" />
						) : (
							<ChartContainer
								config={{
									revenue: {
										label: "Revenue",
										color: "#10b981",
									},
								}}
								className="h-72"
							>
								<ResponsiveContainer height="100%" width="100%">
									<BarChart
										data={(topEmployeesQuery.data || []).map((emp) => ({
											employee: emp.employeeName,
											revenue: emp.revenue,
										}))}
										layout="vertical"
										margin={{ bottom: 5, left: 150, right: 30, top: 5 }}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis type="number" />
										<YAxis dataKey="employee" type="category" width={140} />
										<RechartsTooltip
											content={<ChartTooltipContent />}
											formatter={(value) => `₹${(value as number).toFixed(2)}`}
										/>
										<Bar
											dataKey="revenue"
											fill="var(--color-revenue)"
											radius={4}
										/>
									</BarChart>
								</ResponsiveContainer>
							</ChartContainer>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Attendance Overview */}
			<Card>
				<CardHeader>
					<CardTitle>Attendance Overview</CardTitle>
				</CardHeader>
				<CardContent>
					{attendanceStatsQuery.isLoading ? (
						<Skeleton className="h-40 w-full" />
					) : (
						<div className="grid gap-4 md:grid-cols-3">
							<div className="flex flex-col gap-2 rounded-lg border p-4">
								<p className="text-muted-foreground text-sm">Total Employees</p>
								<p className="font-bold text-2xl">
									{attendanceStatsQuery.data?.totalEmployees || 0}
								</p>
							</div>
							<div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
								<p className="font-medium text-green-700 text-sm dark:text-green-200">
									Attendance Records
								</p>
								<p className="font-bold text-2xl text-green-900 dark:text-green-100">
									{attendanceStatsQuery.data?.totalRecords || 0}
								</p>
							</div>
							<div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
								<p className="font-medium text-red-700 text-sm dark:text-red-200">
									No Record
								</p>
								<p className="font-bold text-2xl text-red-900 dark:text-red-100">
									{attendanceStatsQuery.data?.employeesWithoutRecords || 0}
								</p>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
