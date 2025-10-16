import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import z from "zod";
import { ConvertingIncentivesForm } from "@/components/converting-incentives-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
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

	// Local state for immediate UI feedback
	const [searchInput, setSearchInput] = React.useState("");

	const [filter, setFilter] = React.useState<{
		query: string;
		startDate: Date | undefined;
		endDate: Date | undefined;
	}>({
		query: "",
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
				userId: string;
		  }
		| undefined
	>(undefined);

	const convertingIncentivesQuery = useQuery(
		orpc.convertingIncentives.list.queryOptions({
			input: {
				page,
				pageSize,
				filters: {
					employeeName: filter.query,
					startDate: filter.startDate ? filter.startDate.toISOString() : undefined,
					endDate: filter.endDate ? filter.endDate.toISOString() : undefined,
				},
			},
		}),
	);

	const handleStartDateChange = (startDate: Date | undefined) => {
		setFilter((prev) => ({
			...prev,
			startDate,
		}));
	};

	const handleEndDateChange = (endDate: Date | undefined) => {
		setFilter((prev) => ({
			...prev,
			endDate,
		}));
	};

	const handleEdit = (record: any) => {
		setEditingRecord({
			id: record.id,
			date: record.date,
			userId: record.userId,
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
		const num = typeof value === "string" ? parseFloat(value) : value;
		return num.toFixed(2);
	};

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Converting Incentives</h1>
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
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="text-sm font-medium">Employee Name</label>
							<Input
								placeholder="Search by name or email..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="mt-1"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">Start Date</label>
							<DatePicker
								date={filter.startDate}
								onDateChange={handleStartDateChange}
								placeholder="Select start date"
							/>
						</div>
						<div>
							<label className="text-sm font-medium">End Date</label>
							<DatePicker
								date={filter.endDate}
								onDateChange={handleEndDateChange}
								placeholder="Select end date"
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
							{Array.from({ length: 5 }).map((_, i) => (
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Employee</TableHead>
										<TableHead>Gold Weight</TableHead>
										<TableHead>Silver Weight</TableHead>
										<TableHead>Total Incentive</TableHead>
										<TableHead>Staff 94%</TableHead>
										<TableHead>Staff 6%</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{(convertingIncentivesQuery.data?.items || []).length > 0 ? (
										(convertingIncentivesQuery.data?.items || []).map((item) => (
											<TableRow key={item.id}>
												<TableCell>{item.date}</TableCell>
												<TableCell>{item.userName}</TableCell>
												<TableCell>{formatCurrency(item.goldWeight)}</TableCell>
												<TableCell>{formatCurrency(item.silverWeight)}</TableCell>
												<TableCell>₹{formatCurrency(item.totalIncentive)}</TableCell>
												<TableCell>{item.staff94Percent}</TableCell>
												<TableCell>{item.staff6Percent}</TableCell>
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
										))
									) : (
										<TableRow>
											<TableCell colSpan={8} className="text-center py-4">
												No records found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}

					<div className="flex justify-between items-center mt-4 px-2">
						<div className="text-sm text-muted-foreground">
							Page {page} of {totalPages} (Total: {convertingIncentivesQuery.data?.total || 0})
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
