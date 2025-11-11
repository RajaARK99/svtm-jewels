import { Buffer } from "node:buffer";
import { ORPCError } from "@orpc/server";
import { and, count, eq, gte, inArray, lte, sql } from "drizzle-orm";
import * as XLSX from "xlsx";
import z from "zod";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { employee } from "@/db/schema/employee";
import { convertingIncentives } from "@/db/schema/incentives/converting";
import { convertingType } from "@/db/schema/options";
import { protectedProcedure } from "@/lib/orpc";

const convertingIncentiveSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  type: z.object({
    id: z.string().nullable(),
    name: z.string().nullable(),
  }),
  weight: z.number(),
  visit: z.number(),
  amount: z.number(),
  date: z.date(),
  employeeId: z.string(),
});

export type ConvertingIncentive = z.infer<typeof convertingIncentiveSchema>;

const createConvertingIncentive = protectedProcedure
  .route({
    path: "/create",
    method: "POST",
    summary: "Create converting incentive",
    description: "Create converting incentive",
  })
  .input(
    z.object({
      employeeId: z.string(),
      date: z.iso.datetime(),
      typeId: z.string(),
      weight: z.number(),
      visit: z.number(),
      amount: z.number(),
    }),
  )
  .output(z.object({ success: z.boolean(), message: z.string() }).nullish())
  .handler(async ({ input }) => {
    try {
      // Validate and convert to integers (ensure they're valid numbers)
      const weight = Number.isFinite(input.weight)
        ? Math.floor(input.weight)
        : 0;
      const visit = Number.isFinite(input.visit) ? Math.floor(input.visit) : 0;
      const amount = Number.isFinite(input.amount)
        ? Math.floor(input.amount)
        : 0;

      await db.insert(convertingIncentives).values({
        employeeId: input.employeeId,
        date: new Date(input.date),
        typeId: input.typeId,
        weight,
        visit,
        amount,
      });
      return {
        success: true,
        message: "Converting incentive created successfully",
      };
    } catch (error) {
      console.error("Error creating converting incentive:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Failed to create converting incentive";
      throw new ORPCError("BAD_REQUEST", {
        data: {
          success: false,
          message: errorMessage,
        },
      });
    }
  });

const getConvertingIncentives = protectedProcedure
  .route({
    path: "/get",
    method: "GET",
    summary: "Get converting incentives",
    description: "Get converting incentives with filters and pagination",
  })
  .input(
    z
      .object({
        filter: z
          .object({
            employeeIds: z.string().array().optional(),
            date: z
              .object({
                startDate: z.iso.date(),
                endDate: z.iso.date(),
              })
              .nullish(),
            typeIds: z.string().array().optional(),
            amount: z
              .object({
                min: z.number().optional(),
                max: z.number().optional(),
              })
              .nullish(),
            weight: z
              .object({
                min: z.number().optional(),
                max: z.number().optional(),
              })
              .nullish(),
            visit: z
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
        data: z.array(convertingIncentiveSchema),
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
          gte(
            convertingIncentives.date,
            new Date(new Date(filter.date.startDate).setHours(0, 0, 0, 0)),
          ),
        );
        filterConditions.push(
          lte(
            convertingIncentives.date,
            new Date(new Date(filter.date.endDate).setHours(23, 59, 59, 999)),
          ),
        );
      } else if (filter?.date?.startDate) {
        filterConditions.push(
          gte(
            convertingIncentives.date,
            new Date(new Date(filter.date.startDate).setHours(0, 0, 0, 0)),
          ),
        );
      } else if (filter?.date?.endDate) {
        filterConditions.push(
          lte(
            convertingIncentives.date,
            new Date(new Date(filter.date.endDate).setHours(23, 59, 59, 999)),
          ),
        );
      }

      // Employee IDs filter
      if (filter?.employeeIds && filter.employeeIds.length > 0) {
        filterConditions.push(
          inArray(convertingIncentives.employeeId, filter.employeeIds),
        );
      }

      // Type IDs filter
      if (filter?.typeIds && filter.typeIds.length > 0) {
        filterConditions.push(
          inArray(convertingIncentives.typeId, filter.typeIds),
        );
      }

      // Amount range filter
      if (filter?.amount?.min !== undefined) {
        filterConditions.push(
          gte(convertingIncentives.amount, filter.amount.min),
        );
      }
      if (filter?.amount?.max !== undefined) {
        filterConditions.push(
          lte(convertingIncentives.amount, filter.amount.max),
        );
      }

      // Weight range filter
      if (filter?.weight?.min !== undefined) {
        filterConditions.push(
          gte(convertingIncentives.weight, filter.weight.min),
        );
      }
      if (filter?.weight?.max !== undefined) {
        filterConditions.push(
          lte(convertingIncentives.weight, filter.weight.max),
        );
      }

      // Visit range filter
      if (filter?.visit?.min !== undefined) {
        filterConditions.push(
          gte(convertingIncentives.visit, filter.visit.min),
        );
      }
      if (filter?.visit?.max !== undefined) {
        filterConditions.push(
          lte(convertingIncentives.visit, filter.visit.max),
        );
      }

      const whereConditions =
        filterConditions.length > 0 ? and(...filterConditions) : undefined;

      // Get converting incentives with joins
      const records = await db
        .select({
          id: convertingIncentives.id,
          weight: convertingIncentives.weight,
          visit: convertingIncentives.visit,
          amount: convertingIncentives.amount,
          date: convertingIncentives.date,
          userName: user.name,
          userEmail: user.email,
          typeName: convertingType.name,
          typeId: convertingType.id,
          employeeId: employee.id,
        })
        .from(convertingIncentives)
        .leftJoin(employee, eq(convertingIncentives.employeeId, employee.id))
        .leftJoin(user, eq(employee.userId, user.id))
        .leftJoin(
          convertingType,
          eq(convertingIncentives.typeId, convertingType.id),
        )
        .where(whereConditions)
        .limit(pagination?.limit ?? 10)
        .offset(((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10));

      // Get total count
      const total = await db
        .select({ count: count() })
        .from(convertingIncentives)
        .where(whereConditions);

      // Format response with required fields
      const formattedData = records.map((record) => ({
        id: record.id,
        name: record.userName || "Unknown",
        email: record.userEmail || "Unknown",
        type: {
          id: record.typeId,
          name: record.typeName,
        },
        weight: record.weight,
        visit: record.visit,
        amount: record.amount,
        date: record.date,
        employeeId: record.employeeId ?? "",
      }));

      return {
        data: formattedData,
        total: total[0].count,
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
              : "Failed to get converting incentives",
        },
      });
    }
  });

const updateConvertingIncentive = protectedProcedure
  .route({
    path: "/update",
    method: "PUT",
    summary: "Update converting incentive",
    description: "Update converting incentive fields",
  })
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        typeId: z.string().optional(),
        weight: z.number().optional(),
        visit: z.number().optional(),
        amount: z.number().optional(),
      }),
    }),
  )
  .output(z.object({ success: z.boolean(), message: z.string() }).nullish())
  .handler(async ({ input: { id, data } }) => {
    try {
      // Check if converting incentive exists
      const [record] = await db
        .select()
        .from(convertingIncentives)
        .where(eq(convertingIncentives.id, id))
        .limit(1);

      if (!record) {
        throw new ORPCError("NOT_FOUND", {
          data: {
            success: false,
            message: "Converting incentive not found",
          },
        });
      }

      // Build update object with only provided fields
      const updateData: {
        typeId?: string;
        weight?: number;
        visit?: number;
        amount?: number;
      } = {};

      if (data.typeId !== undefined) {
        updateData.typeId = data.typeId;
      }
      if (data.weight !== undefined) {
        // Ensure weight is an integer
        updateData.weight = Number.isFinite(data.weight)
          ? Math.floor(data.weight)
          : 0;
      }
      if (data.visit !== undefined) {
        // Ensure visit is an integer
        updateData.visit = Number.isFinite(data.visit)
          ? Math.floor(data.visit)
          : 0;
      }
      if (data.amount !== undefined) {
        // Ensure amount is an integer
        updateData.amount = Number.isFinite(data.amount)
          ? Math.floor(data.amount)
          : 0;
      }

      // Update the record
      await db
        .update(convertingIncentives)
        .set(updateData)
        .where(eq(convertingIncentives.id, id));

      return {
        success: true,
        message: "Successfully updated converting incentive",
      };
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        data: {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Failed to update converting incentive",
        },
      });
    }
  });

const getExcelFile = protectedProcedure
  .route({
    path: "/excel",
    method: "GET",
    summary: "Get excel file",
    description: "Get excel file",
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
          })
          .nullish(),
      })
      .nullish(),
  )
  .output(
    z
      .object({
        success: z.boolean(),
        message: z.string(),
        data: z.string(),
      })
      .nullish(),
  )
  .handler(async ({ input }) => {
    try {
      // Calculate date range
      let startDate: Date;
      let endDate: Date;

      if (input?.filter?.date?.startDate && input?.filter?.date?.endDate) {
        startDate = new Date(input.filter.date.startDate);
        endDate = new Date(input.filter.date.endDate);
      } else {
        // Use current month if no dates provided
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      // Set time boundaries
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      // Query converting incentives grouped by employee with sum of amounts
      const records = await db
        .select({
          employeeId: employee.id,
          employeeNumber: employee.employeeId,
          employeeName: user.name,
          totalAmount: sql<number>`COALESCE(SUM(${convertingIncentives.amount}), 0)`,
        })
        .from(convertingIncentives)
        .innerJoin(employee, eq(convertingIncentives.employeeId, employee.id))
        .innerJoin(user, eq(employee.userId, user.id))
        .where(
          and(
            gte(convertingIncentives.date, startDate),
            lte(convertingIncentives.date, endDate),
          ),
        )
        .groupBy(employee.id, employee.employeeId, user.name);

      if (records.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          data: {
            success: false,
            message: "No converting incentive records found",
          },
        });
      }

      // Format date range for display
      const formatDate = (date: Date) => {
        const day = date.getDate();
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
      };

      const dateRangeStr = `${formatDate(startDate)} - ${formatDate(endDate)}`;

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();

      // Prepare data for Excel
      const excelData: (string | number)[][] = [
        [`Converting Incentive ${dateRangeStr}`], // First row heading
        ["Employee Number", "Employee Name", "Amount"], // Second row headings
      ];

      // Add data rows
      records.forEach((record) => {
        excelData.push([
          record.employeeNumber ?? "",
          record.employeeName ?? "Unknown",
          Number(record.totalAmount) || 0,
        ]);
      });

      // Create worksheet from data
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);

      // Merge cells for the first row heading
      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merge first row across 3 columns
      ];

      // Set column widths
      worksheet["!cols"] = [
        { wch: 20 }, // Employee Number
        { wch: 30 }, // Employee Name
        { wch: 15 }, // Amount
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, `${dateRangeStr}`);

      // Convert workbook to buffer
      const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      // Convert buffer to base64 string
      const base64String = Buffer.from(excelBuffer).toString("base64");

      return {
        success: true,
        message: "Excel file fetched successfully",
        data: base64String,
      };
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        data: {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to get excel file",
        },
      });
    }
  });
const convertingIncentiveRouter = protectedProcedure
  .prefix("/converting")
  .tag("Converting Incentive")
  .router({
    createConvertingIncentive,
    getConvertingIncentives,
    updateConvertingIncentive,
    getExcelFile,
  });

export { convertingIncentiveRouter };
