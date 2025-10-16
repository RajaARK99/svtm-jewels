import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export const Route = createFileRoute("/_privateLayout/employees")({
	component: RouteComponent,
	validateSearch: z.object({
		page: z.number().int().min(1).default(1),
		pageSize: z.number().int().min(1).max(100).default(10),
		query: z.string().optional(),
		jobTitleId: z.string().optional(),
		businessUnitId: z.string().optional(),
		departmentId: z.string().optional(),
		locationId: z.string().optional(),
	}),
});

function RouteComponent() {
	const {
		page,
		pageSize,
		query,
		jobTitleId,
		businessUnitId,
		departmentId,
		locationId,
	} = Route.useSearch();
	const navigate = useNavigate({ from: Route.fullPath });

	const jobTitlesQuery = useQuery(orpc.options.jobTitles.queryOptions());
	const businessUnitsQuery = useQuery(
		orpc.options.businessUnits.queryOptions(),
	);
	const departmentsQuery = useQuery(orpc.options.departments.queryOptions());
	const locationsQuery = useQuery(orpc.options.locations.queryOptions());
	const legalEntitiesQuery = useQuery(
		orpc.options.legalEntities.queryOptions(),
	);

	const options = {
		jobTitles: jobTitlesQuery.data,
		businessUnits: businessUnitsQuery.data,
		departments: departmentsQuery.data,
		locations: locationsQuery.data,
		legalEntities: legalEntitiesQuery.data,
	};

	const employeesQuery = useQuery(
		orpc.employees.list.queryOptions({
			input: {
				page,
				pageSize,
				filters: {
					query,
					jobTitleId: jobTitleId === "All" ? undefined : jobTitleId,
					businessUnitId: businessUnitId === "All" ? undefined : businessUnitId,
					departmentId: departmentId === "All" ? undefined : departmentId,
					locationId: locationId === "All" ? undefined : locationId,
				},
			},
		}),
	);

	return (
		<div className="space-y-4 p-4">
			<Card>
				<CardHeader>
					<CardTitle>Employees</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-3">
						<Input
							placeholder="Search name or email"
							value={query}
							onChange={(e) => {
								navigate({ search: { page: 1, query: e.target.value } });
							}}
							className="max-w-96"
						/>
						<Select
							value={jobTitleId ?? ""}
							onValueChange={(v) => {
								navigate({ search: { page: 1, jobTitleId: v } });
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Job Title" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All">All</SelectItem>
								{options?.jobTitles?.map((jt) => (
									<SelectItem key={jt.id} value={jt.id}>
										{jt.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={businessUnitId ?? ""}
							onValueChange={(v) => {
								navigate({ search: { page: 1, businessUnitId: v } });
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Business Unit" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All	">All</SelectItem>
								{options?.businessUnits?.map((bu) => (
									<SelectItem key={bu.id} value={bu.id}>
										{bu.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={departmentId ?? ""}
							onValueChange={(v) => {
								navigate({ search: { page: 1, departmentId: v } });
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Department" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All">All</SelectItem>
								{options?.departments?.map((d) => (
									<SelectItem key={d.id} value={d.id}>
										{d.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={locationId ?? ""}
							onValueChange={(v) => {
								navigate({ search: { page: 1, locationId: v } });
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Location" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="All">All</SelectItem>
								{options?.locations?.map((l) => (
									<SelectItem key={l.id} value={l.id}>
										{l.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="pt-6">
					{employeesQuery.isLoading ? (
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
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Job Title</TableHead>
										<TableHead>Department</TableHead>
										<TableHead>Business Unit</TableHead>
										<TableHead>Location</TableHead>
										<TableHead>Legal Entity</TableHead>
										<TableHead>Joined</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{employeesQuery.data?.items?.map((e) => (
										<TableRow key={e.id}>
											<TableCell>{e.name}</TableCell>
											<TableCell className="lowercase">{e.email}</TableCell>
											<TableCell>{e.jobTitleName}</TableCell>
											<TableCell>{e.departmentName}</TableCell>
											<TableCell>{e.businessUnitName}</TableCell>
											<TableCell>{e.locationName}</TableCell>
											<TableCell>{e.legalEntityName}</TableCell>
											<TableCell>
												{new Date(
													e.dateOfJoining as unknown as string,
												).toLocaleDateString()}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
					<div className="flex items-center justify-between py-4">
						<div className="text-muted-foreground text-sm">
							Page {page} /{" "}
							{Math.max(
								1,
								Math.ceil((employeesQuery.data?.total ?? 0) / pageSize),
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
								disabled={page * pageSize >= (employeesQuery.data?.total ?? 0)}
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
		</div>
	);
}
