import { and, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
	attendance,
	attendanceCode,
	attendanceEntry,
	businessUnit,
	convertingIncentives,
	convertingType,
	department,
	employee,
	jobTitle,
	legalEntity,
	location,
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

				const record = recordsMap.get(row.id);
				if (record) {
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
						type: z.string().optional(),
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
				filters.type
					? eq(convertingIncentives.typeId, filters.type)
					: undefined,
				filters.startDate
					? gte(convertingIncentives.date, filters.startDate)
					: undefined,
				filters.endDate
					? lte(convertingIncentives.date, filters.endDate)
					: undefined,
			].filter((c): c is Exclude<typeof c, undefined> => Boolean(c));

			const finalWhere =
				whereClauses.length > 0 ? and(...whereClauses) : undefined;

			const totalQuery = db
				.select({ value: count() })
				.from(convertingIncentives);
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
					employeeId: convertingIncentives.employeeId,
					typeId: convertingIncentives.typeId,
					typeName: convertingType.name,
					weight: convertingIncentives.weight,
					visit: convertingIncentives.visit,
					amount: convertingIncentives.amount,
					createdAt: convertingIncentives.createdAt,
				})
				.from(convertingIncentives)
				.innerJoin(user, eq(convertingIncentives.employeeId, user.id))
				.innerJoin(
					convertingType,
					eq(convertingIncentives.typeId, convertingType.id),
				)
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
				employeeId: z.string(),
				date: z.string(),
				typeId: z.string(),
				weight: z.string(),
				visit: z.number(),
				amount: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			const { employeeId, date, typeId, weight, visit, amount } = input;

			try {
				// Validate employee exists
				const employeeExists = await db
					.select()
					.from(user)
					.where(eq(user.id, employeeId))
					.limit(1)
					.execute();

				if (!employeeExists || employeeExists.length === 0) {
					throw new Error(`Employee with ID ${employeeId} does not exist`);
				}

				// Validate type exists
				const typeExists = await db
					.select()
					.from(convertingType)
					.where(eq(convertingType.id, typeId))
					.limit(1)
					.execute();

				if (!typeExists || typeExists.length === 0) {
					throw new Error(`Converting type with ID ${typeId} does not exist`);
				}

				const id = `ci_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
				await db.insert(convertingIncentives).values({
					id,
					employeeId,
					date,
					typeId,
					weight: weight || "0",
					visit,
					amount: amount || "0",
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
				employeeId: z.string().optional(),
				date: z.string().optional(),
				typeId: z.string().optional(),
				weight: z.string().optional(),
				visit: z.number().optional(),
				amount: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { id, employeeId, date, typeId, weight, visit, amount } = input;

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

				// Validate employee exists if provided
				if (employeeId) {
					const employeeExists = await db
						.select()
						.from(user)
						.where(eq(user.id, employeeId))
						.limit(1)
						.execute();

					if (!employeeExists || employeeExists.length === 0) {
						throw new Error(`Employee with ID ${employeeId} does not exist`);
					}
				}

				// Validate type exists if provided
				if (typeId) {
					const typeExists = await db
						.select()
						.from(convertingType)
						.where(eq(convertingType.id, typeId))
						.limit(1)
						.execute();

					if (!typeExists || typeExists.length === 0) {
						throw new Error(`Converting type with ID ${typeId} does not exist`);
					}
				}

				// Build update object, only including provided fields
				const updateObject: Record<string, string | number | undefined> = {};
				if (employeeId !== undefined) updateObject.employeeId = employeeId;
				if (date !== undefined) updateObject.date = date;
				if (typeId !== undefined) updateObject.typeId = typeId;
				if (weight !== undefined) updateObject.weight = weight;
				if (visit !== undefined) updateObject.visit = visit;
				if (amount !== undefined) updateObject.amount = amount;

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
	getTypes: publicProcedure.handler(async () => {
		try {
			const types = await db
				.select({
					id: convertingType.id,
					name: convertingType.name,
					description: convertingType.description,
				})
				.from(convertingType)
				.execute();

			return types;
		} catch (error) {
			console.error("Error fetching converting types:", error);
			throw new Error("Failed to fetch converting types");
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
	convertingTypes: publicProcedure.handler(async () => {
		const rows = await db
			.select()
			.from(convertingType)
			.orderBy(convertingType.name)
			.execute();
		return rows;
	}),
});

const dashboardRouter = o.router({
	// Get summary metrics
	metrics: publicProcedure.handler(async () => {
		try {
			// Total Revenue
			const revenueResult = await db
				.select({
					total: sql<string>`COALESCE(SUM(${convertingIncentives.amount}), '0')`,
				})
				.from(convertingIncentives)
				.execute();
			const totalRevenue = Number.parseFloat(revenueResult[0]?.total || "0");

			// Total Weight
			const weightResult = await db
				.select({
					total: sql<string>`COALESCE(SUM(${convertingIncentives.weight}), '0')`,
				})
				.from(convertingIncentives)
				.execute();
			const totalWeight = Number.parseFloat(weightResult[0]?.total || "0");

			// Total Employees
			const employeeCountResult = await db
				.select({ value: count() })
				.from(employee)
				.execute();
			const totalEmployees = employeeCountResult[0]?.value || 0;

			// Total Visits
			const visitsResult = await db
				.select({
					total: sql<number>`COALESCE(SUM(${convertingIncentives.visit}), 0)`,
				})
				.from(convertingIncentives)
				.execute();
			const totalVisits = visitsResult[0]?.total || 0;

			// Average Revenue per Visit
			const avgPerVisit = totalVisits > 0 ? totalRevenue / totalVisits : 0;

			// Total Attendance Records
			const attendanceCountResult = await db
				.select({ value: count() })
				.from(attendance)
				.execute();
			const totalAttendanceRecords = attendanceCountResult[0]?.value || 0;

			// Unique employees with attendance
			const uniqueAttendanceResult = await db
				.select({
					uniqueCount: sql<number>`COUNT(DISTINCT ${attendance.userId})`,
				})
				.from(attendance)
				.execute();
			const employeesWithAttendance =
				uniqueAttendanceResult[0]?.uniqueCount || 0;

			return {
				totalRevenue,
				totalWeight,
				totalEmployees,
				totalVisits,
				avgPerVisit,
				totalAttendanceRecords,
				employeesWithAttendance,
			};
		} catch (error) {
			console.error("Error fetching dashboard metrics:", error);
			throw new Error("Failed to fetch dashboard metrics");
		}
	}),

	// Get revenue trend (last 30 days)
	revenueTrend: publicProcedure.handler(async () => {
		try {
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const data = await db
				.select({
					date: convertingIncentives.date,
					amount: sql<string>`COALESCE(SUM(${convertingIncentives.amount}), '0')`,
					weight: sql<string>`COALESCE(SUM(${convertingIncentives.weight}), '0')`,
					visits: sql<number>`COALESCE(SUM(${convertingIncentives.visit}), 0)`,
				})
				.from(convertingIncentives)
				.where(
					gte(
						convertingIncentives.date,
						thirtyDaysAgo.toISOString().split("T")[0],
					),
				)
				.groupBy(convertingIncentives.date)
				.orderBy(convertingIncentives.date)
				.execute();

			return data.map((item) => ({
				date: item.date,
				amount: Number.parseFloat(item.amount),
				weight: Number.parseFloat(item.weight),
				visits: item.visits,
			}));
		} catch (error) {
			console.error("Error fetching revenue trend:", error);
			throw new Error("Failed to fetch revenue trend");
		}
	}),

	// Get revenue distribution by type
	typeDistribution: publicProcedure.handler(async () => {
		try {
			const data = await db
				.select({
					name: convertingType.name,
					value: sql<string>`COALESCE(SUM(${convertingIncentives.amount}), '0')`,
					count: sql<number>`COUNT(${convertingIncentives.id})`,
				})
				.from(convertingIncentives)
				.innerJoin(
					convertingType,
					eq(convertingIncentives.typeId, convertingType.id),
				)
				.groupBy(convertingType.name)
				.orderBy(sql`SUM(${convertingIncentives.amount}) DESC`)
				.execute();

			return data.map((item) => ({
				name: item.name,
				value: Number.parseFloat(item.value),
				count: item.count,
			}));
		} catch (error) {
			console.error("Error fetching type distribution:", error);
			throw new Error("Failed to fetch type distribution");
		}
	}),

	// Get top employees by revenue
	topEmployees: publicProcedure
		.input(
			z.object({
				limit: z.number().int().min(1).max(100).default(10),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const data = await db
					.select({
						employeeId: convertingIncentives.employeeId,
						employeeName: user.name,
						employeeEmail: user.email,
						revenue: sql<string>`COALESCE(SUM(${convertingIncentives.amount}), '0')`,
						weight: sql<string>`COALESCE(SUM(${convertingIncentives.weight}), '0')`,
						visits: sql<number>`COALESCE(SUM(${convertingIncentives.visit}), 0)`,
						recordCount: sql<number>`COUNT(${convertingIncentives.id})`,
					})
					.from(convertingIncentives)
					.innerJoin(user, eq(convertingIncentives.employeeId, user.id))
					.groupBy(convertingIncentives.employeeId, user.id)
					.orderBy(sql`SUM(${convertingIncentives.amount}) DESC`)
					.limit(input.limit)
					.execute();

				return data.map((item) => ({
					employeeId: item.employeeId,
					employeeName: item.employeeName,
					employeeEmail: item.employeeEmail,
					revenue: Number.parseFloat(item.revenue),
					weight: Number.parseFloat(item.weight),
					visits: item.visits,
					recordCount: item.recordCount,
				}));
			} catch (error) {
				console.error("Error fetching top employees:", error);
				throw new Error("Failed to fetch top employees");
			}
		}),

	// Get attendance statistics
	attendanceStats: publicProcedure.handler(async () => {
		try {
			// Total attendance records
			const totalRecordsResult = await db
				.select({ value: count() })
				.from(attendance)
				.execute();
			const totalRecords = totalRecordsResult[0]?.value || 0;

			// Unique employees with attendance
			const uniqueEmployeesResult = await db
				.select({
					count: sql<number>`COUNT(DISTINCT ${attendance.userId})`,
				})
				.from(attendance)
				.execute();
			const employeesWithRecords = uniqueEmployeesResult[0]?.count || 0;

			// Total employees
			const totalEmployeesResult = await db
				.select({ value: count() })
				.from(employee)
				.execute();
			const totalEmployees = totalEmployeesResult[0]?.value || 0;

			// Employees without attendance records
			const employeesWithoutRecords = totalEmployees - employeesWithRecords;

			// Get attendance by code
			const codeDistribution = await db
				.select({
					codeName: attendanceCode.description,
					code: attendanceCode.code,
					count: sql<number>`COUNT(${attendanceEntry.id})`,
				})
				.from(attendanceEntry)
				.innerJoin(
					attendanceCode,
					eq(attendanceEntry.attendanceCodeId, attendanceCode.id),
				)
				.groupBy(
					attendanceCode.id,
					attendanceCode.description,
					attendanceCode.code,
				)
				.orderBy(sql`COUNT(${attendanceEntry.id}) DESC`)
				.execute();

			return {
				totalRecords,
				employeesWithRecords,
				employeesWithoutRecords,
				totalEmployees,
				codeDistribution,
			};
		} catch (error) {
			console.error("Error fetching attendance stats:", error);
			throw new Error("Failed to fetch attendance stats");
		}
	}),

	// Get daily employee count trends
	employeeTrend: publicProcedure.handler(async () => {
		try {
			const thirtyDaysAgo = new Date();
			thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

			const data = await db
				.select({
					date: attendance.date,
					presentCount: sql<number>`COUNT(DISTINCT ${attendance.userId})`,
				})
				.from(attendance)
				.where(gte(attendance.date, thirtyDaysAgo.toISOString().split("T")[0]))
				.groupBy(attendance.date)
				.orderBy(attendance.date)
				.execute();

			return data;
		} catch (error) {
			console.error("Error fetching employee trend:", error);
			throw new Error("Failed to fetch employee trend");
		}
	}),

	// Get summary overview
	overview: publicProcedure.handler(async () => {
		try {
			const metrics = await db
				.select({
					totalRevenue: sql<string>`COALESCE(SUM(${convertingIncentives.amount}), '0')`,
					totalWeight: sql<string>`COALESCE(SUM(${convertingIncentives.weight}), '0')`,
					totalVisits: sql<number>`COALESCE(SUM(${convertingIncentives.visit}), 0)`,
					recordCount: count(),
				})
				.from(convertingIncentives)
				.execute();

			const employeeMetrics = await db
				.select({
					totalEmployees: count(),
				})
				.from(employee)
				.execute();

			const attendanceMetrics = await db
				.select({
					totalAttendance: count(),
					uniqueEmployees: sql<number>`COUNT(DISTINCT ${attendance.userId})`,
				})
				.from(attendance)
				.execute();

			const conversionTypes = await db
				.select({
					count: count(),
				})
				.from(convertingType)
				.execute();

			return {
				revenue: {
					total: Number.parseFloat(metrics[0]?.totalRevenue || "0"),
					avgPerVisit:
						(metrics[0]?.totalVisits || 0) > 0
							? Number.parseFloat(metrics[0]?.totalRevenue || "0") /
								(metrics[0]?.totalVisits || 1)
							: 0,
				},
				weight: {
					total: Number.parseFloat(metrics[0]?.totalWeight || "0"),
				},
				employees: {
					total: employeeMetrics[0]?.totalEmployees || 0,
					withAttendance: attendanceMetrics[0]?.uniqueEmployees || 0,
					withoutAttendance:
						(employeeMetrics[0]?.totalEmployees || 0) -
						(attendanceMetrics[0]?.uniqueEmployees || 0),
				},
				attendance: {
					records: attendanceMetrics[0]?.totalAttendance || 0,
				},
				conversions: {
					recordCount: metrics[0]?.recordCount || 0,
					typeCount: conversionTypes[0]?.count || 0,
				},
			};
		} catch (error) {
			console.error("Error fetching dashboard overview:", error);
			throw new Error("Failed to fetch dashboard overview");
		}
	}),
});

const router = o.router({
	employees: employeesRouter,
	attendance: attendanceRouter,
	convertingIncentives: convertingIncentivesRouter,
	options: optionsRouter,
	dashboard: dashboardRouter,
});

export default router;
