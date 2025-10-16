import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
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
});

function RouteComponent() {
	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(10);
	const [query, setQuery] = React.useState("");
	const [jobTitleId, setJobTitleId] = React.useState<string | undefined>();
	const [businessUnitId, setBusinessUnitId] = React.useState<
		string | undefined
	>();
	const [departmentId, setDepartmentId] = React.useState<string | undefined>();
	const [locationId, setLocationId] = React.useState<string | undefined>();
	const [legalEntityId, setLegalEntityId] = React.useState<
		string | undefined
	>();

	const { data: options } = orpc.options.useQueries({
		jobTitles: {},
		businessUnits: {},
		departments: {},
		locations: {},
		legalEntities: {},
	});

	const employeesQuery = orpc.employees.list.useQuery(
		{
			page,
			pageSize,
			filters: {
				query,
				jobTitleId,
				businessUnitId,
				departmentId,
				locationId,
				legalEntityId,
			},
		},
		{ keepPreviousData: true },
	);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle>Employees</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-6">
						<Input
							placeholder="Search name or email"
							value={query}
							onChange={(e) => {
								setPage(1);
								setQuery(e.target.value);
							}}
							className="md:col-span-2"
						/>
						<Select
							value={jobTitleId ?? ""}
							onValueChange={(v) => {
								setPage(1);
								setJobTitleId(v || undefined);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Job Title" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All</SelectItem>
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
								setPage(1);
								setBusinessUnitId(v || undefined);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Business Unit" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All</SelectItem>
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
								setPage(1);
								setDepartmentId(v || undefined);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Department" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All</SelectItem>
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
								setPage(1);
								setLocationId(v || undefined);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Location" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All</SelectItem>
								{options?.locations?.map((l) => (
									<SelectItem key={l.id} value={l.id}>
										{l.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select
							value={legalEntityId ?? ""}
							onValueChange={(v) => {
								setPage(1);
								setLegalEntityId(v || undefined);
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Legal Entity" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="">All</SelectItem>
								{options?.legalEntities?.map((le) => (
									<SelectItem key={le.id} value={le.id}>
										{le.name}
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
								onClick={() => setPage(1)}
							>
								First
							</Button>
							<Button
								variant="outline"
								disabled={page === 1}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
							>
								Prev
							</Button>
							<Button
								variant="outline"
								disabled={page * pageSize >= (employeesQuery.data?.total ?? 0)}
								onClick={() => setPage((p) => p + 1)}
							>
								Next
							</Button>
						</div>
						<Select
							value={String(pageSize)}
							onValueChange={(v) => {
								setPage(1);
								setPageSize(Number(v));
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
