import { ORPCError } from "@orpc/server";
import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import z, { success } from "zod";
import { db } from "@/db";
import {
  user,
  userInsertSchema,
  userSelectSchema,
  userUpdateSchema,
} from "@/db/schema";
import { auth } from "@/lib/auth/auth";
import { protectedProcedure } from "@/lib/orpc";
import { throwError } from "@/lib/utils";

const createUser = protectedProcedure
  .route({
    path: "/create",
    method: "POST",
    summary: "Create a new user",
    description: "Create a new user",
  })
  .input(
    userInsertSchema
      .omit({
        emailVerified: true,
        banExpires: true,
        banned: true,
        banReason: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      })
      .extend({ password: z.string() }),
  )
  .output(
    z
      .object({
        success: z.boolean(),
        message: z.string(),
        data: userSelectSchema.nullish(),
      })
      .nullish(),
  )
  .handler(async ({ input: { name, email, role, password }, context }) => {
    try {
      const newUser = await auth.api.createUser({
        body: {
          email,
          name,
          password,
          role: role ?? "employee",
        },
        headers: context.headers,
      });
      return {
        success: true,
        message: "User created successfully",
        data: newUser.user,
      };
    } catch (error) {
      throwError(error);
    }
  });

const updateUser = protectedProcedure
  .route({
    path: "/update",
    method: "PUT",
    summary: "Update a user",
    description: "Update a user",
  })
  .input(
    userUpdateSchema.omit({
      emailVerified: true,
      banExpires: true,
      banned: true,
      banReason: true,
      createdAt: true,
      updatedAt: true,
      image: true,
    }),
  )
  .output(
    z
      .object({
        success: z.boolean(),
        message: z.string(),
        data: userSelectSchema.nullish(),
      })
      .nullish(),
  )
  .handler(async ({ input: { id, name, email, role }, context }) => {
    try {
      const updateData: {
        name?: string;
        role?: string;
        email?: string;
      } = {};

      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role ?? undefined;
      if (email !== undefined) updateData.email = email;

      const updatedUser = await auth.api.adminUpdateUser({
        body: {
          userId: id,
          data: updateData,
        },
        headers: context.headers,
      });

      return {
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      };
    } catch (error) {
     

      throw new ORPCError("BAD_REQUEST", {
        data: {
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to update user",
        },
      });
    }
  });

const deleteUser = protectedProcedure
  .route({
    path: "/delete",
    method: "DELETE",
    summary: "Delete a user",
    description: "Delete a user",
  })
  .input(z.object({ id: z.string() }))
  .output(
    z
      .object({
        success: z.boolean(),
        message: z.string(),
      })
      .nullish(),
  )
  .handler(async ({ input: { id } }) => {
    try {
      await auth.api.removeUser({
        body: {
          userId: id,
        },
      });
      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      throwError(error);
    }
  });

const getUsers = protectedProcedure
  .route({
    path: "/",
    method: "GET",
    summary: "Get list of users",
    description: "Get paginated and filtered list of users",
  })
  .input(
    z
      .object({
        filter: z
          .object({
            search: z.string().optional(),
            role: z
              .union([
                z.literal("user"),
                z.literal("admin"),
                z.literal("employee"),
              ])
              .optional(),
          })
          .optional(),
        pagination: z
          .object({
            page: z.number().min(1).default(1),
            limit: z.number().min(1).default(10),
          })
          .optional(),
      })
      .optional(),
  )
  .output(
    z
      .object({
        data: z.array(userSelectSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
      })
      .nullish(),
  )
  .handler(async ({ input }) => {
    try {
      const filter = input?.filter;
      const pagination = input?.pagination ?? { page: 1, limit: 10 };

      const filterConditions = [];

      // Search filter (name or email)
      if (filter?.search) {
        filterConditions.push(
          or(
            ilike(user.name, `%${filter.search}%`),
            ilike(user.email, `%${filter.search}%`),
          )!,
        );
      }

      // Role filter
      if (filter?.role && filter.role.length > 0) {
        filterConditions.push(inArray(user.role, [filter.role]));
      }

      const whereConditions =
        filterConditions.length > 0 ? and(...filterConditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(user)
        .where(whereConditions);
      const total = totalResult[0]?.count ?? 0;

      // Get paginated results
      const users = await db
        .select()
        .from(user)
        .where(whereConditions)
        .orderBy(sql`${user.createdAt} DESC`)
        .limit(pagination.limit)
        .offset((pagination.page - 1) * pagination.limit);

      return {
        data: users,
        total,
        page: pagination.page,
        limit: pagination.limit,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      throw new ORPCError("BAD_REQUEST", {
        message: "Failed to get users",
      });
    }
  });

const userRouter = protectedProcedure.prefix("/user").tag("User").router({
  createUser,
  updateUser,
  deleteUser,
  getUsers,
});

export { userRouter };
