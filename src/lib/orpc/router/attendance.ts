import { ORPCError } from "@orpc/server";
import { and, count, eq, gte, inArray, lte } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
  employeeAttendance,
  employeeAttendanceSelectSchema,
  employeeAttendanceType,
} from "@/db/schema";
import { protectedProcedure } from "@/lib/orpc";

const attendanceSchema = employeeAttendanceSelectSchema.extend({
  employee: z
    .object({
      id: z.string(),
      userId: z.string(),
      user: z
        .object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
        })
        .nullish(),
    })
    .nullish(),
  attendanceTypes: z
    .array(
      z.object({
        id: z.string(),
        attendanceId: z.string(),
        attendance: z
          .object({
            id: z.string(),
            name: z.string(),
            code: z.string(),
          })
          .nullish(),
      }),
    )
    .nullish(),
});

export type Attendance = z.infer<typeof attendanceSchema>;

const createAttendance = protectedProcedure
  .route({
    path: "/create",
    method: "POST",
    summary: "Create attendance records for multiple employees",
    description:
      "Create attendance records for multiple employees with their attendance types",
  })
  .input(
    z.object({
      date: z.iso.datetime(),
      data: z
        .object({
          employeeId: z.string(),
          attendanceIds: z.array(z.string()).min(1),
        })
        .array()
        .min(1),
    }),
  )
  .output(
    z
      .object({
        success: z.boolean(),
        message: z.string(),
      })
      .nullish(),
  )
  .handler(async ({ input: { date, data } }) => {
    try {
      const attendanceDate = new Date(date);
      const attendanceRecords = [];
      const attendanceTypesToInsert = [];

      // Process each employee - insert attendance records first
      for (const item of data) {
        // Insert attendance record for this employee
        const [attendanceRecord] = await db
          .insert(employeeAttendance)
          .values({
            employeeId: item.employeeId,
            date: attendanceDate,
          })
          .returning();

        attendanceRecords.push(attendanceRecord);

        // Prepare attendance types for batch insert
        attendanceTypesToInsert.push(
          ...item.attendanceIds.map((attendanceId) => ({
            employeeAttendanceId: attendanceRecord.id,
            attendanceId,
          })),
        );
      }

      // Insert all attendance types in batch
      if (attendanceTypesToInsert.length > 0) {
        await db.insert(employeeAttendanceType).values(attendanceTypesToInsert);
      }

      return {
        success: true,
        message: `Successfully created attendance records for ${data.length} employee(s)`,
      };
    } catch (error) {
      console.log({ error });

      throw new ORPCError("BAD_REQUEST", {
        data: {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to create attendance",
        },
      });
    }
  });

const getAttendance = protectedProcedure
  .route({
    path: "/get",
    method: "GET",
    summary: "Get attendance records",
    description: "Get attendance records",
  })
  .input(
    z
      .object({
        filter: z
          .object({
            date: z
              .object({
                startDate: z.iso.date(),
                endDate: z.iso.date(),
              })
              .nullish(),
            employeeIds: z.string().array().optional(),
            attendanceIds: z.string().array().optional(),
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
        data: z.array(attendanceSchema),
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
          gte(employeeAttendance.date, new Date(new Date(filter.date.startDate).setHours(0, 0, 0, 0))),
        );
        filterConditions.push(
          lte(employeeAttendance.date, new Date(new Date(filter.date.endDate).setHours(23, 59, 59, 999))),
        );
      } else if (filter?.date?.startDate) {
        filterConditions.push(
          gte(employeeAttendance.date, new Date(new Date(filter.date.startDate).setHours(0, 0, 0, 0))),
        );
      } else if (filter?.date?.endDate) {
        filterConditions.push(
          lte(employeeAttendance.date, new Date(new Date(filter.date.endDate).setHours(23, 59, 59, 999))),
        );
      }

      // Employee IDs filter
      if (filter?.employeeIds && filter.employeeIds.length > 0) {
        filterConditions.push(
          inArray(employeeAttendance.employeeId, filter.employeeIds),
        );
      }

      const whereConditions =
        filterConditions.length > 0 ? and(...filterConditions) : undefined;

      // Get attendance records with relations
      const attendanceRecords = await db.query.employeeAttendance.findMany({
        where: whereConditions,
        with: {
          employee: {
            columns: {
              id: true,
              userId: true,
            },
            with: {
              user: {
                columns: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          attendanceTypes: {
            with: {
              attendance: {
                columns: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
        limit: pagination?.limit ?? 10,
        offset: ((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10),
      });

      // Filter by attendanceIds if provided
      let filteredRecords = attendanceRecords;
      if (filter?.attendanceIds && filter.attendanceIds.length > 0) {
        filteredRecords = attendanceRecords.filter((record) =>
          record.attendanceTypes?.some((at) =>
            filter.attendanceIds?.includes(at.attendanceId),
          ),
        );
      }

      // Get total count
      let totalCount: number;
      if (filter?.attendanceIds && filter.attendanceIds.length > 0) {
        // If filtering by attendanceIds, count the filtered results
        totalCount = filteredRecords.length;
      } else {
        // Otherwise, count from database
        const total = await db
          .select({ count: count() })
          .from(employeeAttendance)
          .where(whereConditions);
        totalCount = total[0].count;
      }

      return {
        data: filteredRecords,
        total: totalCount,
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 10,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Failed to get attendance",
        });
      }
    }
  });

const updateAttendance = protectedProcedure
  .route({
    path: "/update",
    method: "PUT",
    summary: "Update attendance records",
    description: "Update attendance types for an attendance record",
  })
  .input(
    z.object({
      id: z.string(),
      data: z.object({ attendanceIds: z.array(z.string()).min(1) }),
    }),
  )
  .output(z.object({ success: z.boolean(), message: z.string() }).nullish())
  .handler(async ({ input: { id, data } }) => {
    try {
      // Check if attendance record exists
      const [attendanceRecord] = await db
        .select()
        .from(employeeAttendance)
        .where(eq(employeeAttendance.id, id))
        .limit(1);

      if (!attendanceRecord) {
        throw new ORPCError("NOT_FOUND", {
          message: "Attendance record not found",
        });
      }

      // Delete existing attendance types
      await db
        .delete(employeeAttendanceType)
        .where(eq(employeeAttendanceType.employeeAttendanceId, id));

      // Insert new attendance types
      await db.insert(employeeAttendanceType).values(
        data.attendanceIds.map((attendanceId) => ({
          employeeAttendanceId: id,
          attendanceId,
        })),
      );

      return {
        success: true,
        message: "Successfully updated attendance record",
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Failed to update attendance",
        });
      }
    }
  });

const attendanceRouter = protectedProcedure
  .prefix("/attendance")
  .tag("Attendance")
  .router({
    createAttendance,
    getAttendance,
    updateAttendance,
  });

export { attendanceRouter };
