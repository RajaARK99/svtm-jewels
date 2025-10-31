import { ORPCError } from "@orpc/server";
import { and, count, eq, ilike, inArray, or } from "drizzle-orm";
import z from "zod";
import { db } from "@/db";
import {
  employee,
  employeeInsertSchema,
  employeeSelectSchema,
  employeeUpdateSchema,
  user,
} from "@/db/schema";
import { protectedProcedure, publicProcedure } from "@/lib/orpc";

const createEmployee = protectedProcedure
  .route({
    path: "/create",
    method: "POST",
    summary: "Create a new employee",
    description: "Create a new employee",
  })
  .input(employeeInsertSchema)
  .output(
    z
      .object({
        success: z.boolean(),
        message: z.string(),
        data: employeeSelectSchema.nullish(),
      })
      .nullish(),
  )
  .handler(
    async ({
      input: {
        businessUnitId,
        departmentId,
        locationId,
        legalEntityId,
        reportingToUserId,
        dateOfJoining,
        jobTitleId,
        userId,
        salesIncentiveTypeId,
      },
    }) => {
      try {
        const newEmployee = await db
          .insert(employee)
          .values({
            businessUnitId,
            departmentId,
            locationId,
            legalEntityId,
            reportingToUserId,
            dateOfJoining: new Date(dateOfJoining),
            jobTitleId,
            userId,
            salesIncentiveTypeId,
          })
          .returning();
        return {
          success: true,
          message: "Employee created successfully",
          data: newEmployee[0],
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Failed to create employee",
          });
        }
      }
    },
  );

const getEmployee = publicProcedure
  .route({
    path: "/",
    method: "GET",
    summary: "Get all employees",
  })
  .input(
    z.object({
      filter: z
        .object({
          search: z.string().optional(),
          jobTitleId: z.string().array().optional(),
          businessUnitId: z.string().array().optional(),
          departmentId: z.string().array().optional(),
          locationId: z.string().array().optional(),
          legalEntityId: z.string().array().optional(),
          reportingToUserId: z.string().array().optional(),
          dateOfJoining: z.iso.date().array().optional(),
          userId: z.string().array().optional(),
          salesIncentiveTypeId: z.string().array().optional(),
        })
        .nullish(),
      pagination: z
        .object({
          page: z.number().optional(),
          limit: z.number().optional(),
        })
        .nullish(),
    }),
  )
  .output(
    z
      .object({
        data: z
          .array(
            employeeSelectSchema.extend({
              user: z
                .object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                })
                .nullish(),
              reportingToUser: z
                .object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                })
                .nullish(),
              jobTitle: z
                .object({
                  id: z.string(),
                  name: z.string(),
                })
                .nullish(),
              businessUnit: z
                .object({
                  id: z.string(),
                  name: z.string(),
                })
                .nullish(),
              department: z
                .object({
                  id: z.string(),
                  name: z.string(),
                })
                .nullish(),
              location: z
                .object({
                  id: z.string(),
                  name: z.string(),
                })
                .nullish(),
              legalEntity: z
                .object({
                  id: z.string(),
                  name: z.string(),
                })
                .nullish(),
              salesIncentiveType: z
                .object({
                  id: z.string(),
                  name: z.string(),
                })
                .nullish(),
            }),
          )
          .nullish(),
        total: z.number().nullish(),
        page: z.number().nullish(),
        limit: z.number().nullish(),
      })
      .nullish(),
  )
  .handler(async ({ input: { filter, pagination } }) => {
    // Build filter conditions - use AND logic (all filters must match)
    const filterConditions = [];

    // Handle search filter - search by name or email
    if (filter?.search) {
      const searchCondition = or(
        ilike(user.name, `%${filter.search}%`),
        ilike(user.email, `%${filter.search}%`),
      );
      const usersWithSearch = await db.query.user.findMany({
        where: searchCondition ?? undefined,
        columns: { id: true },
      });
      const userIds = usersWithSearch.map((u) => u.id);
      if (userIds.length > 0) {
        filterConditions.push(inArray(employee.userId, userIds));
      } else {
        // No users found with search pattern, return empty result early
        return {
          data: [],
          total: 0,
          page: pagination?.page ?? 1,
          limit: pagination?.limit ?? 10,
        };
      }
    }

    // Handle other filters
    if (filter?.jobTitleId && filter.jobTitleId.length > 0) {
      filterConditions.push(inArray(employee.jobTitleId, filter.jobTitleId));
    }
    if (filter?.businessUnitId && filter.businessUnitId.length > 0) {
      filterConditions.push(
        inArray(employee.businessUnitId, filter.businessUnitId),
      );
    }
    if (filter?.departmentId && filter.departmentId.length > 0) {
      filterConditions.push(
        inArray(employee.departmentId, filter.departmentId),
      );
    }
    if (filter?.locationId && filter.locationId.length > 0) {
      filterConditions.push(inArray(employee.locationId, filter.locationId));
    }
    if (filter?.legalEntityId && filter.legalEntityId.length > 0) {
      filterConditions.push(
        inArray(employee.legalEntityId, filter.legalEntityId),
      );
    }
    if (filter?.reportingToUserId && filter.reportingToUserId.length > 0) {
      filterConditions.push(
        inArray(employee.reportingToUserId, filter.reportingToUserId),
      );
    }
    if (filter?.dateOfJoining && filter.dateOfJoining.length > 0) {
      filterConditions.push(
        inArray(
          employee.dateOfJoining,
          filter.dateOfJoining.map((d) => new Date(d)),
        ),
      );
    }
    if (filter?.userId && filter.userId.length > 0) {
      filterConditions.push(inArray(employee.userId, filter.userId));
    }
    if (
      filter?.salesIncentiveTypeId &&
      filter.salesIncentiveTypeId.length > 0
    ) {
      filterConditions.push(
        inArray(employee.salesIncentiveTypeId, filter.salesIncentiveTypeId),
      );
    }
    const whereConditions =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const employees = await db.query.employee.findMany({
      where: whereConditions,
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        reportingToUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        jobTitle: {
          columns: {
            id: true,
            name: true,
          },
        },
        businessUnit: {
          columns: {
            id: true,
            name: true,
          },
        },
        department: {
          columns: {
            id: true,
            name: true,
          },
        },
        location: {
          columns: {
            id: true,
            name: true,
          },
        },
        legalEntity: {
          columns: {
            id: true,
            name: true,
          },
        },
        salesIncentiveType: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      limit: pagination?.limit ?? 10,
      offset: ((pagination?.page ?? 1) - 1) * (pagination?.limit ?? 10),
    });

    const total = await db
      .select({ count: count() })
      .from(employee)
      .where(whereConditions);

    return {
      data: employees ?? [],
      total: total[0].count,
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
    };
  });

const updateEmployee = protectedProcedure
  .route({
    path: "/:id",
    method: "PUT",
    summary: "Update an employee",
    description: "Update an employee",
  })
  .input(employeeUpdateSchema)
  .output(
    z
      .object({
        success: z.boolean(),
        message: z.string(),
        data: employeeSelectSchema.nullish(),
      })
      .nullish(),
  )
  .handler(
    async ({
      input: {
        id,
        businessUnitId,
        departmentId,
        locationId,
        legalEntityId,
        reportingToUserId,
        dateOfJoining,
        jobTitleId,
        userId,
        salesIncentiveTypeId,
      },
    }) => {
      try {
        const updatedEmployee = await db
          .update(employee)
          .set({
            businessUnitId,
            departmentId,
            locationId,
            legalEntityId,
            reportingToUserId,
            dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
            jobTitleId,
            userId,
            salesIncentiveTypeId,
          })
          .where(eq(employee.id, id))
          .returning();
        return {
          success: true,
          message: "Employee updated successfully",
          data: updatedEmployee[0],
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new ORPCError("BAD_REQUEST", {
            message: "Failed to update employee",
          });
        }
      }
    },
  );

const deleteEmployee = protectedProcedure
  .route({
    path: "/:id",
    method: "DELETE",
    summary: "Delete an employee",
    description: "Delete an employee",
  })
  .input(z.object({ id: z.string() }))
  .output(
    z
      .object({
        success: z.boolean(),
        message: z.string(),
        data: employeeSelectSchema.nullish(),
      })
      .nullish(),
  )
  .handler(async ({ input: { id } }) => {
    try {
      const deletedEmployee = await db
        .delete(employee)
        .where(eq(employee.id, id))
        .returning();
      return {
        success: true,
        message: "Employee deleted successfully",
        data: deletedEmployee[0],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Failed to delete employee",
        });
      }
    }
  });

const employeeRouter = protectedProcedure
  .prefix("/employee")
  .tag("Employee")
  .router({
    createEmployee,
    getEmployee,
    updateEmployee,
    deleteEmployee,
  });

export { employeeRouter };
