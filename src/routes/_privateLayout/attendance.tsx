import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import z from "zod";
import { AttendanceForm } from "@/components/attendance-form";
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

export const Route = createFileRoute("/_privateLayout/attendance")({
	component: RouteComponent,
	validateSearch: z.object({
		page: z.number().int().min(1).default(1),
		pageSize: z.number().int().min(1).max(100).default(10),
	}),
});

function RouteComponent() {
	const { page, pageSize } =
		Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });
	const queryClient = useQueryClient();

	// Local state for immediate UI feedback
	const [searchInput, setSearchInput] = React.useState("");

	const [filter, setFilter] = React.useState<{
		query: string;
		startDate: Date | undefined;
		endDate: Date | undefined;
		leaveTypeId: string | undefined;
	}>({
		query: "",
		startDate: undefined,
		endDate: undefined,
		leaveTypeId: undefined,
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
				leaveCodeIds: string[];
		  }
		| undefined
	>(undefined);

	const attendanceCodesQuery = useQuery(
		orpc.options.attendanceCodes.queryOptions(),
	);

	const attendanceQuery = useQuery(
		orpc.attendance.list.queryOptions({
			input: {
				page,
				pageSize,
				filters: {
					employeeName:filter.query,
					startDate:filter.startDate ? filter.startDate.toISOString() : undefined,
					endDate:filter.endDate ? filter.endDate.toISOString() : undefined,
					leaveTypeId: filter.leaveTypeId === "All" ? undefined : filter.leaveTypeId,
				}
			},
		}),
	);

	const handleStartDateChange = (startDate: Date | undefined) => {
		setFilter((prev)=>{
			return {
				...prev,
				startDate: startDate,
			};
		});
	};

	const handleEndDateChange = (endDate: Date | undefined) => {	
		setFilter((prev)=>{
			return {
				...prev,
				endDate: endDate,
			};
		});
	};
	const handleCreateNew = () => {
		setEditingRecord(undefined);
		setFormOpen(true);
	};

	const handleEdit = (record: {
		id: string;
		date: string;
		userId: string;
		leaveCodeIds: string[];
	}) => {
		setEditingRecord(record);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		queryClient.invalidateQueries({
			predicate: (query) => {
				const queryKey = query.queryKey;
				return (
					Array.isArray(queryKey) && queryKey[0] === "orpc.attendance.list"
				);
			},
		});
	};

	return (
		<div className="space-y-4 p-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Attendance</CardTitle>
					<Button onClick={handleCreateNew}>Create New</Button>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-3">
						<Input
							placeholder="Search employee name or email"
							value={searchInput}
							onChange={(e) => {
								setSearchInput(e.target.value);
							}}
							className="max-w-96"
						/>
						<div className="w-48">
							<DatePicker
								date={filter?.startDate}
								onDateChange={handleStartDateChange}
								placeholder="Start Date"
							/>
						</div>
						<div className="w-48">
							<DatePicker
								date={filter?.endDate}
								onDateChange={handleEndDateChange}
								placeholder="End Date"
							/>
						</div>
						<Select
							value={filter?.leaveTypeId ?? ""}
							onValueChange={(v) => {
								setFilter((prev)=>{
									return {
										...prev,
										leaveTypeId: v,
									};
								});
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Leave Type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All">All</SelectItem>
								{attendanceCodesQuery?.data?.map((code) => (
									<SelectItem key={code.id} value={code.id}>
										{code.description} ({code.code})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-6">
					{attendanceQuery.isLoading ? (
						<div className="space-y-2">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					) : (
						<div className="overflow-hidden rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Employee Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Leave Type</TableHead>
										<TableHead>Leave Code</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{attendanceQuery.data?.items &&
									attendanceQuery.data.items.length > 0 ? (
										attendanceQuery.data.items.map((record, idx) => (
											<TableRow key={`${record.id}-${idx}`}>
												<TableCell>{record.userName}</TableCell>
												<TableCell className="lowercase">
													{record.userEmail}
												</TableCell>
												<TableCell>
													{new Date(
														record.date as unknown as string,
													).toLocaleDateString()}
												</TableCell>
												<TableCell>
													{record.codes && record.codes.length > 0
														? record.codes
																.map((c) => c.description)
																.join(", ")
														: "-"}
												</TableCell>
												<TableCell>
													{record.codes && record.codes.length > 0
														? record.codes
																.map((c) => c.code)
																.join(", ")
														: "-"}
												</TableCell>
												<TableCell>
													<Button
														variant="outline"
														size="sm"
														onClick={() => {
															handleEdit({
																id: record.id,
																date: record.date,
																userId: record.userId,
																leaveCodeIds: record.codes?.map(
																	(c) => c.id,
																) ?? [],
															});
														}}
													>
														Edit
													</Button>
												</TableCell>
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={6} className="text-center">
												No attendance records found
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
					<div className="flex items-center justify-between py-4">
						<div className="text-muted-foreground text-sm">
							Page {page} /{" "}
							{Math.max(
								1,
								Math.ceil((attendanceQuery.data?.total ?? 0) / pageSize),
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								disabled={page === 1}
								onClick={() => navigate({ search: { page: page - 1 } })}
							>
								Prev
							</Button>
							<Button
								variant="outline"
								disabled={page * pageSize >= (attendanceQuery.data?.total ?? 0)}
								onClick={() => navigate({ search: { page: page + 1 } })}
							>
								Next
							</Button>
						</div>
						<Select
							value={String(pageSize)}
							onValueChange={(v) => {
								navigate({ search: { pageSize: Number(v) } });
							}}
						>
							<SelectTrigger className="w-[100px]">
								<SelectValue placeholder={String(pageSize)} />
							</SelectTrigger>
							<SelectContent>
								{[10, 20, 25, 30, 40, 50].map((s) => (
									<SelectItem key={s} value={String(s)}>
										{s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<AttendanceForm
				open={formOpen}
				onOpenChange={setFormOpen}
				attendanceRecord={editingRecord}
				onSuccess={handleFormSuccess}
			/>
		</div>
	);
}
