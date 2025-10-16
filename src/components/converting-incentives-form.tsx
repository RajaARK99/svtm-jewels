import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

const convertingIncentivesFormSchema = z.object({
	employeeId: z
		.string()
		.trim()
		.min(1, { message: "Please select an employee" }),
	date: z.date({ message: "Please select a valid date" }),
	typeId: z.string().trim().min(1, { message: "Please select a type" }),
	weight: z.string().trim().min(1, { message: "Please enter weight" }),
	visit: z.number().min(0, { message: "Please enter number of visits" }),
	amount: z.string().trim().min(1, { message: "Please enter amount" }),
});

type ConvertingIncentivesForm = z.infer<typeof convertingIncentivesFormSchema>;

export interface ConvertingIncentivesFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingRecord?: {
		id: string;
		date: string;
		employeeId: string;
		typeId: string;
		weight: string;
		visit: number;
		amount: string;
	};
	onSuccess?: () => void;
}

export function ConvertingIncentivesForm({
	open,
	onOpenChange,
	editingRecord,
	onSuccess,
}: ConvertingIncentivesFormProps) {
	const isEdit = !!editingRecord;

	// Fetch employees list
	const employeesQuery = useQuery(
		orpc.employees.list.queryOptions({
			input: {
				page: 1,
				pageSize: 100,
			},
		}),
	);

	// Fetch converting types
	const typesQuery = useQuery(
		orpc.convertingIncentives.getTypes.queryOptions(),
	);

	const queryClient = useQueryClient();

	// Create mutation
	const createMutation = useMutation(
		orpc.convertingIncentives.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(
					orpc.convertingIncentives.list.queryOptions({
						input: {
							page: 1,
							pageSize: 10,
						},
					}),
				);
				toast.success("Converting incentive record created successfully");
				onOpenChange(false);
				onSuccess?.();
			},
			onError: () => {
				toast.error("Failed to create converting incentive record");
			},
		}),
	);

	// Update mutation
	const updateMutation = useMutation(
		orpc.convertingIncentives.update.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(
					orpc.convertingIncentives.list.queryOptions({
						input: {
							page: 1,
							pageSize: 10,
						},
					}),
				);
				toast.success("Converting incentive record updated successfully");
				onOpenChange(false);
				onSuccess?.();
			},
			onError: () => {
				toast.error("Failed to update converting incentive record");
			},
		}),
	);

	const isLoading =
		employeesQuery.isLoading ||
		typesQuery.isLoading ||
		createMutation.isPending ||
		updateMutation.isPending;

	const defaultValues: ConvertingIncentivesForm = {
		employeeId: editingRecord?.employeeId ?? "",
		date: editingRecord?.date ? new Date(editingRecord.date) : new Date(),
		typeId: editingRecord?.typeId ?? "",
		weight: editingRecord?.weight ?? "",
		visit: editingRecord?.visit ?? 0,
		amount: editingRecord?.amount ?? "",
	};

	const form = useForm({
		defaultValues,
		validators: {
			onDynamic: convertingIncentivesFormSchema,
		},
		onSubmit: async ({ value }) => {
			const payload = {
				employeeId: value.employeeId,
				date: value.date.toISOString().split("T")[0],
				typeId: value.typeId,
				weight: value.weight,
				visit: value.visit,
				amount: value.amount,
			};

			if (isEdit && editingRecord) {
				updateMutation.mutate({
					id: editingRecord.id,
					...payload,
				});
			} else {
				createMutation.mutate(payload);
			}
		},
		validationLogic: revalidateLogic({
			mode: "change",
			modeAfterSubmission: "submit",
		}),
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Edit" : "Add"} Converting Incentive
					</DialogTitle>
					<DialogDescription>
						Enter the converting incentive details for the employee
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
						<form.Field name="employeeId">
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
						<form.Field name="date">
							{(field) => (
								<Field>
									<FieldLabel className="mb-2 block font-medium text-sm">
										Date
										{field.state.meta.errors.length > 0 && (
											<span className="ml-1 text-red-500">*</span>
										)}
									</FieldLabel>
									<DatePicker
										date={field.state.value}
										onDateChange={(date) =>
											field.handleChange(date || new Date())
										}
										disabled={isLoading}
										placeholder="Pick a date"
									/>

									{field.state.meta.isTouched && !field.state.meta.isValid ? (
										<FieldError errors={field.state.meta.errors} />
									) : null}
								</Field>
							)}
						</form.Field>

						{/* Type Selection */}
						<form.Field name="typeId">
							{(field) => (
								<Field>
									<FieldLabel
										htmlFor="type"
										className="mb-2 block font-medium text-sm"
									>
										Type
										{field.state.meta.errors.length > 0 && (
											<span className="ml-1 text-red-500">*</span>
										)}
									</FieldLabel>
									{typesQuery.isLoading ? (
										<Skeleton className="h-10 w-full" />
									) : (
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value)}
											disabled={isLoading}
										>
											<SelectTrigger id="type">
												<SelectValue placeholder="Select a type" />
											</SelectTrigger>
											<SelectContent>
												{typesQuery.data?.map((type) => (
													<SelectItem key={type.id} value={type.id}>
														{type.name}
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

						{/* Weight Input */}
						<form.Field name="weight">
							{(field) => (
								<Field>
									<FieldLabel className="mb-2 block font-medium text-sm">
										Weight (gm)
										{field.state.meta.errors.length > 0 && (
											<span className="ml-1 text-red-500">*</span>
										)}
									</FieldLabel>
									<Input
										type="number"
										step="0.01"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="0.00"
										disabled={isLoading}
									/>
									{field.state.meta.isTouched && !field.state.meta.isValid ? (
										<FieldError errors={field.state.meta.errors} />
									) : null}
								</Field>
							)}
						</form.Field>

						{/* Visit Input */}
						<form.Field name="visit">
							{(field) => (
								<Field>
									<FieldLabel className="mb-2 block font-medium text-sm">
										Number of Visits
										{field.state.meta.errors.length > 0 && (
											<span className="ml-1 text-red-500">*</span>
										)}
									</FieldLabel>
									<Input
										type="number"
										step="1"
										min="0"
										value={field.state.value}
										onChange={(e) =>
											field.handleChange(Number.parseInt(e.target.value) || 0)
										}
										placeholder="0"
										disabled={isLoading}
									/>
									{field.state.meta.isTouched && !field.state.meta.isValid ? (
										<FieldError errors={field.state.meta.errors} />
									) : null}
								</Field>
							)}
						</form.Field>

						{/* Amount Input */}
						<form.Field name="amount">
							{(field) => (
								<Field>
									<FieldLabel className="mb-2 block font-medium text-sm">
										Amount (₹)
										{field.state.meta.errors.length > 0 && (
											<span className="ml-1 text-red-500">*</span>
										)}
									</FieldLabel>
									<Input
										type="number"
										step="0.01"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="0.00"
										disabled={isLoading}
									/>
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
