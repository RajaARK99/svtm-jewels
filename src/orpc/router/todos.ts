import { os } from "@orpc/server";
import * as z from "zod";
import { db } from "@/db";
import { todos } from "@/db/schema";

export const listTodos = os.handler(() => {
  return db.query.todos.findMany();
});

export const addTodo = os
  .input(z.object({ name: z.string() }))
  .handler(async ({ input }) => {
    return await db.insert(todos).values({ name: input.name }).returning();
  });
