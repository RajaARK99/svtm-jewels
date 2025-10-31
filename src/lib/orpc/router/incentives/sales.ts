import { ORPCError } from "@orpc/server";
import { and, count, eq, gte, inArray, lte, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
  employeeAttendance,
  employeeAttendanceType,
} from "@/db/schema/attendance";
import { user } from "@/db/schema/auth";
import { employee } from "@/db/schema/employee";
import { salesIncentives } from "@/db/schema/incentives/sales";
import { attendance, salesIncentiveType } from "@/db/schema/options";
import { protectedProcedure } from "@/lib/orpc";

// Present attendance codes: P, WFH, OD, WOH, P(NS), P(MS)
const presentAttendanceCodes = ["P", "WFH", "OD", "WOH", "P(NS)", "P(MS)"];

// Absent attendance codes: SL, PL, LOP, FL, SPL, ML, PT, BL, CL, H, WO, A, L, NA
const absentAttendanceCodes = [
  "SL",
  "PL",
  "LOP",
  "FL",
  "SPL",
  "ML",
  "PT",
  "BL",
  "CL",
  "H",
  "WO",
  "A",
  "L",
  "NA",
];

const createSalesIncentive = protectedProcedure
  .route({
    path: "/create",
    method: "POST",
    summary: "Create a new sales incentive",
    description: "Create a new sales incentive",
  })
  .input(
    z.object({
      date: z.iso.datetime(),
      coinAmountPerGM: z.number(),
      goldAmountPerGM: z.number(),
      diamondAmountPerCT: z.number(),
      silverAntiqueAmountPerGM: z.number(),
      silverAmountPerGM: z.number(),
    }),
  )
  .output(z.object({ success: z.boolean(), message: z.string() }).nullish())
  .handler(
    async ({
      input: {
        date,
        goldAmountPerGM,
        coinAmountPerGM,
        diamondAmountPerCT,
        silverAntiqueAmountPerGM,
        silverAmountPerGM,
      },
    }) => {
      const gold4PerGmAmount = goldAmountPerGM * 4;
      const goldCoin1PerGmAmount = coinAmountPerGM * 1;
      const diamond500PerCtAmount = diamondAmountPerCT * 500;
      const silverAntique4PerGmAmount = silverAntiqueAmountPerGM * 4;
      const silverPerGmAmount = silverAmountPerGM * 0.3;

      const totalIncentive =
        gold4PerGmAmount +
        goldCoin1PerGmAmount +
        diamond500PerCtAmount +
        silverAntique4PerGmAmount +
        silverPerGmAmount;

      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Fetch both sales incentive types in parallel
      const [salesIncentiveType94, salesIncentiveType6] = await Promise.all([
        db.query.salesIncentiveType.findFirst({
          where: eq(salesIncentiveType.name, "94% Incentive"),
        }),
        db.query.salesIncentiveType.findFirst({
          where: eq(salesIncentiveType.name, "6% Incentive"),
        }),
      ]);

      if (!salesIncentiveType94) {
        throw new ORPCError("BAD_REQUEST", {
          data: {
            success: false,
            message: "94% incentive type not found",
          },
        });
      }

      if (!salesIncentiveType6) {
        throw new ORPCError("BAD_REQUEST", {
          data: {
            success: false,
            message: "6% incentive type not found",
          },
        });
      }

      // Helper function to count employees by incentive type and attendance codes
      const countEmployeesByAttendance = async (
        incentiveTypeId: string,
        attendanceCodes: string[],
      ) => {
        const result = await db
          .select({ count: count() })
          .from(employee)
          .innerJoin(
            employeeAttendance,
            and(
              eq(employee.id, employeeAttendance.employeeId),
              sql`${employeeAttendance.date}::date = ${targetDate}::date`,
            ),
          )
          .innerJoin(
            employeeAttendanceType,
            eq(
              employeeAttendance.id,
              employeeAttendanceType.employeeAttendanceId,
            ),
          )
          .innerJoin(
            attendance,
            and(
              eq(employeeAttendanceType.attendanceId, attendance.id),
              inArray(attendance.code, attendanceCodes),
            ),
          )
          .where(eq(employee.salesIncentiveTypeId, incentiveTypeId));

        return result[0]?.count ?? 0;
      };

      const calculateTotalStaff = async (incentiveTypeId: string) => {
        const result = await db
          .select({ count: count() })
          .from(employee)
          .where(eq(employee.salesIncentiveTypeId, incentiveTypeId));

        return result[0]?.count ?? 0;
      };

      // Run all 4 count queries in parallel
      const [
        totalStaffPresentIn94Percent,
        totalStaffAbsentIn94Percent,
        totalStaffPresentIn6Percent,
        totalStaffAbsentIn6Percent,
        totalStaff94InPercent,
        totalStaff6InPercent,
      ] = await Promise.all([
        countEmployeesByAttendance(
          salesIncentiveType94.id,
          presentAttendanceCodes,
        ),
        countEmployeesByAttendance(
          salesIncentiveType94.id,
          absentAttendanceCodes,
        ),
        countEmployeesByAttendance(
          salesIncentiveType6.id,
          presentAttendanceCodes,
        ),
        countEmployeesByAttendance(
          salesIncentiveType6.id,
          absentAttendanceCodes,
        ),
        calculateTotalStaff(salesIncentiveType94.id),
        calculateTotalStaff(salesIncentiveType6.id),
      ]);

      const totalIncentive94Percent =
        totalStaffPresentIn94Percent > 0
          ? (totalIncentive * 0.94) / totalStaffPresentIn94Percent
          : 0;
      const totalIncentive6Percent =
        totalStaffPresentIn6Percent > 0
          ? (totalIncentive * 0.06) / totalStaffPresentIn6Percent
          : 0;

      const totalSalesIncentiveFor94Percent =
        totalStaffPresentIn94Percent > 0
          ? totalIncentive94Percent * totalStaffPresentIn94Percent
          : 0;
      const totalSalesIncentiveFor6Percent =
        totalStaffPresentIn6Percent > 0
          ? totalIncentive6Percent * totalStaffPresentIn6Percent
          : 0;

      const totalSalesIncentive =
        totalSalesIncentiveFor94Percent + totalSalesIncentiveFor6Percent;

      if (totalStaffPresentIn94Percent > 0 && totalStaffPresentIn6Percent > 0) {
        if (Math.round(totalSalesIncentive) !== Math.round(totalIncentive)) {
          throw new ORPCError("BAD_REQUEST", {
            data: {
              success: false,
              message:
                "Total sales incentive does not match total incentive. Some calculations are incorrect.",
            },
          });
        }
      }

      await db.insert(salesIncentives).values({
        date: new Date(date),
        gold4PerGmAmount,
        goldCoin1PerGmAmount,
        diamond500PerCtAmount,
        silverAntique4PerGmAmount,
        silverPerGmAmount,
        totalIncentive,
        totalIncentive94Percent,
        totalIncentive6Percent,
        totalSalesIncentiveFor94Percent,
        totalSalesIncentiveFor6Percent,
        totalStaff94InPercent,
        totalStaff6InPercent,
        totalStaffPresentIn94Percent,
        totalStaffPresentIn6Percent,
        totalStaffAbsentIn94Percent,
        totalStaffAbsentIn6Percent,
      });
      return {
        success: true,
        message: "Sales incentive created successfully",
      };
    },
  );

const updateSalesIncentive = protectedProcedure
  .route({
    path: "/update",
    method: "PUT",
    summary: "Update sales incentive",
    description: "Update sales incentive amounts (date cannot be changed)",
  })
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        coinAmountPerGM: z.number().optional(),
        goldAmountPerGM: z.number().optional(),
        diamondAmountPerCT: z.number().optional(),
        silverAntiqueAmountPerGM: z.number().optional(),
        silverAmountPerGM: z.number().optional(),
      }),
    }),
  )
  .output(z.object({ success: z.boolean(), message: z.string() }).nullish())
  .handler(async ({ input: { id, data } }) => {
    try {
      // Check if sales incentive exists and get the date
      const [existingRecord] = await db
        .select()
        .from(salesIncentives)
        .where(eq(salesIncentives.id, id))
        .limit(1);

      if (!existingRecord) {
        throw new ORPCError("NOT_FOUND", {
          data: {
            success: false,
            message: "Sales incentive not found",
          },
        });
      }

      // Get the date from existing record (date cannot be changed)
      const date = existingRecord.date;

      // Calculate new amounts based on provided data or use existing values
      const goldAmountPerGM =
        data.goldAmountPerGM ?? existingRecord.gold4PerGmAmount / 4;
      const coinAmountPerGM =
        data.coinAmountPerGM ?? existingRecord.goldCoin1PerGmAmount / 1;
      const diamondAmountPerCT =
        data.diamondAmountPerCT ?? existingRecord.diamond500PerCtAmount / 500;
      const silverAntiqueAmountPerGM =
        data.silverAntiqueAmountPerGM ??
        existingRecord.silverAntique4PerGmAmount / 4;
      const silverAmountPerGM =
        data.silverAmountPerGM ?? existingRecord.silverPerGmAmount / 0.3;

      // Recalculate all amounts
      const gold4PerGmAmount = goldAmountPerGM * 4;
      const goldCoin1PerGmAmount = coinAmountPerGM * 1;
      const diamond500PerCtAmount = diamondAmountPerCT * 500;
      const silverAntique4PerGmAmount = silverAntiqueAmountPerGM * 4;
      const silverPerGmAmount = silverAmountPerGM * 0.3;

      const totalIncentive =
        gold4PerGmAmount +
        goldCoin1PerGmAmount +
        diamond500PerCtAmount +
        silverAntique4PerGmAmount +
        silverPerGmAmount;

      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      // Fetch both sales incentive types in parallel
      const [salesIncentiveType94, salesIncentiveType6] = await Promise.all([
        db.query.salesIncentiveType.findFirst({
          where: eq(salesIncentiveType.name, "94% Incentive"),
        }),
        db.query.salesIncentiveType.findFirst({
          where: eq(salesIncentiveType.name, "6% Incentive"),
        }),
      ]);

      if (!salesIncentiveType94) {
        throw new ORPCError("BAD_REQUEST", {
          data: {
            success: false,
            message: "94% incentive type not found",
          },
        });
      }

      if (!salesIncentiveType6) {
        throw new ORPCError("BAD_REQUEST", {
          data: {
            success: false,
            message: "6% incentive type not found",
          },
        });
      }

      // Helper function to count employees by incentive type and attendance codes
      const countEmployeesByAttendance = async (
        incentiveTypeId: string,
        attendanceCodes: string[],
      ) => {
        const result = await db
          .select({ count: count() })
          .from(employee)
          .innerJoin(
            employeeAttendance,
            and(
              eq(employee.id, employeeAttendance.employeeId),
              sql`${employeeAttendance.date}::date = ${targetDate}::date`,
            ),
          )
          .innerJoin(
            employeeAttendanceType,
            eq(
              employeeAttendance.id,
              employeeAttendanceType.employeeAttendanceId,
            ),
          )
          .innerJoin(
            attendance,
            and(
              eq(employeeAttendanceType.attendanceId, attendance.id),
              inArray(attendance.code, attendanceCodes),
            ),
          )
          .where(eq(employee.salesIncentiveTypeId, incentiveTypeId));

        return result[0]?.count ?? 0;
      };

      const calculateTotalStaff = async (incentiveTypeId: string) => {
        const result = await db
          .select({ count: count() })
          .from(employee)
          .where(eq(employee.salesIncentiveTypeId, incentiveTypeId));

        return result[0]?.count ?? 0;
      };

      // Run all 4 count queries in parallel
      const [
        totalStaffPresentIn94Percent,
        totalStaffAbsentIn94Percent,
        totalStaffPresentIn6Percent,
        totalStaffAbsentIn6Percent,
        totalStaff94InPercent,
        totalStaff6InPercent,
      ] = await Promise.all([
        countEmployeesByAttendance(
          salesIncentiveType94.id,
          presentAttendanceCodes,
        ),
        countEmployeesByAttendance(
          salesIncentiveType94.id,
          absentAttendanceCodes,
        ),
        countEmployeesByAttendance(
          salesIncentiveType6.id,
          presentAttendanceCodes,
        ),
        countEmployeesByAttendance(
          salesIncentiveType6.id,
          absentAttendanceCodes,
        ),
        calculateTotalStaff(salesIncentiveType94.id),
        calculateTotalStaff(salesIncentiveType6.id),
      ]);

      const totalIncentive94Percent =
        totalStaffPresentIn94Percent > 0
          ? (totalIncentive * 0.94) / totalStaffPresentIn94Percent
          : 0;
      const totalIncentive6Percent =
        totalStaffPresentIn6Percent > 0
          ? (totalIncentive * 0.06) / totalStaffPresentIn6Percent
          : 0;

      const totalSalesIncentiveFor94Percent =
        totalStaffPresentIn94Percent > 0
          ? totalIncentive94Percent * totalStaffPresentIn94Percent
          : 0;
      const totalSalesIncentiveFor6Percent =
        totalStaffPresentIn6Percent > 0
          ? totalIncentive6Percent * totalStaffPresentIn6Percent
          : 0;
      const totalSalesIncentive =
        totalSalesIncentiveFor94Percent + totalSalesIncentiveFor6Percent;

      if (totalStaffPresentIn94Percent > 0 && totalStaffPresentIn6Percent > 0) {
        if (Math.round(totalSalesIncentive) !== Math.round(totalIncentive)) {
          throw new ORPCError("BAD_REQUEST", {
            data: {
              success: false,
              message:
                "Total sales incentive does not match total incentive. Some calculations are incorrect.",
            },
          });
        }
      }

      // Update the record with recalculated values
      await db
        .update(salesIncentives)
        .set({
          gold4PerGmAmount,
          goldCoin1PerGmAmount,
          diamond500PerCtAmount,
          silverAntique4PerGmAmount,
          silverPerGmAmount,
          totalIncentive,
          totalIncentive94Percent,
          totalIncentive6Percent,
          totalSalesIncentiveFor94Percent,
          totalSalesIncentiveFor6Percent,
          totalStaff94InPercent,
          totalStaff6InPercent,
          totalStaffPresentIn94Percent,
          totalStaffPresentIn6Percent,
          totalStaffAbsentIn94Percent,
          totalStaffAbsentIn6Percent,
        })
        .where(eq(salesIncentives.id, id));

      return {
        success: true,
        message: "Successfully updated sales incentive",
      };
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        data: {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to update sales incentive",
        },
      });
    }
  });

const getSalesIncentives = protectedProcedure
  .route({
    path: "/",
    method: "GET",
    summary: "Get sales incentives",
    description: "Get sales incentives with filters and pagination",
  })
  .input(
    z
      .object({
        filter: z
          .object({
            date: z
              .object({
                startDate: z.iso.datetime(),
                endDate: z.iso.datetime(),
              })
              .nullish(),
            totalIncentive: z
              .object({
                min: z.number().optional(),
                max: z.number().optional(),
              })
              .nullish(),
          })
          .nullish(),
        pagination: z
          .object({
            page: z.number().optional(),
            limit: z.number().optional(),
          })
          .nullish(),
      })
      .nullish(),
  )
  .output(
    z
      .object({
        data: z.array(
          z.object({
            id: z.string(),
            date: z.date(),
            gold4PerGmAmount: z.number(),
            goldCoin1PerGmAmount: z.number(),
            diamond500PerCtAmount: z.number(),
            silverAntique4PerGmAmount: z.number(),
            silverPerGmAmount: z.number(),
            totalIncentive: z.number(),
            totalIncentive94Percent: z.number(),
            totalIncentive6Percent: z.number(),
            totalSalesIncentiveFor94Percent: z.number(),
            totalSalesIncentiveFor6Percent: z.number(),
            totalStaff94InPercent: z.number(),
            totalStaff6InPercent: z.number(),
            totalStaffPresentIn94Percent: z.number(),
            totalStaffPresentIn6Percent: z.number(),
            totalStaffAbsentIn94Percent: z.number(),
            totalStaffAbsentIn6Percent: z.number(),
          }),
        ),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      })
      .nullish(),
  )
  .handler(async ({ input }) => {
    try {
      const filter = input?.filter;
      const pagination = input?.pagination;

      // Build filter conditions
      const filterConditions = [];

      // Date range filter
      if (filter?.date?.startDate && filter?.date?.endDate) {
        filterConditions.push(
          gte(salesIncentives.date, new Date(filter.date.startDate)),
        );
        filterConditions.push(
          lte(salesIncentives.date, new Date(filter.date.endDate)),
        );
      } else if (filter?.date?.startDate) {
        filterConditions.push(
          gte(salesIncentives.date, new Date(filter.date.startDate)),
        );
      } else if (filter?.date?.endDate) {
        filterConditions.push(
          lte(salesIncentives.date, new Date(filter.date.endDate)),
        );
      }

      // Total incentive range filter
      if (filter?.totalIncentive?.min !== undefined) {
        filterConditions.push(
          gte(salesIncentives.totalIncentive, filter.totalIncentive.min),
        );
      }
      if (filter?.totalIncentive?.max !== undefined) {
        filterConditions.push(
          lte(salesIncentives.totalIncentive, filter.totalIncentive.max),
        );
      }

      const whereConditions =
        filterConditions.length > 0 ? and(...filterConditions) : undefined;

      // Get sales incentives
      const records = await db
        .select()
        .from(salesIncentives)
        .where(whereConditions)
        .orderBy(sql`${salesIncentives.date} DESC`)
        .limit(pagination?.limit ?? 10)
        .offset(((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10));

      // Get total count
      const total = await db
        .select({ count: count() })
        .from(salesIncentives)
        .where(whereConditions);

      return {
        data: records.map((record) => ({
          id: record.id,
          date: record.date,
          gold4PerGmAmount: record.gold4PerGmAmount,
          goldCoin1PerGmAmount: record.goldCoin1PerGmAmount,
          diamond500PerCtAmount: record.diamond500PerCtAmount,
          silverAntique4PerGmAmount: record.silverAntique4PerGmAmount,
          silverPerGmAmount: record.silverPerGmAmount,
          totalIncentive: record.totalIncentive,
          totalIncentive94Percent: record.totalIncentive94Percent,
          totalIncentive6Percent: record.totalIncentive6Percent,
          totalSalesIncentiveFor94Percent:
            record.totalSalesIncentiveFor94Percent,
          totalSalesIncentiveFor6Percent: record.totalSalesIncentiveFor6Percent,
          totalStaff94InPercent: record.totalStaff94InPercent,
          totalStaff6InPercent: record.totalStaff6InPercent,
          totalStaffPresentIn94Percent: record.totalStaffPresentIn94Percent,
          totalStaffPresentIn6Percent: record.totalStaffPresentIn6Percent,
          totalStaffAbsentIn94Percent: record.totalStaffAbsentIn94Percent,
          totalStaffAbsentIn6Percent: record.totalStaffAbsentIn6Percent,
        })),
        total: total[0].count,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 10,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Failed to get sales incentives",
        });
      }
    }
  });

const getEmployeesForSalesIncentive = protectedProcedure
  .route({
    path: "/:id/employees",
    method: "GET",
    summary: "Get employees for sales incentive",
    description: "Get employees for sales incentive based on date and filters",
  })
  .input(
    z.object({
      id: z.string(),
      pagination: z
        .object({ page: z.number().optional(), limit: z.number().optional() })
        .optional(),
      filter: z
        .object({
          salesIncentiveTypeIds: z.string().array().optional(),
          present: z.boolean().optional(),
          absent: z.boolean().optional(),
        })
        .optional(),
    }),
  )
  .output(
    z
      .object({
        data: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(),
            salesIncentiveTypeId: z.string().nullish(),
            salesIncentiveTypeName: z.string().nullish(),
          }),
        ),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      })
      .nullish(),
  )
  .handler(async ({ input: { id, pagination, filter } }) => {
    try {
      // Fetch the sales incentive to get the date
      const [salesIncentive] = await db
        .select()
        .from(salesIncentives)
        .where(eq(salesIncentives.id, id))
        .limit(1);

      if (!salesIncentive) {
        throw new ORPCError("NOT_FOUND", {
          data: {
            success: false,
            message: "Sales incentive not found",
          },
        });
      }

      const targetDate = new Date(salesIncentive.date);
      targetDate.setHours(0, 0, 0, 0);

      // Determine which attendance codes to filter by
      let attendanceCodesToFilter: string[] | undefined;
      if (filter?.present === true && filter?.absent === true) {
        // If both are true, include all attendance codes
        attendanceCodesToFilter = [
          ...presentAttendanceCodes,
          ...absentAttendanceCodes,
        ];
      } else if (filter?.present === true) {
        attendanceCodesToFilter = presentAttendanceCodes;
      } else if (filter?.absent === true) {
        attendanceCodesToFilter = absentAttendanceCodes;
      }

      // Early return if no attendance filter and no salesIncentiveTypeIds filter
      if (!attendanceCodesToFilter && !filter?.salesIncentiveTypeIds) {
        // Return all employees
        const employeeQuery = db
          .select({
            id: employee.id,
            name: user.name,
            email: user.email,
            salesIncentiveTypeId: employee.salesIncentiveTypeId,
            salesIncentiveTypeName: salesIncentiveType.name,
          })
          .from(employee)
          .innerJoin(user, eq(employee.userId, user.id))
          .leftJoin(
            salesIncentiveType,
            eq(employee.salesIncentiveTypeId, salesIncentiveType.id),
          );

        const totalCountQuery = db.select({ count: count() }).from(employee);

        const [totalResult] = await totalCountQuery;
        const total = totalResult?.count ?? 0;

        const records = await employeeQuery
          .limit(pagination?.limit ?? 10)
          .offset(((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10));

        return {
          data: records.map((record) => ({
            id: record.id,
            name: record.name || "Unknown",
            email: record.email || "Unknown",
            salesIncentiveTypeId: record.salesIncentiveTypeId,
            salesIncentiveTypeName: record.salesIncentiveTypeName,
          })),
          total,
          page: pagination?.page ?? 1,
          limit: pagination?.limit ?? 10,
        };
      }

      // Build filter conditions
      const filterConditions = [];

      // Sales incentive type filter
      if (
        filter?.salesIncentiveTypeIds &&
        filter.salesIncentiveTypeIds.length > 0
      ) {
        filterConditions.push(
          inArray(employee.salesIncentiveTypeId, filter.salesIncentiveTypeIds),
        );
      }

      // Query employees with attendance join when attendance filter is needed
      if (attendanceCodesToFilter) {
        const employeeQuery = db
          .select({
            id: employee.id,
            name: user.name,
            email: user.email,
            salesIncentiveTypeId: employee.salesIncentiveTypeId,
            salesIncentiveTypeName: salesIncentiveType.name,
          })
          .from(employee)
          .innerJoin(user, eq(employee.userId, user.id))
          .leftJoin(
            salesIncentiveType,
            eq(employee.salesIncentiveTypeId, salesIncentiveType.id),
          )
          .innerJoin(
            employeeAttendance,
            and(
              eq(employee.id, employeeAttendance.employeeId),
              sql`${employeeAttendance.date}::date = ${targetDate}::date`,
            ),
          )
          .innerJoin(
            employeeAttendanceType,
            eq(
              employeeAttendance.id,
              employeeAttendanceType.employeeAttendanceId,
            ),
          )
          .innerJoin(
            attendance,
            and(
              eq(employeeAttendanceType.attendanceId, attendance.id),
              inArray(attendance.code, attendanceCodesToFilter),
            ),
          );

        // Apply sales incentive type filter if provided
        if (filterConditions.length > 0) {
          employeeQuery.where(and(...filterConditions));
        }

        // Get total count
        const totalCountQuery = db
          .select({ count: count() })
          .from(employee)
          .innerJoin(
            employeeAttendance,
            and(
              eq(employee.id, employeeAttendance.employeeId),
              sql`${employeeAttendance.date}::date = ${targetDate}::date`,
            ),
          )
          .innerJoin(
            employeeAttendanceType,
            eq(
              employeeAttendance.id,
              employeeAttendanceType.employeeAttendanceId,
            ),
          )
          .innerJoin(
            attendance,
            and(
              eq(employeeAttendanceType.attendanceId, attendance.id),
              inArray(attendance.code, attendanceCodesToFilter),
            ),
          );

        if (filterConditions.length > 0) {
          totalCountQuery.where(and(...filterConditions));
        }

        const [totalResult] = await totalCountQuery;
        const total = totalResult?.count ?? 0;

        // Get paginated results
        const records = await employeeQuery
          .limit(pagination?.limit ?? 10)
          .offset(((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10));

        return {
          data: records.map((record) => ({
            id: record.id,
            name: record.name || "Unknown",
            email: record.email || "Unknown",
            salesIncentiveTypeId: record.salesIncentiveTypeId,
            salesIncentiveTypeName: record.salesIncentiveTypeName,
          })),
          total,
          page: pagination?.page ?? 1,
          limit: pagination?.limit ?? 10,
        };
      }

      // If only salesIncentiveTypeIds filter is provided (no attendance filter)
      const employeeQuery = db
        .select({
          id: employee.id,
          name: user.name,
          email: user.email,
          salesIncentiveTypeId: employee.salesIncentiveTypeId,
          salesIncentiveTypeName: salesIncentiveType.name,
        })
        .from(employee)
        .innerJoin(user, eq(employee.userId, user.id))
        .leftJoin(
          salesIncentiveType,
          eq(employee.salesIncentiveTypeId, salesIncentiveType.id),
        );

      if (filterConditions.length > 0) {
        employeeQuery.where(and(...filterConditions));
      }

      // Get total count
      const totalCountQuery = db.select({ count: count() }).from(employee);

      if (filterConditions.length > 0) {
        totalCountQuery.where(and(...filterConditions));
      }

      const [totalResult] = await totalCountQuery;
      const total = totalResult?.count ?? 0;

      // Get paginated results
      const records = await employeeQuery
        .limit(pagination?.limit ?? 10)
        .offset(((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10));

      return {
        data: records.map((record) => ({
          id: record.id,
          name: record.name || "Unknown",
          email: record.email || "Unknown",
          salesIncentiveTypeId: record.salesIncentiveTypeId,
          salesIncentiveTypeName: record.salesIncentiveTypeName,
        })),
        total,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 10,
      };
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        data: {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to get employees for sales incentive",
        },
      });
    }
  });

const saleIncentiveRoute = protectedProcedure
  .prefix("/sales")
  .tag("Sales Incentive")
  .router({
    createSalesIncentive,
    updateSalesIncentive,
    getSalesIncentives,
    getEmployeesForSalesIncentive,
  });

export { saleIncentiveRoute };
