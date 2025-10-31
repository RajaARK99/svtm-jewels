import { sql } from "drizzle-orm";
import { integer, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { employee } from "../employee";
import { convertingType } from "../options";

export const convertingIncentives = pgTable("converting_incentives", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: text("employee_id")
    .references(() => employee.id, { onDelete: "cascade" })
    .notNull(),
  date: timestamp("date").notNull(),
  typeId: text("type_id")
    .references(() => convertingType.id, { onDelete: "restrict" })
    .notNull(),
  weight: real("weight").notNull().default(0),
  amount: real("amount").notNull().default(0),
  visit: integer("visit").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
