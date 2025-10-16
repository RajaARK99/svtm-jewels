import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/orpc/client";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";

const attendanceFormSchema = z.object({
	userId: z.string().trim().min(1, { message: "Please select an employee" }),
	date: z.iso.datetime("Please select a valid date"),
	attendanceCodeIds: z.array(z.string().trim()).min(1, { message: "Please select at least one leave type" }),
});

export interface AttendanceFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	attendanceRecord?: {
		id: string;
		date: string;
		userId: string;
		leaveCodeIds: string[];
	};
	onSuccess?: () => void;
}

export function AttendanceForm({
	open,
	onOpenChange,
	attendanceRecord,
	onSuccess,
}: AttendanceFormProps) {
	const isEdit = !!attendanceRecord;

	// Fetch employees list
	const employeesQuery = useQuery(
		orpc.employees.list.queryOptions({
			input: {
				page: 1,
				pageSize: 100,
			},
		}),
	);

	// Fetch attendance codes
	const codesQuery = useQuery(orpc.options.attendanceCodes.queryOptions());

	const queryClient = useQueryClient();
	// Create mutation
	const createMutation = useMutation(
		orpc.attendance.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(orpc.attendance.list.queryOptions({input:{
					page: 1,
					pageSize: 100,
				}}))
				toast.success("Attendance record created successfully");
				onOpenChange(false);
				onSuccess?.();
			},
			onError: () => {
				toast.error("Failed to create attendance record");
			},
		}),
	);

	// Update mutation
	const updateMutation = useMutation(
		orpc.attendance.update.mutationOptions({
			onSuccess: () => {
				toast.success("Attendance record updated successfully");
				onOpenChange(false);
				onSuccess?.();
			},
			onError: () => {
				toast.error("Failed to update attendance record");
			},
		}),
	);

	const isLoading =
		employeesQuery.isLoading ||
		codesQuery.isLoading ||
		createMutation.isPending ||
		updateMutation.isPending;

	const form = useForm({
		defaultValues: {
			userId: attendanceRecord?.userId ?? "",
			date: attendanceRecord?.date ? new Date(attendanceRecord.date)?.toISOString() : "",
			attendanceCodeIds:
				(attendanceRecord?.leaveCodeIds as unknown as string[]) ?? [],
		},
		validators: {
			onDynamic: attendanceFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (isEdit && attendanceRecord) {
				updateMutation.mutate({
					attendanceId: attendanceRecord.id,
					date: value.date,
					attendanceCodeIds: value.attendanceCodeIds,
				});
			} else {
				createMutation.mutate({
					userId: value.userId,
					date: value.date,
					attendanceCodeIds: value.attendanceCodeIds,
				});
			}
		},
		validationLogic: revalidateLogic({
			mode: "change",
			modeAfterSubmission: "submit",
		}),
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit Attendance" : "Create Attendance"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update the attendance record details"
							: "Create a new attendance record"}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="space-y-4"
				>
					 <FieldGroup>

					{/* Employee Selection */}
					<form.Field
						name="userId"
					>
						{(field) => (
							<Field>
								<FieldLabel
									htmlFor="employee"
									className="mb-2 block font-medium text-sm"
								>
									Employee
									{field.state.meta.errors.length > 0 && (
										<span className="ml-1 text-red-500">*</span>
									)}
								</FieldLabel>
								{employeesQuery.isLoading ? (
									<Skeleton className="h-10 w-full" />
								) : (
									<Select
										value={field.state.value}
										onValueChange={(value) => field.handleChange(value)}
										disabled={isEdit || isLoading}
									>
										<SelectTrigger id="employee">
											<SelectValue placeholder="Select an employee" />
										</SelectTrigger>
										<SelectContent>
											{employeesQuery.data?.items?.map((emp) => (
												<SelectItem key={emp.id} value={emp.userId}>
													{emp.name} ({emp.email})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}

								{field.state.meta.isTouched && !field.state.meta.isValid ? (
									<FieldError errors={field.state.meta.errors} />
								) : null}
							</Field>
						)}
					</form.Field>

					{/* Date Selection */}
					<form.Field
						name="date"
					>
						{(field) => (
							<Field>
								<FieldLabel
									htmlFor="date"
									className="mb-2 block font-medium text-sm"
								>
									Date
									{field.state.meta.errors.length > 0 && (
										<span className="ml-1 text-red-500">*</span>
									)}
								</FieldLabel>
								<DatePicker
									date={
										field.state.value ? new Date(field.state.value) : undefined
									}
									onDateChange={(date) => {
										field.handleChange(
											date ? date.toISOString() : "",
										);
									}}
									placeholder="Select a date"
									disabled={isLoading}
								/>

								{field.state.meta.isTouched && !field.state.meta.isValid ? (
									<FieldError errors={field.state.meta.errors} />
								) : null}
							</Field>
						)}
					</form.Field>

					{/* Leave Type Selection */}
					<form.Field name="attendanceCodeIds">
						{(field) => (
							<Field>
								<FieldLabel
									htmlFor="leaveTypes"
									className="mb-2 block font-medium text-sm"
								>
									Leave Types
								</FieldLabel>
								{codesQuery.isLoading ? (
									<Skeleton className="h-10 w-full" />
								) : (
									<div
										id="leaveTypes"
										className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2"
									>
										{codesQuery.data?.map((code) => (
											<div
												key={code.id}
												className="flex cursor-pointer items-center space-x-2"
											>
												<Checkbox
													id={`leave-type-${code.id}`}
													checked={field.state.value.includes(code.id)}
													onCheckedChange={(checked) => {
														if (checked) {
															field.handleChange([
																...field.state.value,
																code.id,
															]);
														} else {
															field.handleChange(
																field.state.value.filter(
																	(id) => id !== code.id,
																),
															);
														}
													}}
													disabled={isLoading}
												/>
												<label
													htmlFor={`leave-type-${code.id}`}
													className="cursor-pointer font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
												>
													{code.description} ({code.code})
												</label>
											</div>
										))}
									</div>
								)}

								{field.state.meta.isTouched && !field.state.meta.isValid ? (
									<FieldError errors={field.state.meta.errors} />
								) : null}
							</Field>
						)}
					</form.Field>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Loading..." : isEdit ? "Update" : "Create"}
						</Button>
					</div>
					 </FieldGroup>
				</form>
			</DialogContent>
		</Dialog>
	);
}
