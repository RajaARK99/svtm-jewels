import { ORPCError } from "@orpc/server";
import { and, count, eq, gte, inArray, lte, sql } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { employee } from "@/db/schema/employee";
import {
  employeeAttendance,
  employeeAttendanceType,
} from "@/db/schema/attendance";
import { attendance } from "@/db/schema/options";
import { convertingIncentives } from "@/db/schema/incentives/converting";
import { salesIncentives } from "@/db/schema/incentives/sales";
import { protectedProcedure } from "@/lib/orpc";

// Present attendance codes: P, WFH, OD, WOH, P(NS), P(MS)
const presentAttendanceCodes = ["P", "WFH", "OD", "WOH", "P(NS)", "P(MS)"];

const getDashboardStats = protectedProcedure
  .route({
    path: "/stats",
    method: "GET",
    tags: ["Dashboard"],
    summary: "Get dashboard statistics",
    description:
      "Get users count, employee count, attendance percentage, and incentive totals",
  })
  .input(
    z
      .object({
        startDate: z.iso.date().optional(),
        endDate: z.iso.date().optional(),
      })
      .optional(),
  )
  .output(
    z.object({
      usersCount: z.number(),
      employeeCount: z.number(),
      attendancePercentage: z.number().nullable(),
      totalConvertingIncentiveAmount: z.number(),
      totalSalesIncentiveAmount: z.number(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      // Get users count
      const [usersCountResult] = await db
        .select({ count: count() })
        .from(user);

      // Get employee count
      const [employeeCountResult] = await db
        .select({ count: count() })
        .from(employee);

      const usersCount = usersCountResult?.count ?? 0;
      const employeeCount = employeeCountResult?.count ?? 0;

      // Calculate attendance percentage if date range is provided
      let attendancePercentage: number | null = null;
      if (input?.startDate && input?.endDate) {
        const startDate = new Date(input.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(input.endDate);
        endDate.setHours(23, 59, 59, 999);

        // Get all employees
        const allEmployees = await db.query.employee.findMany({
          columns: { id: true },
        });

        if (allEmployees.length > 0) {
          // Calculate total working days in the date range
          const totalWorkingDays = Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          ) + 1;

          // Get present attendance records for the date range
          const presentAttendanceRecords = await db
            .select({
              employeeId: employeeAttendance.employeeId,
              date: employeeAttendance.date,
            })
            .from(employeeAttendance)
            .innerJoin(
              employeeAttendanceType,
              eq(
                employeeAttendanceType.employeeAttendanceId,
                employeeAttendance.id,
              ),
            )
            .innerJoin(
              attendance,
              eq(employeeAttendanceType.attendanceId, attendance.id),
            )
            .where(
              and(
                gte(employeeAttendance.date, startDate),
                lte(employeeAttendance.date, endDate),
                inArray(attendance.code, presentAttendanceCodes),
              ),
            );

          // Count unique employee-date combinations (present days)
          const presentDaysCount = new Set(
            presentAttendanceRecords.map(
              (r) => `${r.employeeId}-${r.date.toISOString().split("T")[0]}`,
            ),
          ).size;

          // Calculate total expected attendance days
          const totalExpectedDays = allEmployees.length * totalWorkingDays;

          // Calculate attendance percentage
          if (totalExpectedDays > 0) {
            attendancePercentage =
              (presentDaysCount / totalExpectedDays) * 100;
          }
        }
      }

      // Calculate total converting incentive amount
      let totalConvertingIncentiveAmount = 0;
      if (input?.startDate && input?.endDate) {
        const startDate = new Date(input.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(input.endDate);
        endDate.setHours(23, 59, 59, 999);

        const [convertingResult] = await db
          .select({
            total: sql<number>`COALESCE(SUM(${convertingIncentives.amount}), 0)`,
          })
          .from(convertingIncentives)
          .where(
            and(
              gte(convertingIncentives.date, startDate),
              lte(convertingIncentives.date, endDate),
            ),
          );

        totalConvertingIncentiveAmount =
          Number(convertingResult?.total) ?? 0;
      } else {
        // If no date range, get all converting incentives
        const [convertingResult] = await db
          .select({
            total: sql<number>`COALESCE(SUM(${convertingIncentives.amount}), 0)`,
          })
          .from(convertingIncentives);

        totalConvertingIncentiveAmount = Number(convertingResult?.total) ?? 0;
      }

      // Calculate total sales incentive amount
      let totalSalesIncentiveAmount = 0;
      if (input?.startDate && input?.endDate) {
        const startDate = new Date(input.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(input.endDate);
        endDate.setHours(23, 59, 59, 999);

        const [salesResult] = await db
          .select({
            total: sql<number>`COALESCE(SUM(${salesIncentives.totalIncentive}), 0)`,
          })
          .from(salesIncentives)
          .where(
            and(
              gte(salesIncentives.date, startDate),
              lte(salesIncentives.date, endDate),
            ),
          );

        totalSalesIncentiveAmount = Number(salesResult?.total) ?? 0;
      } else {
        // If no date range, get all sales incentives
        const [salesResult] = await db
          .select({
            total: sql<number>`COALESCE(SUM(${salesIncentives.totalIncentive}), 0)`,
          })
          .from(salesIncentives);

        totalSalesIncentiveAmount = Number(salesResult?.total) ?? 0;
      }

      return {
        usersCount,
        employeeCount,
        attendancePercentage,
        totalConvertingIncentiveAmount,
        totalSalesIncentiveAmount,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error.message,
          data: {
            success: false,
            message: error.message,
          },
        });
      }
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch dashboard statistics",
        data: {
          success: false,
          message: "Failed to fetch dashboard statistics",
        },
      });
    }
  });

const dashboardRouter = protectedProcedure
  .prefix("/dashboard")
  .tag("Dashboard")
  .router({
    getDashboardStats,
  });

export { dashboardRouter };

