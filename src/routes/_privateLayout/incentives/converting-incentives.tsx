import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import z from "zod";
import { ConvertingIncentivesForm } from "@/components/converting-incentives-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { orpc } from "@/orpc/client";

export const Route = createFileRoute(
	"/_privateLayout/incentives/converting-incentives",
)({
	component: RouteComponent,
	validateSearch: z.object({
		page: z.number().int().min(1).default(1),
		pageSize: z.number().int().min(1).max(100).default(10),
	}),
});

function RouteComponent() {
	const { page, pageSize } = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const queryClient = useQueryClient();

	// Generate skeleton IDs
	const skeletonIds = React.useMemo(
		() =>
			Array.from(
				{ length: 5 },
				() => `skeleton-${Math.random().toString(36).substr(2, 9)}`,
			),
		[],
	);

	// Local state for immediate UI feedback
	const [searchInput, setSearchInput] = React.useState("");

	const [filter, setFilter] = React.useState<{
		query: string;
		type: string;
		startDate: string | undefined;
		endDate: string | undefined;
	}>({
		query: "",
		type: "",
		startDate: undefined,
		endDate: undefined,
	});

	// Debounce query filter
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setFilter((prev) => ({
				...prev,
				query: searchInput,
			}));
		}, 500); // 500ms debounce delay

		return () => clearTimeout(timer);
	}, [searchInput]);

	const [formOpen, setFormOpen] = React.useState(false);

	const [editingRecord, setEditingRecord] = React.useState<
		| {
				id: string;
				date: string;
				employeeId: string;
				typeId: string;
				weight: string;
				visit: number;
				amount: string;
		  }
		| undefined
	>(undefined);

	// Fetch converting types for filter dropdown
	const typesQuery = useQuery(
		orpc.convertingIncentives.getTypes.queryOptions(),
	);

	const convertingIncentivesQuery = useQuery(
		orpc.convertingIncentives.list.queryOptions({
			input: {
				page,
				pageSize,
				filters: {
					employeeName: searchInput,
					type: filter.type && filter.type !== "All" ? filter.type : undefined,
					startDate: filter.startDate,
					endDate: filter.endDate,
				},
			},
		}),
	);

	const handleStartDateChange = (date: Date | undefined) => {
		setFilter((prev) => ({
			...prev,
			startDate: date ? date.toISOString().split("T")[0] : undefined,
		}));
	};

	const handleEndDateChange = (date: Date | undefined) => {
		setFilter((prev) => ({
			...prev,
			endDate: date ? date.toISOString().split("T")[0] : undefined,
		}));
	};

	const handleEdit = (record: {
		id: string;
		date: string;
		employeeId: string;
		typeId: string;
		weight: string;
		visit: number;
		amount: string;
		userName: string;
		userEmail: string;
		typeName: string;
		createdAt: Date;
	}) => {
		setEditingRecord({
			id: record.id,
			date: record.date,
			employeeId: record.employeeId,
			typeId: record.typeId,
			weight: record.weight,
			visit: record.visit,
			amount: record.amount,
		});
		setFormOpen(true);
	};

	const handleFormClose = () => {
		setFormOpen(false);
		setEditingRecord(undefined);
	};

	const totalPages = Math.ceil(
		(convertingIncentivesQuery.data?.total || 0) / pageSize,
	);

	const handlePrevPage = () => {
		if (page > 1) {
			navigate({
				search: { page: page - 1, pageSize },
			});
		}
	};

	const handleNextPage = () => {
		if (page < totalPages) {
			navigate({
				search: { page: page + 1, pageSize },
			});
		}
	};

	const formatCurrency = (value: string | number | null | undefined) => {
		if (!value) return "0.00";
		const num = typeof value === "string" ? Number.parseFloat(value) : value;
		return num.toFixed(2);
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-2xl">Converting Incentives</h1>
				<Button
					onClick={() => {
						setEditingRecord(undefined);
						setFormOpen(true);
					}}
				>
					Add Record
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
						<div>
							<label htmlFor="employee-search" className="font-medium text-sm">
								Employee Name
							</label>
							<Input
								id="employee-search"
								className="mt-1"
								placeholder="Search by name or email..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
							/>
						</div>
						<div>
							<label htmlFor="type-filter" className="font-medium text-sm">
								Type
							</label>
							{typesQuery.isLoading ? (
								<Skeleton className="mt-1 h-10 w-full" />
							) : (
								<Select
									value={filter.type || "All"}
									onValueChange={(value) =>
										setFilter((prev) => ({ ...prev, type: value }))
									}
								>
									<SelectTrigger id="type-filter" className="mt-1">
										<SelectValue placeholder="All Types" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="All">All</SelectItem>
										{typesQuery.data?.map(
											(type: { id: string; name: string }) => (
												<SelectItem key={type.id} value={type.id}>
													{type.name}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							)}
						</div>
						<div>
							<label htmlFor="start-date" className="font-medium text-sm">
								Start Date
							</label>
							<DatePicker
								date={filter.startDate ? new Date(filter.startDate) : undefined}
								onDateChange={handleStartDateChange}
								placeholder="Start date"
								disabled={false}
							/>
						</div>
						<div>
							<label htmlFor="end-date" className="font-medium text-sm">
								End Date
							</label>
							<DatePicker
								date={filter.endDate ? new Date(filter.endDate) : undefined}
								onDateChange={handleEndDateChange}
								placeholder="End date"
								disabled={false}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Converting Incentives Records</CardTitle>
				</CardHeader>
				<CardContent>
					{convertingIncentivesQuery.isLoading ? (
						<div className="space-y-2">
							{skeletonIds.map((id) => (
								<Skeleton key={id} className="h-10 w-full" />
							))}
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Employee</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Weight (gm)</TableHead>
										<TableHead>Visits</TableHead>
										<TableHead>Amount (₹)</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(convertingIncentivesQuery.data?.items || []).length > 0 ? (
										(convertingIncentivesQuery.data?.items || []).map(
											(item) => (
												<TableRow key={item.id}>
													<TableCell>{item.date}</TableCell>
													<TableCell>{item.userName}</TableCell>
													<TableCell>{item.typeName}</TableCell>
													<TableCell>{formatCurrency(item.weight)}</TableCell>
													<TableCell>{item.visit}</TableCell>
													<TableCell>₹{formatCurrency(item.amount)}</TableCell>
													<TableCell>
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleEdit(item)}
														>
															Edit
														</Button>
													</TableCell>
												</TableRow>
											),
										)
									) : (
										<TableRow>
											<TableCell className="py-4 text-center" colSpan={7}>
												No records found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}

					<div className="mt-4 flex items-center justify-between px-2">
						<div className="text-muted-foreground text-sm">
							Page {page} of {totalPages} (Total:{" "}
							{convertingIncentivesQuery.data?.total || 0})
						</div>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outline"
								onClick={handlePrevPage}
								disabled={page === 1}
							>
								Previous
							</Button>
							<Button
								size="sm"
								variant="outline"
								onClick={handleNextPage}
								disabled={page >= totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<ConvertingIncentivesForm
				open={formOpen}
				onOpenChange={handleFormClose}
				editingRecord={editingRecord}
				onSuccess={() => {
					queryClient.invalidateQueries({
						queryKey: ["orpc", "convertingIncentives", "list"],
					});
					navigate({
						search: { page, pageSize },
					});
				}}
			/>
		</div>
	);
}
