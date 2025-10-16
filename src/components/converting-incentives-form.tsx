import { revalidateLogic, useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
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
import { DatePicker } from "@/components/ui/date-picker";

const convertingIncentivesFormSchema = z.object({
	userId: z.string().trim().min(1, { message: "Please select an employee" }),
	date: z.iso.datetime("Please select a valid date"),
	goldWeight: z.string().trim().min(1, { message: "Please enter a valid weight" }),
	coinWeight: z.string().trim().min(1, { message: "Please enter a valid weight" }),
	diamondWeight: z.string().trim().min(1, { message: "Please enter a valid weight" }),
	silverAntiqueWeight: z.string().trim().min(1, { message: "Please enter a valid weight" }),
	silverWeight: z.string().trim().min(1, { message: "Please enter a valid weight" }),
	salesIncentiveGold: z.string().trim().min(1, { message: "Please enter a valid sales incentive" }),
	salesIncentiveGoldCoin: z.string().trim().min(1, { message: "Please enter a valid sales incentive" }),
	salesIncentiveDiamond: z.string().trim().min(1, { message: "Please enter a valid sales incentive" }),
	salesIncentiveSilverAntique: z.string().trim().min(1, { message: "Please enter a valid sales incentive" }),
	salesIncentiveSilver: z.string().trim().min(1, { message: "Please enter a valid sales incentive" }),
	totalIncentive: z.string().trim().min(1, { message: "Please enter a valid total incentive" }),
	staff94Percent: z.string().trim().min(1, { message: "Please enter a valid staff percentage" }),
	staff6Percent: z.string().trim().min(1, { message: "Please enter a valid staff percentage" }),
	absentStaff94: z.string().trim().min(1, { message: "Please enter a valid absent staff percentage" }),
	absentStaff6: z.string().trim().min(1, { message: "Please enter a valid absent staff percentage" }),
	incentivePerStaff94: z.string().trim().min(1, { message: "Please enter a valid incentive per staff percentage" }),
	incentivePerStaff6: z.string().trim().min(1, { message: "Please enter a valid incentive per staff percentage" }),
});

type ConvertingIncentivesForm = z.infer<typeof convertingIncentivesFormSchema>;


export interface ConvertingIncentivesFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingRecord?: {
		id: string;
		date: string;
		userId: string;
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
		createMutation.isPending ||
		updateMutation.isPending;

    const defaultValues: ConvertingIncentivesForm = {userId: editingRecord?.userId ?? "",
			date: editingRecord?.date ? new Date(editingRecord.date)?.toISOString() : new Date().toISOString(),
			goldWeight: "",
			coinWeight: "",
			diamondWeight: "",
			silverAntiqueWeight: "",
			silverWeight: "",
			salesIncentiveGold: "",
			salesIncentiveGoldCoin: "",
			salesIncentiveDiamond: "",
			salesIncentiveSilverAntique: "",
			salesIncentiveSilver: "",
			totalIncentive: "",
			staff94Percent: "",
			staff6Percent: "",
			absentStaff94: "",
			absentStaff6: "",
			incentivePerStaff94: "",
			incentivePerStaff6: ""}

	const form = useForm({
		defaultValues,
		validators: {
			onDynamic: convertingIncentivesFormSchema,
		},
		onSubmit: async ({ value }) => {
            console.log({value});
            
			const payload = {
				userId: value.userId,
				date: value.date ? new Date(value.date).toISOString() : new Date().toISOString(),
				goldWeight: value.goldWeight || undefined,
				coinWeight: value.coinWeight || undefined,
				diamondWeight: value.diamondWeight || undefined,
				silverAntiqueWeight: value.silverAntiqueWeight || undefined,
				silverWeight: value.silverWeight || undefined,
				salesIncentiveGold: value.salesIncentiveGold || undefined,
				salesIncentiveGoldCoin: value.salesIncentiveGoldCoin || undefined,
				salesIncentiveDiamond: value.salesIncentiveDiamond || undefined,
				salesIncentiveSilverAntique: value.salesIncentiveSilverAntique || undefined,
				salesIncentiveSilver: value.salesIncentiveSilver || undefined,
				totalIncentive: value.totalIncentive || undefined,
				staff94Percent: value.staff94Percent ? parseInt(value.staff94Percent) : undefined,
				staff6Percent: value.staff6Percent ? parseInt(value.staff6Percent) : undefined,
				absentStaff94: value.absentStaff94 ? parseInt(value.absentStaff94) : undefined,
				absentStaff6: value.absentStaff6 ? parseInt(value.absentStaff6) : undefined,
				incentivePerStaff94: value.incentivePerStaff94 || undefined,
				incentivePerStaff6: value.incentivePerStaff6 || undefined,
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

    const value= useStore(form.store, (state) => state.errors);

    console.log(value);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
						<form.Field name="userId">
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
										date={field.state.value ? new Date(field.state.value) : undefined}
										onDateChange={(date) => field.handleChange(date?.toISOString() ?? "")}
										disabled={isLoading}
									/>

									{field.state.meta.isTouched && !field.state.meta.isValid ? (
										<FieldError errors={field.state.meta.errors} />
									) : null}
								</Field>
							)}
						</form.Field>

						{/* Weight Metrics Section */}
						<div className="border-t pt-4">
							<h3 className="text-sm font-semibold mb-3">Weight Metrics (gm)</h3>
							<div className="grid grid-cols-2 gap-4">
								<form.Field name="goldWeight">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Gold Weight
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="coinWeight">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Coin Weight
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="diamondWeight">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Diamond Weight
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="silverAntiqueWeight">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Silver Antique Weight
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="silverWeight">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Silver Weight
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>
							</div>
						</div>

						{/* Sales Incentives Section */}
						<div className="border-t pt-4">
							<h3 className="text-sm font-semibold mb-3">Sales Incentives (Amount)</h3>
							<div className="grid grid-cols-2 gap-4">
								<form.Field name="salesIncentiveGold">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Gold - 4 Per Gm
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="salesIncentiveGoldCoin">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Gold Coin - 1 Per Gm
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="salesIncentiveDiamond">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Diamond - 500 Per CT
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="salesIncentiveSilverAntique">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Silver Antique - 4 Per Gm
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="salesIncentiveSilver">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Silver - 0.30 Per Gm
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="totalIncentive">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Total Incentive
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>
							</div>
						</div>

						{/* Staff Metrics Section */}
						<div className="border-t pt-4">
							<h3 className="text-sm font-semibold mb-3">Staff Metrics</h3>
							<div className="grid grid-cols-2 gap-4">
								<form.Field name="staff94Percent">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Staff @ 94%
											</FieldLabel>
											<Input
												type="number"
												step="1"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="staff6Percent">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Staff @ 6%
											</FieldLabel>
											<Input
												type="number"
												step="1"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="absentStaff94">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Absent Staff @ 94%
											</FieldLabel>
											<Input
												type="number"
												step="1"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="absentStaff6">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Absent Staff @ 6%
											</FieldLabel>
											<Input
												type="number"
												step="1"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="incentivePerStaff94">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Incentive Per Staff @ 94%
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>

								<form.Field name="incentivePerStaff6">
									{(field) => (
										<Field>
											<FieldLabel className="mb-2 block font-medium text-sm">
												Incentive Per Staff @ 6%
											</FieldLabel>
											<Input
												type="number"
												step="0.01"
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												placeholder="0.00"
												disabled={isLoading}
											/>
										</Field>
									)}
								</form.Field>
							</div>
						</div>

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
