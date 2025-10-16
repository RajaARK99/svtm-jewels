import { z } from "@orpc/zod";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import {
	businessUnit,
	department,
	employee,
	jobTitle,
	legalEntity,
	location,
} from "@/db/schema";
import { o, publicProcedure } from "@/orpc";

const employeesRouter = o.router({
	list: publicProcedure
		.input(
			z.object({
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(100).default(10),
				filters: z
					.object({
						query: z.string().optional(),
						jobTitleId: z.string().optional(),
						businessUnitId: z.string().optional(),
						departmentId: z.string().optional(),
						locationId: z.string().optional(),
						legalEntityId: z.string().optional(),
					})
					.partial()
					.default({}),
			}),
		)
		.query(async ({ input }) => {
			const { page, pageSize, filters } = input;

			const like = filters.query ? `%${filters.query}%` : undefined;
			const queryWhere = like
				? or(ilike(employee.name, like), ilike(employee.email, like))
				: undefined;

			const whereClauses = [
				queryWhere,
				filters.jobTitleId
					? eq(employee.jobTitleId, filters.jobTitleId)
					: undefined,
				filters.businessUnitId
					? eq(employee.businessUnitId, filters.businessUnitId)
					: undefined,
				filters.departmentId
					? eq(employee.departmentId, filters.departmentId)
					: undefined,
				filters.locationId
					? eq(employee.locationId, filters.locationId)
					: undefined,
				filters.legalEntityId
					? eq(employee.legalEntityId, filters.legalEntityId)
					: undefined,
			].filter((c): c is Exclude<typeof c, undefined> => Boolean(c));

			const finalWhere = whereClauses.length ? and(...whereClauses) : undefined;

			const totalQuery = db.select({ value: count() }).from(employee);
			const totalRows = finalWhere
				? await totalQuery.where(finalWhere).execute()
				: await totalQuery.execute();
			const [totalRow] = totalRows;

			let rowsQuery = db
				.select({
					id: employee.id,
					name: employee.name,
					email: employee.email,
					dateOfJoining: employee.dateOfJoining,
					jobTitleId: employee.jobTitleId,
					jobTitleName: jobTitle.name,
					businessUnitId: employee.businessUnitId,
					businessUnitName: businessUnit.name,
					departmentId: employee.departmentId,
					departmentName: department.name,
					locationId: employee.locationId,
					locationName: location.name,
					legalEntityId: employee.legalEntityId,
					legalEntityName: legalEntity.name,
				})
				.from(employee)
				.leftJoin(jobTitle, eq(employee.jobTitleId, jobTitle.id))
				.leftJoin(businessUnit, eq(employee.businessUnitId, businessUnit.id))
				.leftJoin(department, eq(employee.departmentId, department.id))
				.leftJoin(location, eq(employee.locationId, location.id))
				.leftJoin(legalEntity, eq(employee.legalEntityId, legalEntity.id))
				.orderBy(desc(employee.createdAt))
				.limit(pageSize)
				.offset((page - 1) * pageSize);
			if (finalWhere) rowsQuery = rowsQuery.where(finalWhere);
			const rows = await rowsQuery.execute();

			return {
				items: rows,
				page,
				pageSize,
				total: Number(totalRow?.value ?? 0),
			};
		}),
});

const optionsRouter = o.router({
	jobTitles: publicProcedure.query(async () => {
		const rows = await db
			.select()
			.from(jobTitle)
			.orderBy(jobTitle.name)
			.execute();
		return rows;
	}),
	businessUnits: publicProcedure.query(async () => {
		const rows = await db
			.select()
			.from(businessUnit)
			.orderBy(businessUnit.name)
			.execute();
		return rows;
	}),
	departments: publicProcedure.query(async () => {
		const rows = await db
			.select()
			.from(department)
			.orderBy(department.name)
			.execute();
		return rows;
	}),
	locations: publicProcedure.query(async () => {
		const rows = await db
			.select()
			.from(location)
			.orderBy(location.name)
			.execute();
		return rows;
	}),
	legalEntities: publicProcedure.query(async () => {
		const rows = await db
			.select()
			.from(legalEntity)
			.orderBy(legalEntity.name)
			.execute();
		return rows;
	}),
});

const router = o.router({
	employees: employeesRouter,
	options: optionsRouter,
});

export default router;
