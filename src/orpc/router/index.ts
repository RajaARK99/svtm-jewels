import { and, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
	attendance,
	attendanceCode,
	attendanceEntry,
	businessUnit,
	department,
	employee,
	jobTitle,
	legalEntity,
	location,
	convertingIncentives,
	convertingMetricType,
	convertingMetricsDetail,
} from "@/db/schema";
import { user } from "@/db/schema/auth";
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
		.handler(async ({ input }) => {
			const { page, pageSize, filters } = input;

			const like = filters.query ? `%${filters.query}%` : undefined;
			const queryWhere = like
				? or(ilike(user.name, like), ilike(user.email, like))
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

			const baseQuery = db
				.select({
					id: employee.id,
					name: user.name,
					email: user.email,
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
					userId: employee.userId,
				})
				.from(employee)
				.innerJoin(user, eq(employee.userId, user.id))
				.leftJoin(jobTitle, eq(employee.jobTitleId, jobTitle.id))
				.leftJoin(businessUnit, eq(employee.businessUnitId, businessUnit.id))
				.leftJoin(department, eq(employee.departmentId, department.id))
				.leftJoin(location, eq(employee.locationId, location.id))
				.leftJoin(legalEntity, eq(employee.legalEntityId, legalEntity.id));

			const rowsQuery = finalWhere ? baseQuery.where(finalWhere) : baseQuery;

			const rows = await rowsQuery
				.orderBy(desc(employee.createdAt))
				.limit(pageSize)
				.offset((page - 1) * pageSize)
				.execute();

			return {
				items: rows,
				page,
				pageSize,
				total: Number(totalRow?.value ?? 0),
			};
		}),
});

const attendanceRouter = o.router({
	list: publicProcedure
		.input(
			z.object({
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(100).default(10),
				filters: z
					.object({
						employeeName: z.string().optional(),
						startDate: z.string().optional(),
						endDate: z.string().optional(),
						leaveTypeId: z.string().optional(),
					})
					.partial()
					.default({}),
			}),
		)
		.handler(async ({ input }) => {
			const { page, pageSize, filters } = input;

			const whereClauses = [];

			// Filter by employee name
			if (filters.employeeName) {
				const like = `%${filters.employeeName}%`;
				whereClauses.push(or(ilike(user.name, like), ilike(user.email, like)));
			}

			// Filter by date range
			if (filters.startDate && filters.endDate) {
				whereClauses.push(
					and(
						gte(attendance.date, filters.startDate),
						lte(attendance.date, filters.endDate),
					),
				);
			} else if (filters.startDate) {
				whereClauses.push(eq(attendance.date, filters.startDate));
			}

			const finalWhere =
				whereClauses.length > 0 ? and(...whereClauses) : undefined;

			// Get total count
			const countQuery = db
				.select({ value: count() })
				.from(attendance)
				.innerJoin(user, eq(attendance.userId, user.id));

			const totalRows = finalWhere
				? await countQuery.where(finalWhere).execute()
				: await countQuery.execute();
			const [totalRow] = totalRows;

			// Get paginated results with attendance codes
			const rawRows = await db
				.select({
					id: attendance.id,
					date: attendance.date,
					userName: user.name,
					userEmail: user.email,
					userId: user.id,
					codeId: attendanceCode.id,
					codeDescription: attendanceCode.description,
					codeValue: attendanceCode.code,
					createdAt: attendance.createdAt,
				})
				.from(attendance)
				.innerJoin(user, eq(attendance.userId, user.id))
				.leftJoin(
					attendanceEntry,
					eq(attendance.id, attendanceEntry.attendanceId),
				)
				.leftJoin(
					attendanceCode,
					eq(attendanceEntry.attendanceCodeId, attendanceCode.id),
				)
				.where(finalWhere || undefined)
				.orderBy(desc(attendance.date))
				.limit(pageSize * 10) // Get more rows to account for duplicates
				.offset((page - 1) * pageSize)
				.execute();

			// Group results by attendance ID to aggregate multiple codes
			const recordsMap = new Map<
				string,
				{
					id: string;
					date: string;
					userName: string;
					userEmail: string;
					userId: string;
					codes: Array<{
						id: string;
						description: string;
						code: string;
					}>;
					createdAt: Date;
				}
			>();

			for (const row of rawRows) {
				if (!recordsMap.has(row.id)) {
					recordsMap.set(row.id, {
						id: row.id,
						date: row.date,
						userName: row.userName,
						userEmail: row.userEmail,
						userId: row.userId,
						codes: [],
						createdAt: row.createdAt,
					});
				}

				const record = recordsMap.get(row.id)!;
				if (
					row.codeId &&
					row.codeDescription &&
					row.codeValue &&
					!record.codes.find((c) => c.id === row.codeId)
				) {
					record.codes.push({
						id: row.codeId,
						description: row.codeDescription,
						code: row.codeValue,
					});
				}
			}

			const rows = Array.from(recordsMap.values()).slice(0, pageSize);

			return {
				items: rows,
				page,
				pageSize,
				total: Number(totalRow?.value ?? 0),
			};
		}),
	create: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				date: z.string(),
				attendanceCodeIds: z.array(z.string()).default([]),
			}),
		)
		.handler(async ({ input }) => {
			const { userId, date, attendanceCodeIds } = input;

			try {
				// Validate user exists
				const userExists = await db
					.select()
					.from(user)
					.where(eq(user.id, userId))
					.limit(1)
					.execute();

				if (!userExists || userExists.length === 0) {
					throw new Error(`User with ID ${userId} does not exist`);
				}

				// Validate attendance codes exist
				if (attendanceCodeIds.length > 0) {
					const codesExist = await db
						.select()
						.from(attendanceCode)
						.where(eq(attendanceCode.id, attendanceCodeIds[0]))
						.limit(1)
						.execute();

					if (!codesExist || codesExist.length === 0) {
						throw new Error("One or more attendance codes do not exist");
					}
				}

				// Create attendance record
				const attendanceId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				await db.insert(attendance).values({
					id: attendanceId,
					userId,
					date,
				});

				// Create attendance entries for each code
				for (const codeId of attendanceCodeIds) {
					const entryId = `ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
					await db.insert(attendanceEntry).values({
						id: entryId,
						attendanceId,
						attendanceCodeId: codeId,
					});
				}

				return {
					success: true,
					attendanceId,
					message: "Attendance record created successfully",
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to create attendance record";
				console.error("Error creating attendance:", error);
				throw new Error(errorMessage);
			}
		}),
	update: publicProcedure
		.input(
			z.object({
				attendanceId: z.string(),
				date: z.string().optional(),
				attendanceCodeIds: z.array(z.string()).optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { attendanceId, date, attendanceCodeIds } = input;

			try {
				// Validate attendance record exists
				const attendanceExists = await db
					.select()
					.from(attendance)
					.where(eq(attendance.id, attendanceId))
					.limit(1)
					.execute();

				if (!attendanceExists || attendanceExists.length === 0) {
					throw new Error(
						`Attendance record with ID ${attendanceId} does not exist`,
					);
				}

				// Update attendance date if provided
				if (date) {
					await db
						.update(attendance)
						.set({ date })
						.where(eq(attendance.id, attendanceId))
						.execute();
				}

				// Update attendance entries if provided
				if (attendanceCodeIds) {
					// Delete existing entries
					await db
						.delete(attendanceEntry)
						.where(eq(attendanceEntry.attendanceId, attendanceId))
						.execute();

					// Create new entries
					for (const codeId of attendanceCodeIds) {
						const entryId = `ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
						await db.insert(attendanceEntry).values({
							id: entryId,
							attendanceId,
							attendanceCodeId: codeId,
						});
					}
				}

				return {
					success: true,
					attendanceId,
					message: "Attendance record updated successfully",
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to update attendance record";
				console.error("Error updating attendance:", error);
				throw new Error(errorMessage);
			}
		}),
});

const convertingIncentivesRouter = o.router({
	list: publicProcedure
		.input(
			z.object({
				page: z.number().int().min(1).default(1),
				pageSize: z.number().int().min(1).max(100).default(10),
				filters: z
					.object({
						employeeName: z.string().optional(),
						startDate: z.string().optional(),
						endDate: z.string().optional(),
					})
					.partial()
					.default({}),
			}),
		)
		.handler(async ({ input }) => {
			const { page, pageSize, filters } = input;
			const offset = (page - 1) * pageSize;

			const like = filters.employeeName
				? `%${filters.employeeName}%`
				: undefined;
			const queryWhere = like
				? or(ilike(user.name, like), ilike(user.email, like))
				: undefined;

			const whereClauses = [
				queryWhere,
				filters.startDate
					? gte(convertingIncentives.date, filters.startDate)
					: undefined,
				filters.endDate
					? lte(convertingIncentives.date, filters.endDate)
					: undefined,
			].filter((c): c is Exclude<typeof c, undefined> => Boolean(c));

			const finalWhere = whereClauses.length ? and(...whereClauses) : undefined;

			const totalQuery = db.select({ value: count() }).from(convertingIncentives);
			const totalRows = finalWhere
				? await totalQuery.where(finalWhere).execute()
				: await totalQuery.execute();
			const [totalRow] = totalRows;

			const rawRows = await db
				.select({
					id: convertingIncentives.id,
					date: convertingIncentives.date,
					userName: user.name,
					userEmail: user.email,
					userId: convertingIncentives.userId,
					goldWeight: convertingIncentives.goldWeight,
					coinWeight: convertingIncentives.coinWeight,
					diamondWeight: convertingIncentives.diamondWeight,
					silverAntiqueWeight: convertingIncentives.silverAntiqueWeight,
					silverWeight: convertingIncentives.silverWeight,
					salesIncentiveGold: convertingIncentives.salesIncentiveGold,
					salesIncentiveGoldCoin: convertingIncentives.salesIncentiveGoldCoin,
					salesIncentiveDiamond: convertingIncentives.salesIncentiveDiamond,
					salesIncentiveSilverAntique:
						convertingIncentives.salesIncentiveSilverAntique,
					salesIncentiveSilver: convertingIncentives.salesIncentiveSilver,
					totalIncentive: convertingIncentives.totalIncentive,
					staff94Percent: convertingIncentives.staff94Percent,
					staff6Percent: convertingIncentives.staff6Percent,
					absentStaff94: convertingIncentives.absentStaff94,
					absentStaff6: convertingIncentives.absentStaff6,
					incentivePerStaff94: convertingIncentives.incentivePerStaff94,
					incentivePerStaff6: convertingIncentives.incentivePerStaff6,
					createdAt: convertingIncentives.createdAt,
				})
				.from(convertingIncentives)
				.innerJoin(user, eq(convertingIncentives.userId, user.id))
				.orderBy(desc(convertingIncentives.date))
				.limit(pageSize)
				.offset(offset);

			return {
				items: rawRows,
				page,
				pageSize,
				total: Number(totalRow?.value ?? 0),
			};
		}),
	create: publicProcedure
		.input(
			z.object({
				userId: z.string(),
				date: z.string(),
				goldWeight: z.string().optional(),
				coinWeight: z.string().optional(),
				diamondWeight: z.string().optional(),
				silverAntiqueWeight: z.string().optional(),
				silverWeight: z.string().optional(),
				salesIncentiveGold: z.string().optional(),
				salesIncentiveGoldCoin: z.string().optional(),
				salesIncentiveDiamond: z.string().optional(),
				salesIncentiveSilverAntique: z.string().optional(),
				salesIncentiveSilver: z.string().optional(),
				totalIncentive: z.string().optional(),
				staff94Percent: z.number().optional(),
				staff6Percent: z.number().optional(),
				absentStaff94: z.number().optional(),
				absentStaff6: z.number().optional(),
				incentivePerStaff94: z.string().optional(),
				incentivePerStaff6: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const {
				userId,
				date,
				goldWeight,
				coinWeight,
				diamondWeight,
				silverAntiqueWeight,
				silverWeight,
				salesIncentiveGold,
				salesIncentiveGoldCoin,
				salesIncentiveDiamond,
				salesIncentiveSilverAntique,
				salesIncentiveSilver,
				totalIncentive,
				staff94Percent,
				staff6Percent,
				absentStaff94,
				absentStaff6,
				incentivePerStaff94,
				incentivePerStaff6,
			} = input;

			try {
				// Validate user exists
				const userExists = await db
					.select()
					.from(user)
					.where(eq(user.id, userId))
					.limit(1)
					.execute();

				if (!userExists || userExists.length === 0) {
					throw new Error(`User with ID ${userId} does not exist`);
				}

				const id = `ci_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				await db.insert(convertingIncentives).values({
					id,
					userId,
					date,
					goldWeight,
					coinWeight,
					diamondWeight,
					silverAntiqueWeight,
					silverWeight,
					salesIncentiveGold,
					salesIncentiveGoldCoin,
					salesIncentiveDiamond,
					salesIncentiveSilverAntique,
					salesIncentiveSilver,
					totalIncentive,
					staff94Percent,
					staff6Percent,
					absentStaff94,
					absentStaff6,
					incentivePerStaff94,
					incentivePerStaff6,
				});

				return {
					success: true,
					id,
					message: "Converting incentive record created successfully",
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to create converting incentive record";
				console.error("Error creating converting incentive:", error);
				throw new Error(errorMessage);
			}
		}),
	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				date: z.string().optional(),
				goldWeight: z.string().optional(),
				coinWeight: z.string().optional(),
				diamondWeight: z.string().optional(),
				silverAntiqueWeight: z.string().optional(),
				silverWeight: z.string().optional(),
				salesIncentiveGold: z.string().optional(),
				salesIncentiveGoldCoin: z.string().optional(),
				salesIncentiveDiamond: z.string().optional(),
				salesIncentiveSilverAntique: z.string().optional(),
				salesIncentiveSilver: z.string().optional(),
				totalIncentive: z.string().optional(),
				staff94Percent: z.number().optional(),
				staff6Percent: z.number().optional(),
				absentStaff94: z.number().optional(),
				absentStaff6: z.number().optional(),
				incentivePerStaff94: z.string().optional(),
				incentivePerStaff6: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, ...updateData } = input;

			try {
				// Validate record exists
				const recordExists = await db
					.select()
					.from(convertingIncentives)
					.where(eq(convertingIncentives.id, id))
					.limit(1)
					.execute();

				if (!recordExists || recordExists.length === 0) {
					throw new Error(
						`Converting incentive record with ID ${id} does not exist`,
					);
				}

				// Build update object, only including provided fields
				const updateObject: Record<string, any> = {};
				Object.entries(updateData).forEach(([key, value]) => {
					if (value !== undefined) {
						updateObject[key] = value;
					}
				});

				if (Object.keys(updateObject).length > 0) {
					await db
						.update(convertingIncentives)
						.set(updateObject)
						.where(eq(convertingIncentives.id, id))
						.execute();
				}

				return {
					success: true,
					message: "Converting incentive record updated successfully",
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to update converting incentive record";
				console.error("Error updating converting incentive:", error);
				throw new Error(errorMessage);
			}
		}),
});

const optionsRouter = o.router({
	jobTitles: publicProcedure.handler(async () => {
		const rows = await db
			.select()
			.from(jobTitle)
			.orderBy(jobTitle.name)
			.execute();
		return rows;
	}),
	businessUnits: publicProcedure.handler(async () => {
		const rows = await db
			.select()
			.from(businessUnit)
			.orderBy(businessUnit.name)
			.execute();
		return rows;
	}),
	departments: publicProcedure.handler(async () => {
		const rows = await db
			.select()
			.from(department)
			.orderBy(department.name)
			.execute();
		return rows;
	}),
	locations: publicProcedure.handler(async () => {
		const rows = await db
			.select()
			.from(location)
			.orderBy(location.name)
			.execute();
		return rows;
	}),
	legalEntities: publicProcedure.handler(async () => {
		const rows = await db
			.select()
			.from(legalEntity)
			.orderBy(legalEntity.name)
			.execute();
		return rows;
	}),
	attendanceCodes: publicProcedure.handler(async () => {
		const rows = await db
			.select()
			.from(attendanceCode)
			.orderBy(attendanceCode.description)
			.execute();
		return rows;
	}),
});

const router = o.router({
	employees: employeesRouter,
	attendance: attendanceRouter,
	convertingIncentives: convertingIncentivesRouter,
	options: optionsRouter,
});

export default router;
